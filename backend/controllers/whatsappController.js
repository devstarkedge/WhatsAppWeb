const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const qrcode = require('qrcode');

const activeClients = new Map();

// Variable to hold io instance, set from server.js
let io;

const setIo = (socketIo) => {
  io = socketIo;
};

const initializeWhatsApp = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user;

    console.log('Initializing WhatsApp for projectId:', projectId, 'userId:', userId);

    // Validate project ownership
    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Create store to check session
    const store = new MongoStore({ mongoose: mongoose.connection, session: projectId });

    // Prevent multiple clients per project
    if (activeClients.has(projectId)) {
      const existingClient = activeClients.get(projectId);
      if (existingClient && !existingClient.info) {
        // Client exists but not ready (stuck initialization), destroy and clean up
        try {
          await existingClient.destroy();
        } catch (err) {
          console.error('Error destroying stuck client:', err);
        }
        activeClients.delete(projectId);
        activeClients.delete(`${projectId}_qr`);
      } else {
        return res.status(400).json({ message: 'Client already initializing' });
      }
    }

    // If already connected but no active client (e.g., after disconnect), allow reinitialization
    if (project.whatsappConnected && !activeClients.has(projectId)) {
      console.log(`Project ${projectId} marked as connected but no active client, allowing reinitialization`);
      // Reset the connected status to allow reinitialization
      await Project.findByIdAndUpdate(projectId, { whatsappConnected: false });
    } else if (project.whatsappConnected) {
      return res.status(400).json({ message: 'WhatsApp already connected' });
    }

    console.log(`⏰ Creating WhatsApp client for project ${projectId} at ${new Date().toISOString()}`);
    const client = new Client({
      dataPath: false,
      authStrategy: new RemoteAuth({
        store,
        backupSyncIntervalMs: 60000
      }),
      puppeteer: {
        userDataDir: null,
        headless: 'new', // Use new headless mode for better stability
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--max_old_space_size=4096',
          // Additional production optimizations
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript-harmony-shipping',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-crash-upload',
          '--disable-component-extensions-with-background-pages',
          '--disable-domain-reliability',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-background-downloads',
          // Additional performance optimizations
          '--disable-webgl',
          '--disable-3d-apis',
          '--disable-background-media-download',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--force-color-profile=srgb',
          '--disable-low-end-device-mode',
          '--disable-logging',
          '--disable-notifications',
          '--disable-permissions-api',
          '--disable-session-crashed-bubble',
          '--disable-infobars',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor,VizHitTestSurfaceLayer'
        ],
        timeout: 180000, // Reduce timeout to 3 minutes for faster failure detection
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--enable-automation']
      }
    });

    activeClients.set(projectId, client);

    // === QR Event ===
    client.on('qr', async (qr) => {
      const qrTime = Date.now();
      console.log(`📱 QR code generated for project ${projectId} at ${new Date(qrTime).toISOString()}`);
      try {
        const qrCodeDataURL = await qrcode.toDataURL(qr);
        activeClients.set(`${projectId}_qr`, qrCodeDataURL);
        console.log(`✅ QR code stored and emitting to project ${projectId}`);

        // Send QR ready event via Socket.IO
        io.to(projectId).emit('qr_ready', { qrCode: qrCodeDataURL });
        console.log(`📡 QR ready event emitted via Socket.IO for project ${projectId}`);
      } catch (error) {
        console.error(`❌ Error generating QR code for project ${projectId}:`, error);
        activeClients.delete(`${projectId}_qr`);
      }
    });

    // === Ready Event ===
    client.once('ready', async () => {
      console.log(`✅ WhatsApp client ready for project: ${projectId}`);

      const whatsappNumber = client.info.wid.user;

      // Check if this number is already connected to another project for this user
      const existingProject = await Project.findOne({
        user: userId,
        whatsappConnected: true,
        whatsappNumber: whatsappNumber,
        _id: { $ne: projectId }
      });

      if (existingProject) {
        console.log(`❌ WhatsApp number ${whatsappNumber} already connected to project ${existingProject._id}, disconnecting existing client`);

        // Disconnect the existing client
        const existingClient = activeClients.get(existingProject._id.toString());
        if (existingClient) {
          try {
            await existingClient.logout();
            await existingClient.destroy();
          } catch (err) {
            console.error('Error during existing client disconnect:', err);
          }
          activeClients.delete(existingProject._id.toString());
          activeClients.delete(`${existingProject._id.toString()}_qr`);
        }

        // Update the existing project in DB to disconnected
        await Project.findByIdAndUpdate(existingProject._id, {
          whatsappConnected: false,
          whatsappNumber: null
        });

        // Send disconnect event to the existing project's room
        io.to(existingProject._id.toString()).emit('disconnected', 'WhatsApp disconnected due to connection on another project');
      }

      // Update MongoDB project once
      await Project.findByIdAndUpdate(projectId, {
        whatsappConnected: true,
        whatsappNumber: whatsappNumber,
        updatedAt: new Date()
      });

      activeClients.delete(`${projectId}_qr`);

      // Send connected event via Socket.IO
      io.to(projectId).emit('connected');
    });

    // === Message Event ===
    client.on('message', (message) => {
      console.log(`📩 New message received for project ${projectId}:`, {
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        type: message.type
      });

      // Emit message to the project room via Socket.IO
      io.to(projectId).emit('message', {
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        type: message.type,
        id: message.id.id
      });
    });

    // === Auth Failure ===
    client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
    });

    // === Disconnection Handling ===
    client.on('disconnected', async (reason) => {
      console.warn(`⚠️ WhatsApp disconnected for ${projectId}:`, reason);

      try {
        await Project.findByIdAndUpdate(projectId, {
          whatsappConnected: false,
          whatsappNumber: null
        });
        console.log(`✅ Updated DB: whatsappConnected set to false, whatsappNumber cleared for project ${projectId}`);
      } catch (error) {
        console.error(`❌ Failed to update DB on disconnect for project ${projectId}:`, error);
      }

      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
    });

    console.log(`🚀 Starting WhatsApp client initialization for project ${projectId}`);
    const startTime = Date.now();
    console.log(`⏰ Initialization start time: ${new Date(startTime).toISOString()}`);

    console.log(`⏰ Calling client.initialize() for project ${projectId} at ${new Date().toISOString()}`);
    await client.initialize();
    console.log(`⏰ Client.initialize() returned for project ${projectId} at ${new Date().toISOString()}`);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`✅ Client.initialize() completed for project ${projectId} in ${duration} seconds`);

    res.json({ message: 'WhatsApp initialization started' });

  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    res.status(500).json({ message: 'Failed to initialize WhatsApp' });
  }
};

// === QR Retrieval ===
const getQRCode = (req, res) => {
  const { projectId } = req.params;
  const qrCode = activeClients.get(`${projectId}_qr`);
  if (!qrCode) return res.status(404).json({ message: 'QR code not available' });
  res.json({ qrCode });
};

// === Connection Status ===
const getConnectionStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user;

    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let hasSession = false;
    try {
      const collection = mongoose.connection.db.collection('sessions');
      const doc = await collection.findOne({ session: projectId });
      hasSession = !!doc;
    } catch (error) {
      console.error('Error checking session existence:', error);
      hasSession = false;
    }

    res.json({
      connected: project.whatsappConnected,
      hasSession
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({ message: 'Failed to get connection status' });
  }
};

// === Disconnect WhatsApp ===
const disconnectWhatsApp = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user;

    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const client = activeClients.get(projectId);

    if (client) {
      try {
        await client.logout();
        await client.destroy();
        console.log('Client logged out & destroyed successfully');
      } catch (err) {
        console.error('Error during disconnect:', err);
      }

      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
    }

    const store = new MongoStore({ mongoose: mongoose.connection, session: projectId });
    try {
      await store.delete();
      console.log('Session deleted from DB');
    } catch (err) {
      console.error('Error deleting session:', err);
    }

    await Project.findByIdAndUpdate(projectId, {
      whatsappConnected: false,
      whatsappNumber: null
    });

    res.json({ message: 'WhatsApp disconnected successfully' });

  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ message: 'Failed to disconnect WhatsApp' });
  }
};

module.exports = {
  initializeWhatsApp,
  getQRCode,
  getConnectionStatus,
  disconnectWhatsApp,
  setIo,
  activeClients
};
