import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiSend, FiHeart } from 'react-icons/fi';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../UI/Avatar';

const PostComments = ({ postId, commentsCount, onUpdate }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: commentsData, isLoading } = useQuery(
    ['comments', postId],
    async () => {
      const response = await api.get(`/api/comments/post/${postId}`);
      return response.data;
    }
  );

  const addCommentMutation = useMutation(
    async (content) => {
      const response = await api.post('/api/comments', {
        postId,
        content,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        setNewComment('');
        onUpdate?.();
      },
    }
  );

  const toggleCommentLikeMutation = useMutation(
    async ({ commentId, isLiked }) => {
      if (isLiked) {
        await api.delete(`/api/likes/comment/${commentId}`);
      } else {
        await api.post(`/api/likes/comment/${commentId}`);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
      },
    }
  );

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate(newComment);
  };

  const handleLikeComment = (commentId, isLiked) => {
    toggleCommentLikeMutation.mutate({ commentId, isLiked });
  };

  const comments = commentsData?.comments || [];

  return (
    <div className="border-t border-social-border">
      {/* Comment Input */}
      <div className="p-4">
        <form onSubmit={handleSubmitComment} className="flex space-x-3">
          <Avatar
                            src={user?.profile_picture || '/default-avatar.svg'}
            alt={user?.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-social-bg border border-social-border rounded-lg px-3 py-2 text-sm text-social-text placeholder-social-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || addCommentMutation.isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-400 disabled:opacity-50"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="px-4 pb-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-social-textSecondary py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar
                  src={comment.profile_picture || '/default-avatar.svg'}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-social-bg rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-social-text text-sm">
                        {comment.full_name}
                      </span>
                      {comment.is_verified && (
                        <span className="text-primary-500 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-social-text text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-social-textSecondary">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.is_liked)}
                      className={`flex items-center space-x-1 hover:text-social-text transition-colors ${
                        comment.is_liked ? 'text-red-500' : ''
                      }`}
                    >
                      <FiHeart className={`w-3 h-3 ${comment.is_liked ? 'fill-current' : ''}`} />
                      <span>{comment.likes_count}</span>
                    </button>
                    <span>Reply</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComments; 