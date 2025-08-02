import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { FiPlus, FiPlay, FiPause } from 'react-icons/fi';
import api from '../../config/axios';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import LoadingSpinner from '../UI/LoadingSpinner';
import Avatar from '../UI/Avatar';

const Stories = () => {
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fetch stories
  const { data: storiesData, isLoading, error } = useQuery(
    'stories',
    async () => {
      const response = await api.get('/api/stories');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const stories = storiesData?.stories || [];

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setCurrentStoryIndex(0);
    setIsPlaying(true);
  };

  const handleNextStory = () => {
    if (selectedStory && currentStoryIndex < selectedStory.media.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setSelectedStory(null);
      setCurrentStoryIndex(0);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Stories Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-social-text">Stories</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateStory(true)}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Story
          </Button>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Create Story Button */}
          <div className="aspect-square bg-social-card border-2 border-dashed border-social-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mb-2">
              <FiPlus className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-social-textSecondary text-center">Add Story</p>
          </div>

          {/* Story Items */}
          {stories.map((story) => (
            <div
              key={story.id}
              className="aspect-square bg-social-card rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleStoryClick(story)}
            >
              <div className="relative w-full h-full">
                <img
                  src={story.media[0]?.url || '/default-story.jpg'}
                  alt={story.user?.username}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar
                      src={story.user?.profile_picture}
                      alt={story.user?.username}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-social-text">{story.user?.full_name}</p>
                      <p className="text-sm text-social-textSecondary">@{story.user?.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Story Modal */}
      <Modal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        title="Create Story"
        size="lg"
      >
        <div className="space-y-6">
          <div className="border-2 border-dashed border-social-border rounded-lg p-8 text-center">
            <FiPlus className="w-12 h-12 text-social-textSecondary mx-auto mb-4" />
            <p className="text-social-textSecondary mb-4">
              Click to upload photos or videos for your story
            </p>
            <Button variant="primary">
              Choose Files
            </Button>
          </div>
          
          <Input
            label="Caption"
            placeholder="Add a caption to your story..."
            rows={3}
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCreateStory(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">
              Post Story
            </Button>
          </div>
        </div>
      </Modal>

      {/* Story Viewer Modal */}
      <Modal
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        size="full"
      >
        {selectedStory && (
          <div className="relative w-full h-full bg-black">
            {/* Story Media */}
            <div className="relative w-full h-full">
              <img
                src={selectedStory.media[currentStoryIndex]?.url}
                alt="Story"
                className="w-full h-full object-contain"
              />
              
              {/* Progress Bar */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex space-x-1">
                  {selectedStory.media.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full flex-1 ${
                        index <= currentStoryIndex
                          ? 'bg-white'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
                </button>
              </div>

              {/* Navigation */}
              <button
                onClick={handlePreviousStory}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                ←
              </button>
              <button
                onClick={handleNextStory}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                →
              </button>

              {/* Story Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={selectedStory.user?.profile_picture}
                    alt={selectedStory.user?.username}
                    size="sm"
                  />
                  <div>
                    <p className="text-white font-medium">{selectedStory.user?.full_name}</p>
                    <p className="text-white/70 text-sm">{selectedStory.user?.username}</p>
                  </div>
                </div>
                {selectedStory.caption && (
                  <p className="text-white mt-2">{selectedStory.caption}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Stories; 