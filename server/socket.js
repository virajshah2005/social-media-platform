const socketIo = require('socket.io');
const { authenticateSocket } = require('./middleware/auth');
const { pool } = require('./config/database');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Store online users
  const onlineUsers = new Map();

  // Socket middleware for authentication
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);

    // Update user's online status
    await pool.execute(
      'UPDATE users SET is_online = 1, last_active = NOW() WHERE id = ?',
      [userId]
    );

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Handle private messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content, conversationId } = data;
        const senderId = userId;

        // Save message to database
        const [result] = await pool.execute(
          'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
          [conversationId, senderId, content]
        );

        const messageId = result.insertId;

        // Get message details
        const [messages] = await pool.execute(`
          SELECT m.*, u.username, u.full_name, u.profile_picture 
          FROM messages m 
          JOIN users u ON m.sender_id = u.id 
          WHERE m.id = ?
        `, [messageId]);

        const message = messages[0];

        // Send to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', message);
        }

        // Send back to sender
        socket.emit('message_sent', message);

        // Create notification
        await pool.execute(
          'INSERT INTO notifications (user_id, from_user_id, type, content) VALUES (?, ?, ?, ?)',
          [recipientId, senderId, 'message', 'sent you a message']
        );

        // Notify recipient
        io.to(`user:${recipientId}`).emit('notification', {
          type: 'message',
          from: socket.user,
          content: 'sent you a message'
        });
      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: socket.user.id
      });
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      
      // Update user's offline status and last active time
      await pool.execute(
        'UPDATE users SET is_online = 0, last_active = NOW() WHERE id = ?',
        [userId]
      );
    });
  });

  return io;
}

module.exports = initializeSocket;
