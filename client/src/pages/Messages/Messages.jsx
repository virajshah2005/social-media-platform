import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiSend, FiMoreVertical, FiImage, FiSmile } from 'react-icons/fi';
import api from '../../config/axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Avatar from '../../components/UI/Avatar';

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(
    'conversations',
    async () => {
      const response = await api.get('/api/messages/conversations');
      return response.data;
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['messages', selectedConversation?.id],
    async () => {
      if (!selectedConversation) return { messages: [] };
      const response = await api.get(`/api/messages/${selectedConversation.id}`);
      return response.data;
    },
    {
      refetchInterval: 5000, // Refetch every 5 seconds
      enabled: !!selectedConversation,
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (message) => {
      const response = await api.post(`/api/messages/${selectedConversation.id}`, {
        content: message
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', selectedConversation?.id]);
        setNewMessage('');
      },
    }
  );

  // Create conversation mutation
  const createConversationMutation = useMutation(
    async (userId) => {
      const response = await api.post('/api/messages/conversations', {
        user_id: userId
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('conversations');
        setShowNewConversation(false);
        setSelectedUser(null);
        // Select the new conversation
        if (data.conversation) {
          setSelectedConversation(data.conversation);
        }
      },
    }
  );

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (conversationsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-social-border bg-social-card">
        <div className="p-4 border-b border-social-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-social-text">Messages</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewConversation(true)}
            >
              New Message
            </Button>
          </div>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-social-textSecondary">
              <p>No conversations yet</p>
              <p className="text-sm">Start a conversation to see messages here</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-social-border cursor-pointer hover:bg-social-border/50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-primary-500/10' : ''
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={conversation.other_user?.profile_picture || '/default-avatar.svg'}
                    alt={conversation.other_user?.username}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-social-text truncate">
                        {conversation.other_user?.full_name}
                      </p>
                      <span className="text-xs text-social-textSecondary">
                        {formatTime(conversation.last_message?.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-social-textSecondary truncate">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-social-background">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-social-border bg-social-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={selectedConversation.other_user?.profile_picture || '/default-avatar.svg'}
                    alt={selectedConversation.other_user?.username}
                    size="sm"
                  />
                  <div>
                    <p className="font-semibold text-social-text">
                      {selectedConversation.other_user?.full_name}
                    </p>
                    <p className="text-sm text-social-textSecondary">
                      @{selectedConversation.other_user?.username}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-social-border">
                  <FiMoreVertical className="w-5 h-5 text-social-textSecondary" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-social-textSecondary">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.user_id === user?.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-social-card text-social-text'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.user_id === user?.id ? 'text-primary-100' : 'text-social-textSecondary'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-social-border bg-social-card">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-social-border text-social-textSecondary"
                >
                  <FiImage className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-social-border text-social-textSecondary"
                >
                  <FiSmile className="w-5 h-5" />
                </button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                  loading={sendMessageMutation.isLoading}
                >
                  <FiSend className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-social-textSecondary">
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <Modal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        title="New Message"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Search Users"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* User search results would go here */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {/* Mock users - in real app, this would be fetched from API */}
            <div className="p-3 rounded-lg hover:bg-social-border cursor-pointer">
              <div className="flex items-center space-x-3">
                <Avatar
                  src="/default-avatar.svg"
                  alt="User"
                  size="sm"
                />
                <div>
                  <p className="font-medium text-social-text">John Doe</p>
                  <p className="text-sm text-social-textSecondary">@johndoe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Messages; 