import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiUser, FiHash } from 'react-icons/fi';
import api from '../../config/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getMediaUrl } from '../../utils/imageUtils';
import Avatar from '../../components/UI/Avatar';

const Search = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('global');

  const { data: searchData, isLoading, error } = useQuery(
    ['search', query, searchType],
    async () => {
      if (!query.trim()) return { users: [], posts: [], hashtags: [] };
      
      const response = await api.get(`/api/search/${searchType}`, {
        params: { q: query }
      });
      return response.data;
    },
    {
      enabled: !!query.trim(),
      staleTime: 5 * 60 * 1000,
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the query
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
          <FiSearch className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-social-text">Search</h1>
          <p className="text-social-textSecondary">Find people, posts, and hashtags</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for users, posts, or hashtags..."
            className="input pl-10"
          />
        </div>

        {/* Search Type Tabs */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setSearchType('global')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'global'
                ? 'bg-primary-500 text-white'
                : 'bg-social-card text-social-textSecondary hover:text-social-text'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSearchType('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'users'
                ? 'bg-primary-500 text-white'
                : 'bg-social-card text-social-textSecondary hover:text-social-text'
            }`}
          >
            Users
          </button>
          <button
            type="button"
            onClick={() => setSearchType('posts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'posts'
                ? 'bg-primary-500 text-white'
                : 'bg-social-card text-social-textSecondary hover:text-social-text'
            }`}
          >
            Posts
          </button>
          <button
            type="button"
            onClick={() => setSearchType('hashtags')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'hashtags'
                ? 'bg-primary-500 text-white'
                : 'bg-social-card text-social-textSecondary hover:text-social-text'
            }`}
          >
            Hashtags
          </button>
        </div>
      </form>

      {/* Search Results */}
      {query.trim() && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">Failed to search</p>
            </div>
          ) : (
            <>
              {/* Users */}
              {searchData?.users && searchData.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-social-text mb-4 flex items-center space-x-2">
                    <FiUser className="w-5 h-5" />
                    <span>Users</span>
                  </h3>
                  <div className="space-y-3">
                    {searchData.users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-social-card rounded-lg">
                        <Avatar
                          src={user.profile_picture || '/default-avatar.svg'}
                          alt={user.username}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-social-text">{user.full_name}</p>
                          <p className="text-sm text-social-textSecondary">@{user.username}</p>
                        </div>
                        <button className="btn btn-primary text-sm">Follow</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {searchData?.posts && searchData.posts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-social-text mb-4 flex items-center space-x-2">
                    {/* <FiImage className="w-5 h-5" /> */}
                    <span>Posts</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {searchData.posts.map((post) => (
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
                </div>
              )}

              {/* Hashtags */}
              {searchData?.hashtags && searchData.hashtags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-social-text mb-4 flex items-center space-x-2">
                    <FiHash className="w-5 h-5" />
                    <span>Hashtags</span>
                  </h3>
                  <div className="space-y-3">
                    {searchData.hashtags.map((hashtag) => (
                      <div key={hashtag.id} className="flex items-center justify-between p-3 bg-social-card rounded-lg">
                        <div>
                          <p className="font-medium text-social-text">#{hashtag.name}</p>
                          <p className="text-sm text-social-textSecondary">
                            {hashtag.posts_count} posts
                          </p>
                        </div>
                        <button className="btn btn-secondary text-sm">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {(!searchData?.users || searchData.users.length === 0) &&
               (!searchData?.posts || searchData.posts.length === 0) &&
               (!searchData?.hashtags || searchData.hashtags.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-social-border rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-8 h-8 text-social-textSecondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-social-text mb-2">No results found</h3>
                  <p className="text-social-textSecondary">
                    Try searching for something else
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search; 