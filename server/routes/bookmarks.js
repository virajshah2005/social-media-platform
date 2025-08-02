const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Get user bookmarks
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        b.id,
        b.type,
        b.created_at,
        p.id as post_id,
        p.caption as post_caption,
        p.media_urls as post_media_urls,
        p.created_at as post_created_at,
        u.username as post_username,
        u.full_name as post_full_name,
        u.profile_picture as post_profile_picture,
        s.id as story_id,
        s.caption as story_caption,
        s.created_at as story_created_at,
        su.username as story_username,
        su.full_name as story_full_name,
        su.profile_picture as story_profile_picture
      FROM bookmarks b
      LEFT JOIN posts p ON b.post_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN stories s ON b.story_id = s.id
      LEFT JOIN users su ON s.user_id = su.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    
    const [bookmarks] = await pool.execute(query, [userId]);
    
    const formattedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.type === 'post') {
        return {
          id: bookmark.id,
          type: 'post',
          created_at: bookmark.created_at,
          post: {
            id: bookmark.post_id,
            caption: bookmark.post_caption,
            media_urls: bookmark.post_media_urls ? JSON.parse(bookmark.post_media_urls) : [],
            created_at: bookmark.post_created_at,
            user: {
              username: bookmark.post_username,
              full_name: bookmark.post_full_name,
              profile_picture: bookmark.post_profile_picture
            }
          }
        };
      } else {
        return {
          id: bookmark.id,
          type: 'story',
          created_at: bookmark.created_at,
          story: {
            id: bookmark.story_id,
            caption: bookmark.story_caption,
            created_at: bookmark.story_created_at,
            user: {
              username: bookmark.story_username,
              full_name: bookmark.story_full_name,
              profile_picture: bookmark.story_profile_picture
            }
          }
        };
      }
    });
    
    res.json({ bookmarks: formattedBookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Add bookmark
router.post('/', auth, async (req, res) => {
  try {
    const { post_id, story_id, type } = req.body;
    const userId = req.user.id;
    
    if (!type || (!post_id && !story_id)) {
      return res.status(400).json({ error: 'Invalid bookmark data' });
    }
    
    // Check if bookmark already exists
    const [existingBookmark] = await pool.execute(
      'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ? AND story_id = ?',
      [userId, post_id || null, story_id || null]
    );
    
    if (existingBookmark.length > 0) {
      return res.status(400).json({ error: 'Bookmark already exists' });
    }
    
    // Verify post/story exists
    if (type === 'post' && post_id) {
      const [postCheck] = await pool.execute(
        'SELECT id FROM posts WHERE id = ?',
        [post_id]
      );
      
      if (postCheck.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
    }
    
    if (type === 'story' && story_id) {
      const [storyCheck] = await pool.execute(
        'SELECT id FROM stories WHERE id = ?',
        [story_id]
      );
      
      if (storyCheck.length === 0) {
        return res.status(404).json({ error: 'Story not found' });
      }
    }
    
    // Create bookmark
    const [result] = await pool.execute(
      'INSERT INTO bookmarks (user_id, post_id, story_id, type) VALUES (?, ?, ?, ?)',
      [userId, post_id || null, story_id || null, type]
    );
    
    res.status(201).json({ 
      message: 'Bookmark added successfully',
      bookmark_id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Remove bookmark
router.delete('/:bookmarkId', auth, async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user.id;
    
    // Check if bookmark belongs to user
    const [bookmarkCheck] = await pool.execute(
      'SELECT id FROM bookmarks WHERE id = ? AND user_id = ?',
      [bookmarkId, userId]
    );
    
    if (bookmarkCheck.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    // Delete bookmark
    await pool.execute(
      'DELETE FROM bookmarks WHERE id = ?',
      [bookmarkId]
    );
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Check if item is bookmarked
router.get('/check', auth, async (req, res) => {
  try {
    const { post_id, story_id } = req.query;
    const userId = req.user.id;
    
    if (!post_id && !story_id) {
      return res.status(400).json({ error: 'Post ID or Story ID required' });
    }
    
    const [bookmarkCheck] = await pool.execute(
      'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ? AND story_id = ?',
      [userId, post_id || null, story_id || null]
    );
    
    res.json({ 
      is_bookmarked: bookmarkCheck.length > 0,
      bookmark_id: bookmarkCheck.length > 0 ? bookmarkCheck[0].id : null
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ error: 'Failed to check bookmark status' });
  }
});

// Get bookmark statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [statsResult] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookmarks,
        COUNT(CASE WHEN type = 'post' THEN 1 END) as post_bookmarks,
        COUNT(CASE WHEN type = 'story' THEN 1 END) as story_bookmarks
      FROM bookmarks 
      WHERE user_id = ?
    `, [userId]);
    
    res.json({ stats: statsResult[0] });
  } catch (error) {
    console.error('Error fetching bookmark stats:', error);
    res.status(500).json({ error: 'Failed to fetch bookmark stats' });
  }
});

module.exports = router; 