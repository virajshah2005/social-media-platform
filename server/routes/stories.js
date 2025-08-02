const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken: auth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/stories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'story-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get all stories
router.get('/', auth, async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.user_id,
        s.media_url,
        s.media_type,
        s.caption,
        s.location,
        s.mentions,
        s.hashtags,
        s.views_count,
        s.created_at,
        u.username,
        u.full_name,
        u.profile_picture
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY s.created_at DESC
    `;
    
    const [stories] = await pool.execute(query);
    
    // Parse JSON fields
    const formattedStories = stories.map(story => ({
      ...story,
      mentions: story.mentions ? JSON.parse(story.mentions) : [],
      hashtags: story.hashtags ? JSON.parse(story.hashtags) : []
    }));
    
    res.json({ stories: formattedStories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Create a new story
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { caption, location } = req.body;
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' });
    }
    
    const mediaUrl = `/uploads/stories/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    // Insert story
    const [result] = await pool.execute(
      'INSERT INTO stories (user_id, media_url, media_type, caption, location) VALUES (?, ?, ?, ?, ?)',
      [userId, mediaUrl, mediaType, caption, location]
    );
    
    // Fetch the created story with user info
    const [storyData] = await pool.execute(`
      SELECT 
        s.id,
        s.user_id,
        s.media_url,
        s.media_type,
        s.caption,
        s.location,
        s.mentions,
        s.hashtags,
        s.views_count,
        s.created_at,
        u.username,
        u.full_name,
        u.profile_picture
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [result.insertId]);
    
    const story = storyData[0];
    if (story) {
      story.mentions = story.mentions ? JSON.parse(story.mentions) : [];
      story.hashtags = story.hashtags ? JSON.parse(story.hashtags) : [];
    }
    
    res.status(201).json({ story });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Get stories for a specific user
router.get('/user/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    
    const query = `
      SELECT 
        s.id,
        s.user_id,
        s.media_url,
        s.media_type,
        s.caption,
        s.location,
        s.mentions,
        s.hashtags,
        s.views_count,
        s.created_at,
        u.username,
        u.full_name,
        u.profile_picture
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE u.username = ? AND s.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY s.created_at DESC
    `;
    
    const [stories] = await pool.execute(query, [username]);
    
    // Parse JSON fields
    const formattedStories = stories.map(story => ({
      ...story,
      mentions: story.mentions ? JSON.parse(story.mentions) : [],
      hashtags: story.hashtags ? JSON.parse(story.hashtags) : []
    }));
    
    res.json({ stories: formattedStories });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ error: 'Failed to fetch user stories' });
  }
});

// Delete a story
router.delete('/:storyId', auth, async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;
    
    // Check if story exists and belongs to user
    const [storyData] = await pool.execute(
      'SELECT media_url FROM stories WHERE id = ? AND user_id = ?',
      [storyId, userId]
    );
    
    if (storyData.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Delete the media file
    const mediaPath = path.join(__dirname, '..', storyData[0].media_url);
    if (fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
    }
    
    // Delete the story from database
    await pool.execute('DELETE FROM stories WHERE id = ?', [storyId]);
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

module.exports = router; 