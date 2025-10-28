const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
const register = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    const { firstName, lastName, email, password, role } = req.body;
    console.log('destructured:', { firstName, lastName, email, password, role });

    // Validate required fields
    if (!firstName || !firstName.trim() || !email || !email.trim() || !password || !password.trim()) {
      console.log('Validation failed: missing or empty fields');
      return res.status(400).json({ message: 'First name, email, and password are required' });
    }

    // Lowercase email for consistency
    const lowerEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = { firstName: firstName.trim(), lastName: lastName.trim(), email: lowerEmail, password, role: role || 'admin' };
    console.log('creating user with:', userData);
    // Create user
    const user = new User(userData);
    console.log('user before save:', user);
    await user.save();
    console.log('user after save:', user);

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Lowercase email for consistency
    const lowerEmail = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

module.exports = {
  register,
  login,
  logout
};
