const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get user profile by username
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const username = req.params.username;
    const currentUserId = req.user?.id;

    const [users] = await pool.execute(`
      SELECT id, username, full_name, bio, profile_picture, cover_photo, website, location, 
             phone, gender, date_of_birth, is_verified, is_private, followers_count, 
             following_count, posts_count, created_at,
             ${currentUserId ? 'EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = users.id) as is_following' : 'FALSE as is_following'}
      FROM users 
      WHERE username = ?
    `, currentUserId ? [currentUserId, username] : [username]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    user.is_following = Boolean(user.is_following);

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, website, location, phone, gender, date_of_birth } = req.body;

    let profilePictureUrl = null;
    if (req.file) {
      profilePictureUrl = `/uploads/${req.file.filename}`;
    }

    const updateFields = [];
    const updateValues = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(website);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    if (date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(date_of_birth);
    }
    if (profilePictureUrl) {
      updateFields.push('profile_picture = ?');
      updateValues.push(profilePictureUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, bio, profile_picture, cover_photo, website, location, phone, gender, date_of_birth, is_verified, is_private, followers_count, following_count, posts_count, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [users] = await pool.execute(`
      SELECT id, username, full_name, profile_picture, is_verified, followers_count,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = users.id) as is_following
      FROM users 
      WHERE (username LIKE ? OR full_name LIKE ?) AND id != ?
      ORDER BY followers_count DESC, username ASC
      LIMIT ? OFFSET ?
    `, [req.user.id, `%${q}%`, `%${q}%`, req.user.id, parseInt(limit), offset]);

    res.json({
      users: users.map(u => ({ ...u, is_following: Boolean(u.is_following) })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get suggested users to follow
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get users that the current user is not following, ordered by follower count
    const [users] = await pool.execute(`
      SELECT id, username, full_name, profile_picture, is_verified, followers_count,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = users.id) as is_following
      FROM users 
      WHERE id != ? AND id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      )
      ORDER BY followers_count DESC, RAND()
      LIMIT ? OFFSET ?
    `, [req.user.id, req.user.id, req.user.id, parseInt(limit), offset]);

    res.json({
      users: users.map(u => ({ ...u, is_following: Boolean(u.is_following) })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router; 