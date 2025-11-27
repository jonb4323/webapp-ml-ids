const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({ email, password, role: 'user' });

    // Send db msg of user registration (name, email, and timestamp)
    res.status(201).json({ message: 'User registered successfully', userId: user.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: 'Email and password are required' }); }

    const user = await User.findByEmail(email);
    if (!user) { return res.status(401).json({ message: 'Invalid credentials Email or Password is Invalid' }); }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) { return res.status(401).json({ message: 'Invalid credentials Email or Password is Invalid' }); }

    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Send db msg of user login (name, email, and timestamp)
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) { return res.status(500).json({ message: 'Error logging out' }); }
    res.json({ message: 'Logout successful' });
  });
};
