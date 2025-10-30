const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  initializeWhatsApp,
  getQRCode,
  getConnectionStatus,
  disconnectWhatsApp
} = require('../controllers/whatsappController');

// All routes require authentication
router.use(auth);

// Initialize WhatsApp connection
router.post('/projects/:projectId/initialize', initializeWhatsApp);

// Get QR code for authentication
router.get('/projects/:projectId/qr', getQRCode);

// Get connection status
router.get('/projects/:projectId/status', getConnectionStatus);

// Disconnect WhatsApp
router.delete('/projects/:projectId/disconnect', disconnectWhatsApp);

module.exports = router;
