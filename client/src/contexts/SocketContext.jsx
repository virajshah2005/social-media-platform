import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const socketInstance = io(API_BASE_URL, {
        auth: { token },
      });

      // Socket event handlers
      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socketInstance.on('user_online', (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socketInstance.on('user_offline', (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socketInstance.on('receive_message', (message) => {
        // Handle incoming message
        if (message.conversation_id === activeConversation?.id) {
          // Update conversation messages
          activeConversation.messages.push(message);
          setActiveConversation({ ...activeConversation });
        }
        // Show notification if conversation is not active
        else {
          toast.success(`New message from ${message.sender_username}`);
        }
      });

      socketInstance.on('user_typing', ({ userId, username }) => {
        // Handle typing indicator
        if (activeConversation?.participants.some(p => p.id === userId)) {
          toast.success(`${username} is typing...`, {
            duration: 1000,
            position: 'bottom-center'
          });
        }
      });

      socketInstance.on('notification', (notification) => {
        // Handle real-time notifications
        toast.success(`${notification.from.username} ${notification.content}`);
      });

      socketInstance.on('error', (error) => {
        toast.error(error.message);
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  const sendMessage = (conversationId, recipientId, content) => {
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        recipientId,
        content
      });
    }
  };

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const setTyping = (conversationId, isTyping) => {
    if (socket) {
      socket.emit(
        isTyping ? 'typing_start' : 'typing_stop',
        { conversationId }
      );
    }
  };

  const value = {
    socket,
    onlineUsers,
    activeConversation,
    setActiveConversation,
    sendMessage,
    joinConversation,
    setTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
