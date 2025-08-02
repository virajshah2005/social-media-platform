import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiBookmark, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import api from '../../config/axios';
import Post from '../../components/Post/Post';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Avatar from '../../components/UI/Avatar';

const Bookmarks = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('all'); // 'all', 'posts', 'stories'
  const queryClient = useQueryClient();

  // Fetch bookmarks
  const { data: bookmarksData, isLoading, error } = useQuery(
    'bookmarks',
    async () => {
      const response = await api.get('/api/bookmarks');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation(
    async (bookmarkId) => {
      await api.delete(`/api/bookmarks/${bookmarkId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookmarks');
      },
    }
  );

  const bookmarks = bookmarksData?.bookmarks || [];

  // Filter bookmarks based on selected filter
  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (filter === 'all') return true;
    return bookmark.type === filter;
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load bookmarks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-social-text mb-2">Bookmarks</h1>
        <p className="text-social-textSecondary">Your saved content</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <FiGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FiList className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4 text-social-textSecondary" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-social-card border border-social-border rounded-lg px-3 py-1 text-sm text-social-text"
          >
            <option value="all">All</option>
            <option value="post">Posts</option>
            <option value="story">Stories</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBookmark className="w-8 h-8 text-social-textSecondary" />
          </div>
          <h3 className="text-lg font-semibold text-social-text mb-2">No bookmarks yet</h3>
          <p className="text-social-textSecondary">
            {filter === 'all' 
              ? 'Start saving posts and stories to see them here'
              : `No ${filter} bookmarks yet`
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="relative">
              {bookmark.type === 'post' ? (
                <Post 
                  post={bookmark.post} 
                  onUpdate={() => queryClient.invalidateQueries('bookmarks')}
                />
              ) : (
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar
                      src={bookmark.story.user.profile_picture || '/default-avatar.svg'}
                      alt={bookmark.story.user.full_name}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-social-text">{bookmark.story.user.full_name}</p>
                      <p className="text-sm text-social-textSecondary">@{bookmark.story.user.username}</p>
                    </div>
                  </div>
                  <p className="text-social-text mb-3">{bookmark.story.caption}</p>
                  <p className="text-xs text-social-textSecondary">
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => removeBookmarkMutation.mutate(bookmark.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove bookmark"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks; 