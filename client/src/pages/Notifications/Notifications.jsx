import React from 'react';
import { useQuery } from 'react-query';
import { FiHeart, FiMessageCircle, FiUserPlus, FiAtSign } from 'react-icons/fi';
import api from '../../config/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Notifications = () => {
  const { data: notificationsData, isLoading, error } = useQuery(
    'notifications',
    async () => {
      const response = await api.get('/api/notifications');
      return response.data;
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  const notifications = notificationsData?.notifications || [];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="w-5 h-5 text-red-400" />;
      case 'comment':
        return <FiMessageCircle className="w-5 h-5 text-blue-400" />;
      case 'follow':
        return <FiUserPlus className="w-5 h-5 text-green-400" />;
      case 'mention':
        return <FiAtSign className="w-5 h-5 text-purple-400" />;
      default:
        return <FiHeart className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationText = (notification) => {
    const { type, from_user, content } = notification;
    const username = from_user?.username || 'Someone';
    
    switch (type) {
      case 'like':
        return `${username} liked your post`;
      case 'comment':
        return `${username} commented: "${content}"`;
      case 'follow':
        return `${username} started following you`;
      case 'mention':
        return `${username} mentioned you in a comment`;
      default:
        return content || 'You have a new notification';
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load notifications. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-social-text mb-2">Notifications</h1>
        <p className="text-social-textSecondary">Stay updated with your activity</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-8 h-8 text-social-textSecondary" />
          </div>
          <h3 className="text-lg font-semibold text-social-text mb-2">No notifications yet</h3>
          <p className="text-social-textSecondary">
            When you get likes, comments, or follows, they'll appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-4 rounded-lg border ${
                notification.is_read 
                  ? 'bg-social-card border-social-border' 
                  : 'bg-primary-500/10 border-primary-500/20'
              }`}
            >
              <div className="flex-shrink-0">
                {notification.from_user?.profile_picture ? (
                  <img
                    src={notification.from_user.profile_picture}
                    alt={notification.from_user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-social-border rounded-full flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-social-text">
                  {getNotificationText(notification)}
                </p>
                <p className="text-xs text-social-textSecondary mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {!notification.is_read && (
                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications; 