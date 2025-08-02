const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        c.id,
        c.created_at,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        u.username,
        u.full_name,
        u.profile_picture,
        (
          SELECT JSON_OBJECT(
            'id', m.id,
            'content', m.content,
            'created_at', m.created_at,
            'sender_id', m.sender_id
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message
      FROM conversations c
      JOIN users u ON (
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END = u.id
      )
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.updated_at DESC
    `;
    
    const [conversations] = await pool.execute(query, [userId, userId, userId, userId]);
    
    // Parse last_message JSON for each conversation
    const formattedConversations = conversations.map(conv => ({
      ...conv,
      other_user: {
        id: conv.other_user_id,
        username: conv.username,
        full_name: conv.full_name,
        profile_picture: conv.profile_picture
      },
      last_message: conv.last_message ? JSON.parse(conv.last_message) : null
    }));
    
    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create a new conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { user_id } = req.body;
    const currentUserId = req.user.id;
    
    if (currentUserId === user_id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }
    
    // Check if conversation already exists
    const [existingConversation] = await pool.execute(
      'SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [currentUserId, user_id, user_id, currentUserId]
    );
    
    if (existingConversation.length > 0) {
      return res.status(400).json({ error: 'Conversation already exists' });
    }
    
    // Create new conversation
    const [result] = await pool.execute(
      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
      [currentUserId, user_id]
    );
    
    const conversationId = result.insertId;
    
    // Fetch the created conversation with user info
    const [conversationData] = await pool.execute(`
      SELECT 
        c.id,
        c.created_at,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        u.username,
        u.full_name,
        u.profile_picture
      FROM conversations c
      JOIN users u ON (
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END = u.id
      )
      WHERE c.id = ?
    `, [currentUserId, currentUserId, conversationId]);
    
    const conversation = conversationData[0];
    conversation.other_user = {
      id: conversation.other_user_id,
      username: conversation.username,
      full_name: conversation.full_name,
      profile_picture: conversation.profile_picture
    };
    
    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a specific conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Check if user is part of this conversation
    const [conversationCheck] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (conversationCheck.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Fetch messages
    const [messages] = await pool.execute(`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.user_id,
        u.username,
        u.full_name,
        u.profile_picture
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message to a conversation
router.post('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Check if user is part of this conversation
    const [conversationCheck] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (conversationCheck.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Insert message
    const [messageResult] = await pool.execute(
      'INSERT INTO messages (conversation_id, user_id, content) VALUES (?, ?, ?)',
      [conversationId, userId, content.trim()]
    );
    
    // Update conversation's updated_at timestamp
    await pool.execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversationId]
    );
    
    // Fetch the created message with user info
    const [messageData] = await pool.execute(`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.user_id,
        u.username,
        u.full_name,
        u.profile_picture
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [messageResult.insertId]);
    
    res.status(201).json({ message: messageData[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete a message
router.delete('/:conversationId/:messageId', auth, async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user.id;
    
    // Check if message belongs to user and is in the conversation
    const [messageCheck] = await pool.execute(`
      SELECT m.id FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = ? AND m.user_id = ? AND c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)
    `, [messageId, userId, conversationId, userId, userId]);
    
    if (messageCheck.length === 0) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }
    
    // Delete message
    await pool.execute('DELETE FROM messages WHERE id = ?', [messageId]);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Mark messages as read
router.put('/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Check if user is part of this conversation
    const [conversationCheck] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );
    
    if (conversationCheck.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Mark unread messages as read
    await pool.execute(`
      UPDATE messages 
      SET is_read = 1 
      WHERE conversation_id = ? AND user_id != ? AND is_read = 0
    `, [conversationId, userId]);
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router; 