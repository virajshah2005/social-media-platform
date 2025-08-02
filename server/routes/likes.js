const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Like a post
router.post('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // Check if post exists
    const [posts] = await pool.execute(
      'SELECT id, user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];

    // Check if already liked
    const [existingLikes] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (existingLikes.length > 0) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // Add like
    await pool.execute(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );

    // Update post like count
    await pool.execute(
      'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
      [postId]
    );

    // Create notification if not liking own post
    if (post.user_id !== userId) {
      await pool.execute(
        'INSERT INTO notifications (user_id, from_user_id, type, post_id, content) VALUES (?, ?, ?, ?, ?)',
        [post.user_id, userId, 'like', postId, 'liked your post']
      );
    }

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike a post
router.delete('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // Check if like exists
    const [existingLikes] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (existingLikes.length === 0) {
      return res.status(400).json({ error: 'Post not liked' });
    }

    // Remove like
    await pool.execute(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    // Update post like count
    await pool.execute(
      'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
      [postId]
    );

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// Like a comment
router.post('/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // Check if comment exists
    const [comments] = await pool.execute(
      'SELECT id, user_id FROM comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = comments[0];

    // Check if already liked
    const [existingLikes] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND comment_id = ?',
      [userId, commentId]
    );

    if (existingLikes.length > 0) {
      return res.status(400).json({ error: 'Comment already liked' });
    }

    // Add like
    await pool.execute(
      'INSERT INTO likes (user_id, comment_id) VALUES (?, ?)',
      [userId, commentId]
    );

    // Update comment like count
    await pool.execute(
      'UPDATE comments SET likes_count = likes_count + 1 WHERE id = ?',
      [commentId]
    );

    // Create notification if not liking own comment
    if (comment.user_id !== userId) {
      await pool.execute(
        'INSERT INTO notifications (user_id, from_user_id, type, comment_id, content) VALUES (?, ?, ?, ?, ?)',
        [comment.user_id, userId, 'like_comment', commentId, 'liked your comment']
      );
    }

    res.json({ message: 'Comment liked successfully' });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Unlike a comment
router.delete('/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // Check if like exists
    const [existingLikes] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND comment_id = ?',
      [userId, commentId]
    );

    if (existingLikes.length === 0) {
      return res.status(400).json({ error: 'Comment not liked' });
    }

    // Remove like
    await pool.execute(
      'DELETE FROM likes WHERE user_id = ? AND comment_id = ?',
      [userId, commentId]
    );

    // Update comment like count
    await pool.execute(
      'UPDATE comments SET likes_count = likes_count - 1 WHERE id = ?',
      [commentId]
    );

    res.json({ message: 'Comment unliked successfully' });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

// Get likes for a post
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [likes] = await pool.execute(`
      SELECT l.*, u.username, u.full_name, u.profile_picture, u.is_verified
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [postId, parseInt(limit), offset]);

    res.json({
      likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: likes.length
      }
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ error: 'Failed to get post likes' });
  }
});

// Get likes for a comment
router.get('/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [likes] = await pool.execute(`
      SELECT l.*, u.username, u.full_name, u.profile_picture, u.is_verified
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.comment_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [commentId, parseInt(limit), offset]);

    res.json({
      likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: likes.length
      }
    });
  } catch (error) {
    console.error('Get comment likes error:', error);
    res.status(500).json({ error: 'Failed to get comment likes' });
  }
});

module.exports = router; 