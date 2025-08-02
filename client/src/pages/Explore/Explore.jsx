import React from 'react';
import { useQuery } from 'react-query';
import api from '../../config/axios';
import Post from '../../components/Post/Post';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Explore = () => {
  // Fetch trending posts
  const { data: postsData, isLoading, error } = useQuery(
    'trending-posts',
    async () => {
      const response = await api.get('/api/posts/trending');
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
        <p className="text-red-400">Failed to load trending posts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-social-text mb-2">Explore</h1>
        <p className="text-social-textSecondary">Discover trending content</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-social-textSecondary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-social-text mb-2">No trending posts</h3>
          <p className="text-social-textSecondary">
            Check back later for trending content
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore; 