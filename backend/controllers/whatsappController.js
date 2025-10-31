// controllers/whatsappController.js
const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const qrcode = require("qrcode");

const activeClients = new Map();

// holds socket.io instance
let io;
const setIo = (socketIo) => {
  io = socketIo;
};

// Helper: create a MongoStore compatible with common wwebjs-mongo versions
const createStore = (sessionId) => {
  // Prefer passing both mongoose and native connection where supported
  // Also set a collectionName for clarity
  return new MongoStore(
    {
      mongoose: mongoose,
      mongo: mongoose.connection, // some versions expect `.db` internally
      collectionName: "whatsappSessions",
    },
    { session: sessionId }
  );
};

// ======================= Initialize WhatsApp =======================
const initializeWhatsApp = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user;

    console.log(`🚀 Init WA: project=${projectId}, user=${userId}`);

    // Ensure mongoose is connected
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      console.error("❌ Mongoose not connected. Make sure mongoose.connect() finished before init.");
      return res.status(500).json({ message: "Database not connected" });
    }

    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Prevent duplicate client creation (guard)
    const existingClient = activeClients.get(projectId);
    if (existingClient) {
      // If there's a puppeteer browser handle or client already initializing, refuse
      if (existingClient._initializing || existingClient.pupBrowser) {
        console.log(`⚠️ Client for project ${projectId} already initializing or active`);
        return res.status(400).json({ message: "Client already initializing or active" });
      }
      // Fallback: try to destroy stale client
      try {
        await existingClient.destroy();
      } catch (e) {
        console.warn("Error destroying stale client:", e);
      }
      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
    }

    if (project.whatsappConnected && !activeClients.has(projectId)) {
      // project marked connected but no active client — reset flag and allow reinit
      console.log(`Resetting whatsappConnected for project ${projectId} (stale)`);
      await Project.findByIdAndUpdate(projectId, { whatsappConnected: false, whatsappNumber: null });
    } else if (project.whatsappConnected) {
      return res.status(400).json({ message: "WhatsApp already connected" });
    }

    // Create session store (one-per-project)
    const store = createStore(projectId);

    // Create client with RemoteAuth and clientId = projectId so each project has isolated session
    const client = new Client({
      authStrategy: new RemoteAuth({
        store,
        clientId: projectId, // ensures unique remote session namespace per project
        backupSyncIntervalMs: 300000, // 5 minutes
      }),
      puppeteer: {
        headless: true,
        // Minimal, stable args — adjust for your hosting environment if needed
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--single-process",
        ],
        // NOTE: do NOT set ignoreHTTPSErrors or ignoreDefaultArgs here — they often break WA runtime context
      },
      takeoverOnConflict: false, // optional, prevents some session takeover behavior
    });

    // mark as initializing and store client immediately (prevents race)
    client._initializing = true;
    activeClients.set(projectId, client);

    // === EVENTS ===

    // Remote session saved to DB
    client.on("remote_session_saved", () => {
      console.log(`✅ Remote session saved for project ${projectId}`);
    });

    // QR generated
    client.on("qr", async (qr) => {
      try {
        const qrData = await qrcode.toDataURL(qr);
        activeClients.set(`${projectId}_qr`, qrData);
        if (io) io.to(projectId).emit("qr_ready", { qrCode: qrData });
        console.log(`📱 QR generated & emitted for project ${projectId}`);
      } catch (err) {
        console.error("Failed to convert QR to data URL:", err);
      }
    });

    // Authenticated (web session authenticated)
    client.on("authenticated", (auth) => {
      console.log(`🔐 Authenticated for project ${projectId}`);
    });

    // Auth failure
    client.on("auth_failure", (msg) => {
      console.error(`❌ Auth failure for project ${projectId}:`, msg);
      // Clean up active clients and QR
      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
      client._initializing = false;
    });

    // Generic error
    client.on("error", (err) => {
      console.error(`🛑 Client error for project ${projectId}:`, err);
    });

    // Incoming message routing to socket room
    client.on("message", (msg) => {
      try {
        if (io) {
          io.to(projectId).emit("message", {
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
            type: msg.type,
            id: msg.id && msg.id.id,
          });
        }
      } catch (e) {
        console.error("Error emitting incoming message:", e);
      }
    });

    // Ready: client has loaded WhatsApp web
    client.once("ready", async () => {
      try {
        console.log(`✅ WhatsApp client ready for project ${projectId}`);
        // mark initialized
        client._initializing = false;
        client._initialized = true;

        const waNumber = client.info && client.info.wid && client.info.wid.user;
        if (!waNumber) {
          console.warn("Ready event but no client.info.wid.user found");
        }

        // If this number is connected to another project for same user, disconnect old
        if (waNumber) {
          const existingProject = await Project.findOne({
            user: userId,
            whatsappConnected: true,
            whatsappNumber: waNumber,
            _id: { $ne: projectId },
          });

          if (existingProject) {
            console.log(`Detected same WA number connected to project ${existingProject._id}. disconnecting it.`);
            const existingClient = activeClients.get(existingProject._id.toString());
            if (existingClient) {
              try {
                await existingClient.logout();
              } catch (err) {
                console.warn("Error logging out existing client:", err);
              }
              try {
                await existingClient.destroy();
              } catch (err) {
                console.warn("Error destroying existing client:", err);
              }
            }
            activeClients.delete(existingProject._id.toString());
            activeClients.delete(`${existingProject._id.toString()}_qr`);

            await Project.findByIdAndUpdate(existingProject._id, {
              whatsappConnected: false,
              whatsappNumber: null,
            });

            if (io) io.to(existingProject._id.toString()).emit("disconnected", "WhatsApp disconnected due to connection on another project");
          }
        }

        // Update DB project
        await Project.findByIdAndUpdate(projectId, {
          whatsappConnected: true,
          whatsappNumber: waNumber || null,
          updatedAt: new Date(),
        });

        // remove QR cache and notify front-end
        activeClients.delete(`${projectId}_qr`);
        if (io) io.to(projectId).emit("connected");

      } catch (err) {
        console.error("Error in ready handler:", err);
      }
    });

    // Disconnected handler (browser closed / session lost)
    client.on("disconnected", async (reason) => {
      console.warn(`⚠️ WhatsApp disconnected for ${projectId}:`, reason);
      client._initialized = false;
      client._initializing = false;

      try {
        await Project.findByIdAndUpdate(projectId, {
          whatsappConnected: false,
          whatsappNumber: null,
        });
      } catch (e) {
        console.error("Error updating project on disconnect:", e);
      }

      // remove client from map
      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
    });

    // Start initialization (guarded)
    try {
      if (!client._initializing) {
        client._initializing = true;
      }
      await client.initialize();
      // initialize() resolved — initialization completed (ready event will be emitted later)
      console.log(`client.initialize() returned for project ${projectId}`);
    } catch (initErr) {
      console.error("WA init failed for project", projectId, initErr);
      client._initializing = false;
      // try to cleanup client
      try {
        await client.destroy();
      } catch (e) {
        /* ignore */
      }
      activeClients.delete(projectId);
      return res.status(500).json({ message: "Failed to initialize WhatsApp", error: String(initErr) });
    }

    return res.json({ message: "WhatsApp initialization started" });
  } catch (err) {
    console.error("Init WA error:", err);
    return res.status(500).json({ message: "Failed to initialize WhatsApp" });
  }
};

// ======================= Get QR Code =======================
const getQRCode = (req, res) => {
  const qr = activeClients.get(`${req.params.projectId}_qr`);
  if (!qr) return res.status(404).json({ message: "QR not available" });
  res.json({ qrCode: qr });
};

// ======================= Get Status =======================
const getConnectionStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, user: req.user });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check our whatsappSessions collection for session existence
    let hasSession = false;
    try {
      const coll = mongoose.connection.db.collection("whatsappSessions");
      const doc = await coll.findOne({ session: projectId });
      hasSession = !!doc;
    } catch (e) {
      console.warn("Could not inspect whatsappSessions collection:", e);
      // fallback: check default 'sessions' collection
      try {
        const coll = mongoose.connection.db.collection("sessions");
        const doc = await coll.findOne({ session: projectId });
        hasSession = !!doc;
      } catch (ee) {
        console.warn("Fallback sessions check failed:", ee);
        hasSession = false;
      }
    }

    res.json({
      connected: project.whatsappConnected,
      hasSession,
    });
  } catch (err) {
    console.error("Get connection status error:", err);
    res.status(500).json({ message: "Failed to get status" });
  }
};

// ======================= Disconnect WA =======================
const disconnectWhatsApp = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user;

    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const client = activeClients.get(projectId);
    if (client) {
      try {
        await client.logout();
      } catch (e) {
        console.warn("Error during client.logout():", e);
      }
      try {
        await client.destroy();
      } catch (e) {
        console.warn("Error during client.destroy():", e);
      }
      activeClients.delete(projectId);
      activeClients.delete(`${projectId}_qr`);
    }

    // Attempt to delete session from store (try both API and direct DB removal)
    try {
      const store = createStore(projectId);
      // some versions accept store.delete(sessionId)
      if (typeof store.delete === "function") {
        try {
          await store.delete(projectId);
          console.log("Session removed via store.delete()");
        } catch (e) {
          console.warn("store.delete(sessionId) failed, trying fallback DB delete:", e);
          // fallback to direct DB removal
          const coll = mongoose.connection.db.collection("whatsappSessions");
          await coll.deleteMany({ session: projectId });
        }
      } else {
        // fallback direct DB removal
        const coll = mongoose.connection.db.collection("whatsappSessions");
        await coll.deleteMany({ session: projectId });
      }
    } catch (e) {
      console.warn("Error cleaning session store:", e);
    }

    await Project.findByIdAndUpdate(projectId, {
      whatsappConnected: false,
      whatsappNumber: null,
    });

    return res.json({ message: "WhatsApp disconnected successfully" });
  } catch (err) {
    console.error("Disconnect WA error:", err);
    return res.status(500).json({ message: "Failed to disconnect WhatsApp" });
  }
};

// ======================= EXPORTS =======================
module.exports = {
  initializeWhatsApp,
  getQRCode,
  getConnectionStatus,
  disconnectWhatsApp,
  setIo,
  activeClients,
};
