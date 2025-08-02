const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Follow a user
router.post('/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const followerId = req.user.id;

    if (targetUserId == followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if target user exists
    const [users] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const [existingFollows] = await pool.execute(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, targetUserId]
    );

    if (existingFollows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add follow
    await pool.execute(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, targetUserId]
    );

    // Update follower counts
    await pool.execute(
      'UPDATE users SET followers_count = followers_count + 1 WHERE id = ?',
      [targetUserId]
    );

    await pool.execute(
      'UPDATE users SET following_count = following_count + 1 WHERE id = ?',
      [followerId]
    );

    // Create notification
    await pool.execute(
      'INSERT INTO notifications (user_id, from_user_id, type, content) VALUES (?, ?, ?, ?)',
      [targetUserId, followerId, 'follow', 'started following you']
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const followerId = req.user.id;

    // Check if following
    const [existingFollows] = await pool.execute(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, targetUserId]
    );

    if (existingFollows.length === 0) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove follow
    await pool.execute(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, targetUserId]
    );

    // Update follower counts
    await pool.execute(
      'UPDATE users SET followers_count = followers_count - 1 WHERE id = ?',
      [targetUserId]
    );

    await pool.execute(
      'UPDATE users SET following_count = following_count - 1 WHERE id = ?',
      [followerId]
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers of a user
router.get('/followers/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [followers] = await pool.execute(`
      SELECT u.id, u.username, u.full_name, u.profile_picture, u.is_verified, f.created_at,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, userId, parseInt(limit), offset]);

    res.json({
      followers: followers.map(f => ({ ...f, is_following: Boolean(f.is_following) })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: followers.length
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get users that a user is following
router.get('/following/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [following] = await pool.execute(`
      SELECT u.id, u.username, u.full_name, u.profile_picture, u.is_verified, f.created_at,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, userId, parseInt(limit), offset]);

    res.json({
      following: following.map(f => ({ ...f, is_following: Boolean(f.is_following) })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: following.length
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// Check if following a user
router.get('/check/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const followerId = req.user.id;

    const [follows] = await pool.execute(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, targetUserId]
    );

    res.json({ isFollowing: follows.length > 0 });
  } catch (error) {
    console.error('Check follow error:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

module.exports = router; 