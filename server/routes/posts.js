const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// Create a new post
router.post('/', authenticateToken, upload.array('media', 10), async (req, res) => {
  try {
    const { caption, location, tags } = req.body;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one media file is required' });
    }

    // Process media URLs
    const mediaUrls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video'
    }));

    // Process tags
    const processedTags = tags ? JSON.parse(tags) : [];

    // Insert post
    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, caption, media_urls, location, tags) VALUES (?, ?, ?, ?, ?)',
      [userId, caption, JSON.stringify(mediaUrls), location, JSON.stringify(processedTags)]
    );

    // Update user's post count
    await pool.execute(
      'UPDATE users SET posts_count = posts_count + 1 WHERE id = ?',
      [userId]
    );

    // Get the created post with user info
    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);

    const post = posts[0];
    post.media_urls = post.media_urls || [];
    post.tags = post.tags || [];

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts (feed)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get posts from users that the current user follows, plus their own posts
    const [posts] = await pool.execute(`
      SELECT DISTINCT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = p.user_id) as is_following
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN follows f ON f.following_id = p.user_id AND f.follower_id = ?
      WHERE p.user_id = ? OR f.follower_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, userId, userId, userId, parseInt(limit), offset]);

    // Process posts
    const processedPosts = posts.map(post => ({
      ...post,
      media_urls: post.media_urls || [],
      tags: post.tags || [],
      is_liked: Boolean(post.is_liked),
      is_following: Boolean(post.is_following)
    }));

    res.json({
      posts: processedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: processedPosts.length
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get trending posts
router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get trending posts (recent posts for now)
    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), offset]);

    // Process posts
    const processedPosts = posts.map(post => ({
      ...post,
      media_urls: post.media_urls || [],
      tags: post.tags || [],
      is_liked: Boolean(post.is_liked)
    }));

    res.json({
      posts: processedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: processedPosts.length
      }
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ error: 'Failed to get trending posts' });
  }
});

// Get a specific post
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = p.user_id) as is_following
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [userId, userId, postId]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];
    post.media_urls = post.media_urls || [];
    post.tags = post.tags || [];
    post.is_liked = Boolean(post.is_liked);
    post.is_following = Boolean(post.is_following);

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Update a post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { caption, location, tags } = req.body;

    // Check if post exists and belongs to user
    const [posts] = await pool.execute(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    // Update post
    await pool.execute(
      'UPDATE posts SET caption = ?, location = ?, tags = ? WHERE id = ?',
      [caption, location, JSON.stringify(tags || []), postId]
    );

    // Get updated post
    const [updatedPosts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [postId]);

    const post = updatedPosts[0];
    post.media_urls = post.media_urls || [];
    post.tags = post.tags || [];

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists and belongs to user
    const [posts] = await pool.execute(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    // Delete post (cascade will handle related data)
    await pool.execute('DELETE FROM posts WHERE id = ?', [postId]);

    // Update user's post count
    await pool.execute(
      'UPDATE users SET posts_count = posts_count - 1 WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get user's posts
router.get('/user/:username', authenticateToken, async (req, res) => {
  try {
    const username = req.params.username;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get user
    const [users] = await pool.execute(
      'SELECT id, username, full_name, profile_picture, is_verified FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get user's posts
    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, user.id, parseInt(limit), offset]);

    // Process posts
    const processedPosts = posts.map(post => ({
      ...post,
      media_urls: post.media_urls || [],
      tags: post.tags || [],
      is_liked: Boolean(post.is_liked)
    }));

    res.json({
      user,
      posts: processedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: processedPosts.length
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to get user posts' });
  }
});

module.exports = router; 