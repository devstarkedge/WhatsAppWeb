const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Logout
router.post('/logout', logout);

// Get current user
router.get('/me', auth, getMe);

module.exports = router;
