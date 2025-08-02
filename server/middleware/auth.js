const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, profile_picture, is_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return next(new Error('User not found'));
    }

    socket.user = users[0];
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, profile_picture, is_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await pool.execute(
        'SELECT id, username, email, full_name, profile_picture, is_verified FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  optionalAuth,
  authenticateSocket
}; 