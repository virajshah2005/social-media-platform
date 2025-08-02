import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { FiX, FiImage, FiVideo, FiMapPin, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Avatar from '../UI/Avatar';

const CreatePost = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostMutation = useMutation(
    async (postData) => {
      const formData = new FormData();
      formData.append('caption', postData.caption);
      formData.append('location', postData.location);
      formData.append('tags', postData.tags);
      
      mediaFiles.forEach((file, index) => {
        formData.append('media', file);
      });

      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        toast.success('Post created successfully!');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create post');
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && mediaFiles.length === 0) {
      toast.error('Please add a caption or media');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostMutation.mutateAsync({
        caption,
        location,
        tags,
      });
      setCaption('');
      setLocation('');
      setTags('');
      setMediaFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were invalid. Please use images/videos under 10MB.');
    }

    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Post" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3 p-4 bg-social-card rounded-lg">
          <Avatar 
            src={user?.profile_picture}
            alt={user?.username}
            size="md"
          />
          <div>
            <p className="font-medium text-social-text">{user?.full_name}</p>
            <p className="text-sm text-social-textSecondary">@{user?.username}</p>
          </div>
        </div>

        {/* Caption Input */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 bg-social-card border border-social-border rounded-lg text-social-text placeholder-social-textSecondary resize-none"
          rows={4}
        />

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FiMapPin className="w-4 h-4 text-social-textSecondary" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="flex-1 bg-transparent text-social-text placeholder-social-textSecondary"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FiHash className="w-4 h-4 text-social-textSecondary" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add hashtags"
              className="flex-1 bg-transparent text-social-text placeholder-social-textSecondary"
            />
          </div>
        </div>

        {/* Media Upload */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer text-social-textSecondary hover:text-social-text">
            <FiImage className="w-5 h-5" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer text-social-textSecondary hover:text-social-text">
            <FiVideo className="w-5 h-5" />
            <span>Video</span>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || (!caption.trim() && mediaFiles.length === 0)}
            loading={isSubmitting}
          >
            Post
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePost; 