import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiUser, FiUsers, FiGrid, FiBookmark, FiHeart, FiSettings } from 'react-icons/fi';
import api from '../../config/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getMediaUrl } from '../../utils/imageUtils';
import Avatar from '../../components/UI/Avatar';

const Profile = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('posts');

  const { data: profileData, isLoading, error } = useQuery(
    ['profile', username],
    async () => {
      const response = await api.get(`/api/users/profile/${username}`);
      return response.data;
    }
  );

  const { data: postsData } = useQuery(
    ['userPosts', username],
    async () => {
      const response = await api.get(`/api/posts/user/${username}`);
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load profile</p>
      </div>
    );
  }

  const user = profileData?.user;
  const posts = postsData?.posts || [];

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-social-textSecondary">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-social-card rounded-xl border border-social-border p-6">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <Avatar
              src={user.profile_picture}
              alt={user.username}
              size="lg"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-social-text">{user.username}</h1>
              {user.is_verified && (
                <span className="text-primary-500 text-xl">✓</span>
              )}
            </div>
            
            <div className="flex items-center space-x-6 mb-4">
              <div className="text-center">
                <div className="font-semibold text-social-text">{user.posts_count}</div>
                <div className="text-sm text-social-textSecondary">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-social-text">{user.followers_count}</div>
                <div className="text-sm text-social-textSecondary">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-social-text">{user.following_count}</div>
                <div className="text-sm text-social-textSecondary">following</div>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="font-semibold text-social-text mb-1">{user.full_name}</h2>
              {user.bio && (
                <p className="text-social-textSecondary mb-2">{user.bio}</p>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  {user.website}
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="btn btn-primary">Follow</button>
              <button className="btn btn-secondary">Message</button>
              <button className="btn btn-ghost">
                <FiSettings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-social-card rounded-xl border border-social-border">
        {/* Tab Navigation */}
        <div className="flex border-b border-social-border">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-social-textSecondary hover:text-social-text'
            }`}
          >
            <FiGrid className="w-5 h-5" />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'saved'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-social-textSecondary hover:text-social-text'
            }`}
          >
            <FiBookmark className="w-5 h-5" />
            <span>Saved</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'liked'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-social-textSecondary hover:text-social-text'
            }`}
          >
            <FiHeart className="w-5 h-5" />
            <span>Liked</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiGrid className="w-8 h-8 text-social-textSecondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-social-text mb-2">No posts yet</h3>
                  <p className="text-social-textSecondary">
                    When {user.username} shares photos and videos, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {posts.map((post) => (
                    <div key={post.id} className="aspect-square bg-social-border rounded-lg overflow-hidden">
                      {post.media_urls && post.media_urls.length > 0 && (
                        <img
                          src={getMediaUrl(post.media_urls[0])}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBookmark className="w-8 h-8 text-social-textSecondary" />
              </div>
              <h3 className="text-lg font-semibold text-social-text mb-2">No saved posts</h3>
              <p className="text-social-textSecondary">
                Save photos and videos that you want to see again.
              </p>
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-social-textSecondary" />
              </div>
              <h3 className="text-lg font-semibold text-social-text mb-2">No liked posts</h3>
              <p className="text-social-textSecondary">
                Posts you like will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 