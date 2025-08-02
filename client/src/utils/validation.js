import { VALIDATION_RULES } from '../config/constants';

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return 'Invalid email format';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`;
  }
  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    return `Password cannot exceed ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`;
  }
  return '';
};

export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`;
  }
  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    return `Username cannot exceed ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`;
  }
  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return '';
};

export const validatePostContent = (caption, mediaFiles) => {
  if (!caption && (!mediaFiles || mediaFiles.length === 0)) {
    return 'Post must have either a caption or media';
  }
  if (caption && caption.length > VALIDATION_RULES.POST.MAX_CAPTION_LENGTH) {
    return `Caption cannot exceed ${VALIDATION_RULES.POST.MAX_CAPTION_LENGTH} characters`;
  }
  if (mediaFiles && mediaFiles.length > VALIDATION_RULES.POST.MAX_MEDIA_FILES) {
    return `Cannot upload more than ${VALIDATION_RULES.POST.MAX_MEDIA_FILES} files`;
  }
  return '';
};

export const validateMessageContent = (message) => {
  if (!message) return 'Message cannot be empty';
  if (message.length > VALIDATION_RULES.MESSAGE.MAX_LENGTH) {
    return `Message cannot exceed ${VALIDATION_RULES.MESSAGE.MAX_LENGTH} characters`;
  }
  return '';
};

export const validateStoryContent = (caption, mediaFiles) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return 'Story must have media';
  }
  if (caption && caption.length > VALIDATION_RULES.STORY.MAX_CAPTION_LENGTH) {
    return `Caption cannot exceed ${VALIDATION_RULES.STORY.MAX_CAPTION_LENGTH} characters`;
  }
  if (mediaFiles.length > VALIDATION_RULES.STORY.MAX_MEDIA_FILES) {
    return `Cannot upload more than ${VALIDATION_RULES.STORY.MAX_MEDIA_FILES} files`;
  }
  return '';
};
