const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../../syscalls/index.js');

exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword, adminKey } = req.body;

    if (!email || !password || !confirmPassword) {
      logger.warn('Invalid registration attempt', { email });
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      logger.warn('Invalid registration attempt', { email });
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.info('User tried logging in with an existing email', { email });
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Determine role based on adminKey
    let role = 'user';
    if (adminKey && adminKey === process.env.ADMIN_KEY) {
      role = 'admin';
    }

    const user = await User.create({ email, password, role });

    // Log user registration 
    const store = require('../utils/context.js').getStore() || {};
    logger.info('User registration', {
      syscall: 'AUTH_REGISTER',
      event_type: 'auth_register',
      outcome: 'success',
      email, 
      role, 
      userId: user.insertId,
      request_id: store.requestId,
      client_ip: req.ip,
      user_agent: req.get('user-agent'),
      session_id: req.sessionID
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.insertId });
  } catch (error) {
    const store = require('../utils/context.js').getStore() || {};
    logger.error('Registration error', { 
      syscall: 'AUTH_REGISTER', 
      event_type: 'auth_register',
      outcome: 'fail',
      failure_reason: 'server_error',
      error,
      request_id: store.requestId
    });
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: 'Email and password are required' }); }

    const user = await User.findByEmail(email);
    if (!user) { 
      logger.info('User tried logging in with invalid credentials', { email });
      return res.status(401).json({ message: 'Invalid credentials Email or Password is Invalid' }); 
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) { 
      // Get context to add structured fields
      const store = require('../utils/context.js').getStore() || {};
      logger.info('User tried logging in with invalid credentials', { 
        event_type: 'auth_login_attempt',
        email, 
        outcome: 'fail',
        failure_reason: 'invalid_password',
        request_id: store.requestId,
        client_ip: req.ip,
        user_agent: req.get('user-agent')
      });
      return res.status(401).json({ message: 'Invalid credentials Email or Password is Invalid' }); 
    }

    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Log user login syscall
    const store = require('../utils/context.js').getStore() || {};
    logger.info('User login successful', {
      syscall: 'AUTH_LOGIN',
      event_type: 'auth_login',
      outcome: 'success',
      email, 
      userId: user.id, 
      role: user.role, 
      request_id: store.requestId,
      client_ip: req.ip,
      user_agent: req.get('user-agent'),
      session_id: req.sessionID
    });

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    const store = require('../utils/context.js').getStore() || {};
    logger.error('Login error', { 
      syscall: 'AUTH_LOGIN', 
      event_type: 'auth_login',
      outcome: 'fail',
      failure_reason: 'server_error',
      error,
      request_id: store.requestId
    });
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;
    if (!email || !password || !adminKey) { return res.status(400).json({ message: 'Email, password and key are required' }); }

    const user = await User.findByEmail(email);
    if (!user) { 
      logger.error('Admin user attempted sign-in failed', { email })
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) { 
      logger.error('Admin user attempted sign-in failed', { email })
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    if (adminKey !== process.env.ADMIN_KEY) { 
      logger.error('Admin user attempted sign-in failed', { email })
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    // Grant admin role for this session/token since key was provided
    const effectiveRole = 'admin';

    // Set session
    req.session.userId = user.id;
    req.session.userRole = effectiveRole;

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: effectiveRole },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Log admin login syscall
    logger.info('Admin login', {
      syscall: 'AUTH_ADMIN_LOGIN',
      context: { email, userId: user.id, role: effectiveRole, timestamp: new Date().toISOString() }
    });

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: effectiveRole } });
  } catch (error) {
    logger.error('Admin login error', { syscall: 'AUTH_ADMIN_LOGIN', error });
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.logout = (req, res) => {
  const userId = req.session.userId;
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error', { syscall: 'AUTH_LOGOUT', error: err });
      return res.status(500).json({ message: 'Error logging out' });
    }
    logger.info('User logout', {
      syscall: 'AUTH_LOGOUT',
      context: { userId, timestamp: new Date().toISOString() }
    });
    res.json({ message: 'Logout successful' });
  });
};
