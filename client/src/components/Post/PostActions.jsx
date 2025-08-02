import React from 'react';
import { FiEdit, FiTrash2, FiFlag, FiShare } from 'react-icons/fi';

const PostActions = ({ post, onClose, onUpdate }) => {
  const handleEdit = () => {
    // TODO: Implement edit functionality
    onClose();
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    onClose();
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    onClose();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 bg-social-card border border-social-border rounded-lg shadow-lg z-50 min-w-48">
      <div className="py-2">
        <button
          onClick={handleEdit}
          className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-social-border/50 transition-colors"
        >
          <FiEdit className="w-4 h-4" />
          <span>Edit Post</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-social-border/50 transition-colors"
        >
          <FiShare className="w-4 h-4" />
          <span>Share Post</span>
        </button>
        <button
          onClick={handleReport}
          className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-social-border/50 transition-colors"
        >
          <FiFlag className="w-4 h-4" />
          <span>Report Post</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center space-x-3 w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <FiTrash2 className="w-4 h-4" />
          <span>Delete Post</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions; 