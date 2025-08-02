const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    const userId = req.user.id;

    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }

    // Check if post exists
    const [posts] = await pool.execute(
      'SELECT id, user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];

    // Insert comment
    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [postId, userId, content, parentId || null]
    );

    // Update post comment count
    await pool.execute(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?',
      [postId]
    );

    // Get the created comment with user info
    const [comments] = await pool.execute(`
      SELECT c.*, u.username, u.full_name, u.profile_picture, u.is_verified
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    const comment = comments[0];

    // Create notification if not commenting on own post
    if (post.user_id !== userId) {
      await pool.execute(
        'INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id, content) VALUES (?, ?, ?, ?, ?, ?)',
        [post.user_id, userId, 'comment', postId, comment.id, 'commented on your post']
      );
    }

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get comments for a post
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [comments] = await pool.execute(`
      SELECT c.*, u.username, u.full_name, u.profile_picture, u.is_verified,
             EXISTS(SELECT 1 FROM likes WHERE comment_id = c.id AND user_id = ?) as is_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, postId, parseInt(limit), offset]);

    // Get replies for each comment
    for (let comment of comments) {
      const [replies] = await pool.execute(`
        SELECT c.*, u.username, u.full_name, u.profile_picture, u.is_verified,
               EXISTS(SELECT 1 FROM likes WHERE comment_id = c.id AND user_id = ?) as is_liked
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ?
        ORDER BY c.created_at ASC
        LIMIT 5
      `, [req.user.id, comment.id]);

      comment.replies = replies;
      comment.is_liked = Boolean(comment.is_liked);
      comment.replies.forEach(reply => {
        reply.is_liked = Boolean(reply.is_liked);
      });
    }

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: comments.length
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Update a comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if comment exists and belongs to user
    const [comments] = await pool.execute(
      'SELECT id FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    // Update comment
    await pool.execute(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, commentId]
    );

    // Get updated comment
    const [updatedComments] = await pool.execute(`
      SELECT c.*, u.username, u.full_name, u.profile_picture, u.is_verified
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComments[0]
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if comment exists and belongs to user
    const [comments] = await pool.execute(
      'SELECT id, post_id FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    const comment = comments[0];

    // Delete comment (cascade will handle replies)
    await pool.execute('DELETE FROM comments WHERE id = ?', [commentId]);

    // Update post comment count
    await pool.execute(
      'UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?',
      [comment.post_id]
    );

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router; 