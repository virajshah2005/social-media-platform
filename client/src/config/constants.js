// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'test' 
  ? 'http://localhost:5000' 
  : (import.meta?.env?.VITE_API_URL || 'http://localhost:5000');
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },
  
  // Users
  USERS: {
    PROFILE: (username) => `/api/users/${username}`,
    UPDATE_PROFILE: '/api/users/profile',
    FOLLOW: (userId) => `/api/follows/${userId}`,
    UNFOLLOW: (userId) => `/api/follows/${userId}`,
  },
  
  // Posts
  POSTS: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    DETAIL: (postId) => `/api/posts/${postId}`,
    DELETE: (postId) => `/api/posts/${postId}`,
    LIKE: (postId) => `/api/likes/post/${postId}`,
    UNLIKE: (postId) => `/api/likes/post/${postId}`,
    COMMENTS: (postId) => `/api/comments/post/${postId}`,
    CREATE_COMMENT: '/api/comments',
  },
  
  // Stories
  STORIES: {
    LIST: '/api/stories',
    CREATE: '/api/stories',
    DELETE: (storyId) => `/api/stories/${storyId}`,
    USER_STORIES: (username) => `/api/stories/user/${username}`,
  },
  
  // Messages
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    CREATE_CONVERSATION: '/api/messages/conversations',
    MESSAGES: (conversationId) => `/api/messages/${conversationId}`,
    SEND_MESSAGE: (conversationId) => `/api/messages/${conversationId}`,
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/api/search/global',
    USERS: '/api/search/users',
    POSTS: '/api/search/posts',
    HASHTAGS: '/api/search/hashtags',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`,
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/api/analytics',
    POST_ANALYTICS: (postId) => `/api/analytics/posts/${postId}`,
    FOLLOWER_ANALYTICS: '/api/analytics/followers',
  },
  
  // Bookmarks
  BOOKMARKS: {
    LIST: '/api/bookmarks',
    CREATE: '/api/bookmarks',
    DELETE: (bookmarkId) => `/api/bookmarks/${bookmarkId}`,
    CHECK: '/api/bookmarks/check',
    STATS: '/api/bookmarks/stats',
  },
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Social',
  VERSION: '1.0.0',
  DESCRIPTION: 'A modern social media platform',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi'],
  
  // UI Configuration
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  
  // Animation Durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Notification Durations
  TOAST_DURATION: 4000,
  
  // Cache Configuration
  CACHE_TIME: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  POST: {
    MAX_CAPTION_LENGTH: 2200,
    MAX_MEDIA_FILES: 10,
  },
  
  STORY: {
    MAX_CAPTION_LENGTH: 500,
    MAX_MEDIA_FILES: 10,
  },
  
  MESSAGE: {
    MAX_LENGTH: 1000,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid username or password.',
    USERNAME_TAKEN: 'Username is already taken.',
    EMAIL_TAKEN: 'Email is already registered.',
    WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  },
  
  POST: {
    CAPTION_TOO_LONG: 'Caption is too long.',
    NO_MEDIA: 'Please select at least one image or video.',
    TOO_MANY_FILES: 'Too many files selected.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    FILE_TOO_LARGE: 'File is too large.',
  },
  
  STORY: {
    CAPTION_TOO_LONG: 'Caption is too long.',
    NO_MEDIA: 'Please select at least one image or video.',
    TOO_MANY_FILES: 'Too many files selected.',
  },
  
  MESSAGE: {
    MESSAGE_TOO_LONG: 'Message is too long.',
    EMPTY_MESSAGE: 'Message cannot be empty.',
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  POST_DELETED: 'Post deleted successfully!',
  STORY_CREATED: 'Story created successfully!',
  STORY_DELETED: 'Story deleted successfully!',
  MESSAGE_SENT: 'Message sent!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  BOOKMARK_ADDED: 'Added to bookmarks!',
  BOOKMARK_REMOVED: 'Removed from bookmarks!',
  FOLLOWED: 'User followed successfully!',
  UNFOLLOWED: 'User unfollowed successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EXPLORE: '/explore',
  SEARCH: '/search',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  BOOKMARKS: '/bookmarks',
  SETTINGS: '/settings',
  PROFILE: (username) => `/${username}`,
  POST_DETAIL: (postId) => `/p/${postId}`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  APP_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ROUTES,
}; 