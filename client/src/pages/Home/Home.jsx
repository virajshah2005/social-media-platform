import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiPlus, FiHeart, FiMessageCircle, FiShare, FiMoreHorizontal } from 'react-icons/fi';
import api from '../../config/axios';
import Post from '../../components/Post/Post';
import CreatePost from '../../components/CreatePost/CreatePost';
import Stories from '../../components/Stories/Stories';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Avatar from '../../components/UI/Avatar';

const Home = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Fetch posts
  const { data: postsData, isLoading, error, refetch } = useQuery(
    'posts',
    async () => {
      const response = await api.get('/api/posts');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const posts = postsData?.posts || [];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load posts. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="btn btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <div className="flex items-center space-x-4 p-4 bg-social-card rounded-xl border border-social-border">
        <Avatar size="md" />
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex-1 text-left text-social-textSecondary bg-social-bg rounded-lg px-4 py-2 hover:bg-social-border/50 transition-colors"
        >
          What's on your mind?
        </button>
        <button
          onClick={() => setShowCreatePost(true)}
          className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Stories */}
      <Stories />

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 text-social-textSecondary" />
            </div>
            <h3 className="text-lg font-semibold text-social-text mb-2">No posts yet</h3>
            <p className="text-social-textSecondary mb-4">
              Follow some people to see their posts here
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn btn-primary"
            >
              Create your first post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <Post key={post.id} post={post} onUpdate={refetch} />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default Home; 