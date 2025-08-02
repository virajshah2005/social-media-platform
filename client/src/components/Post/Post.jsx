import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  FiHeart,
  FiMessageCircle,
  FiShare,
  FiMoreHorizontal,
  FiMapPin,
  FiUser,
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import PostActions from './PostActions';
import PostComments from './PostComments';
import Avatar from '../UI/Avatar';
import { getMediaUrl } from '../../utils/imageUtils';

const Post = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Like/Unlike mutation
  const likeMutation = useMutation(
    async () => {
      if (post.is_liked) {
        await axios.delete(`/api/likes/post/${post.id}`);
      } else {
        await axios.post(`/api/likes/post/${post.id}`);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        onUpdate?.();
      },
      onError: () => {
        toast.error('Failed to update like');
      },
    }
  );

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleShare = () => {
    navigator.share?.({
      title: `${post.user?.full_name} on Social`,
      text: post.caption,
      url: `${window.location.origin}/p/${post.id}`,
    }).catch(() => {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/p/${post.id}`);
      toast.success('Link copied to clipboard');
    });
  };

  return (
    <div className="bg-social-card rounded-xl border border-social-border overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/${post.user?.username}`}>
            <Avatar
                              src={post.user?.profile_picture || '/default-avatar.svg'}
              alt={post.user?.username}
              className="w-10 h-10"
            />
          </Link>
          <div>
            <Link to={`/${post.user?.username}`} className="hover:underline">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-social-text">
                  {post.user?.full_name}
                </span>
                {post.user?.is_verified && (
                  <span className="text-primary-500">✓</span>
                )}
              </div>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-social-textSecondary">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-3 h-3" />
                    <span>{post.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Post Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-social-border/50 transition-colors"
          >
            <FiMoreHorizontal className="w-5 h-5 text-social-textSecondary" />
          </button>
          {showActions && (
            <PostActions
              post={post}
              onClose={() => setShowActions(false)}
              onUpdate={onUpdate}
            />
          )}
        </div>
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className="px-4 pb-4">
          <p className="text-social-text whitespace-pre-wrap">{post.caption}</p>
        </div>
      )}

      {/* Post Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="relative">
          {post.media_urls.length === 1 ? (
            <img
              src={getMediaUrl(post.media_urls[0])}
              alt="Post media"
              className="w-full max-h-96 object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.media_urls.slice(0, 4).map((media, index) => (
                <img
                  key={index}
                  src={getMediaUrl(media)}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-3 border-t border-social-border">
        <div className="flex items-center justify-between text-sm text-social-textSecondary">
          <div className="flex items-center space-x-4">
            <span>{post.likes_count} likes</span>
            <span>{post.comments_count} comments</span>
          </div>
          <span>{post.shares_count} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-social-border">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={likeMutation.isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              post.is_liked
                ? 'text-red-500 hover:bg-red-500/10'
                : 'text-social-textSecondary hover:bg-social-border/50'
            }`}
          >
            <FiHeart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-social-textSecondary hover:bg-social-border/50 transition-colors"
          >
            <FiMessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-social-textSecondary hover:bg-social-border/50 transition-colors"
          >
            <FiShare className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <PostComments
          postId={post.id}
          commentsCount={post.comments_count}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default Post; 