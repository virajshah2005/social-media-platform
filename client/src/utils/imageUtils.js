import { API_BASE_URL } from '../config/constants';

/**
 * Get the full URL for an image by prepending the backend server URL
 * @param {string} imagePath - The image path (e.g., '/uploads/filename.png')
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If the path already starts with http/https, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Return the full URL
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Get the full URL for media files in posts
 * @param {Object} media - The media object with url property
 * @returns {string} - The full URL to the media file
 */
export const getMediaUrl = (media) => {
  if (!media || !media.url) return '';
  return getImageUrl(media.url);
}; 