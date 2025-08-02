import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Post from '../../components/Post/Post';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const { data: postData, isLoading, error } = useQuery(
    ['post', postId],
    async () => {
      const response = await axios.get(`/api/posts/${postId}`);
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
        <p className="text-red-400">Failed to load post</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  const post = postData?.post;

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-social-textSecondary">Post not found</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-social-textSecondary hover:text-social-text transition-colors"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Post */}
      <Post post={post} />
    </div>
  );
};

export default PostDetail; 