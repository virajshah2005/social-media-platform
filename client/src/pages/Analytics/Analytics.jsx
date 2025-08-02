import React from 'react';
import { useQuery } from 'react-query';
import { FiTrendingUp, FiUsers, FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi';
import api from '../../config/axios';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Analytics = () => {
  const { data: analytics, isLoading, error } = useQuery(
    'analytics',
    async () => {
      const response = await api.get('/api/analytics');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load analytics. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-social-text mb-2">Analytics</h1>
        <p className="text-social-textSecondary">Track your social media performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-social-textSecondary">Total Posts</p>
              <p className="text-xl font-bold text-social-text">{analytics?.totalPosts || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center">
              <FiHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-social-textSecondary">Total Likes</p>
              <p className="text-xl font-bold text-social-text">{analytics?.totalLikes || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-social-textSecondary">Total Comments</p>
              <p className="text-xl font-bold text-social-text">{analytics?.totalComments || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-social-textSecondary">Total Views</p>
              <p className="text-xl font-bold text-social-text">{analytics?.totalViews || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-social-text mb-4">Followers</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-social-textSecondary">Total Followers</span>
              <span className="font-semibold text-social-text">{analytics?.totalFollowers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-social-textSecondary">Following</span>
              <span className="font-semibold text-social-text">{analytics?.totalFollowing || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-social-textSecondary">Growth Rate</span>
              <span className="font-semibold text-green-400">+{analytics?.growthRate || 0}%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-social-text mb-4">Engagement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-social-textSecondary">Engagement Rate</span>
              <span className="font-semibold text-social-text">{analytics?.engagementRate || 0}%</span>
            </div>
            <div className="w-full bg-social-border rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${Math.min(analytics?.engagementRate || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Posts Performance */}
      <Card>
        <h3 className="text-lg font-semibold text-social-text mb-4">Recent Posts Performance</h3>
        {analytics?.recentPosts && analytics.recentPosts.length > 0 ? (
          <div className="space-y-4">
            {analytics.recentPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-social-bg rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-social-text font-medium truncate">
                    {post.caption || 'No caption'}
                  </p>
                  <p className="text-xs text-social-textSecondary">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <FiHeart className="w-4 h-4 text-red-400" />
                    <span>{post.likes_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiMessageCircle className="w-4 h-4 text-blue-400" />
                    <span>{post.comments_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiEye className="w-4 h-4 text-green-400" />
                    <span>{post.views_count}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-social-textSecondary">No posts yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics; 