const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search posts
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.caption LIKE ? OR p.location LIKE ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, `%${q}%`, `%${q}%`, parseInt(limit), offset]);

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
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Search hashtags
router.get('/hashtags', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [hashtags] = await pool.execute(`
      SELECT h.*, COUNT(ph.post_id) as recent_posts_count
      FROM hashtags h
      LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
      WHERE h.name LIKE ?
      GROUP BY h.id
      ORDER BY h.posts_count DESC, h.name ASC
      LIMIT ? OFFSET ?
    `, [`%${q}%`, parseInt(limit), offset]);

    res.json({
      hashtags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: hashtags.length
      }
    });
  } catch (error) {
    console.error('Search hashtags error:', error);
    res.status(500).json({ error: 'Failed to search hashtags' });
  }
});

// Get posts by hashtag
router.get('/hashtag/:hashtag', authenticateToken, async (req, res) => {
  try {
    const hashtag = req.params.hashtag.replace('#', '');
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN post_hashtags ph ON p.id = ph.post_id
      JOIN hashtags h ON ph.hashtag_id = h.id
      WHERE h.name = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, hashtag, parseInt(limit), offset]);

    // Process posts
    const processedPosts = posts.map(post => ({
      ...post,
      media_urls: post.media_urls || [],
      tags: post.tags || [],
      is_liked: Boolean(post.is_liked)
    }));

    res.json({
      hashtag,
      posts: processedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: processedPosts.length
      }
    });
  } catch (error) {
    console.error('Get hashtag posts error:', error);
    res.status(500).json({ error: 'Failed to get hashtag posts' });
  }
});

// Global search (posts, users, hashtags)
router.get('/global', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search users
    const [users] = await pool.execute(`
      SELECT id, username, full_name, profile_picture, is_verified, followers_count,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = users.id) as is_following
      FROM users 
      WHERE (username LIKE ? OR full_name LIKE ?) AND id != ?
      ORDER BY followers_count DESC
      LIMIT 5
    `, [req.user.id, `%${q}%`, `%${q}%`, req.user.id]);

    // Search posts
    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.caption LIKE ?
      ORDER BY p.likes_count DESC, p.created_at DESC
      LIMIT 5
    `, [req.user.id, `%${q}%`]);

    // Search hashtags
    const [hashtags] = await pool.execute(`
      SELECT h.*, COUNT(ph.post_id) as recent_posts_count
      FROM hashtags h
      LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
      WHERE h.name LIKE ?
      GROUP BY h.id
      ORDER BY h.posts_count DESC
      LIMIT 5
    `, [`%${q}%`]);

    // Process posts
    const processedPosts = posts.map(post => ({
      ...post,
      media_urls: post.media_urls || [],
      tags: post.tags || [],
      is_liked: Boolean(post.is_liked)
    }));

    res.json({
      users: users.map(u => ({ ...u, is_following: Boolean(u.is_following) })),
      posts: processedPosts,
      hashtags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length + posts.length + hashtags.length
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Failed to perform global search' });
  }
});

module.exports = router; 