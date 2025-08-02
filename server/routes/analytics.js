const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Get user analytics
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic metrics
    const [postsResult] = await pool.execute(
      'SELECT COUNT(*) as total_posts FROM posts WHERE user_id = ?',
      [userId]
    );
    
    const [likesResult] = await pool.execute(`
      SELECT COUNT(*) as total_likes 
      FROM likes l 
      JOIN posts p ON l.post_id = p.id 
      WHERE p.user_id = ?
    `, [userId]);
    
    const [commentsResult] = await pool.execute(`
      SELECT COUNT(*) as total_comments 
      FROM comments c 
      JOIN posts p ON c.post_id = p.id 
      WHERE p.user_id = ?
    `, [userId]);
    
    const [followersResult] = await pool.execute(
      'SELECT COUNT(*) as total_followers FROM follows WHERE following_id = ?',
      [userId]
    );
    
    const [followingResult] = await pool.execute(
      'SELECT COUNT(*) as total_following FROM follows WHERE follower_id = ?',
      [userId]
    );
    
    // Get recent posts with performance data
    const [recentPostsResult] = await pool.execute(`
      SELECT 
        p.id,
        p.caption,
        p.created_at,
        p.media_urls,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT v.id) as views_count
      FROM posts p
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_views v ON p.id = v.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [userId]);
    
    // Calculate engagement rate
    const totalPosts = postsResult[0].total_posts;
    const totalLikes = likesResult[0].total_likes;
    const totalComments = commentsResult[0].total_comments;
    const totalFollowers = followersResult[0].total_followers;
    
    const engagementRate = totalFollowers > 0 
      ? Math.round(((totalLikes + totalComments) / (totalPosts * totalFollowers)) * 100 * 100) / 100
      : 0;
    
    // Calculate growth rate (simplified - could be enhanced with historical data)
    const [growthResult] = await pool.execute(`
      SELECT 
        COUNT(*) as new_followers_this_month
      FROM follows 
      WHERE following_id = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [userId]);
    
    const growthRate = totalFollowers > 0 
      ? Math.round((growthResult[0].new_followers_this_month / totalFollowers) * 100 * 100) / 100
      : 0;
    
    // Get total views (if view tracking is implemented)
    const [viewsResult] = await pool.execute(`
      SELECT COUNT(*) as total_views 
      FROM post_views v 
      JOIN posts p ON v.post_id = p.id 
      WHERE p.user_id = ?
    `, [userId]);
    
    const analytics = {
      totalPosts: totalPosts,
      totalLikes: totalLikes,
      totalComments: totalComments,
      totalViews: viewsResult[0].total_views || 0,
      totalFollowers: totalFollowers,
      totalFollowing: followingResult[0].total_following,
      engagementRate: engagementRate,
      growthRate: growthRate,
      recentPosts: recentPostsResult.map(post => ({
        ...post,
        media_urls: post.media_urls || [],
        views_count: post.views_count || 0
      }))
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get post-specific analytics
router.get('/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Verify post belongs to user
    const [postCheck] = await pool.execute(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );
    
    if (postCheck.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Get post analytics
    const [analyticsResult] = await pool.execute(`
      SELECT 
        p.id,
        p.caption,
        p.created_at,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT v.id) as views_count,
        COUNT(DISTINCT s.id) as shares_count
      FROM posts p
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_views v ON p.id = v.post_id
      LEFT JOIN shares s ON p.id = s.post_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [postId]);
    
    if (analyticsResult.length === 0) {
      return res.status(404).json({ error: 'Post analytics not found' });
    }
    
    res.json({ analytics: analyticsResult[0] });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ error: 'Failed to fetch post analytics' });
  }
});

// Get follower analytics
router.get('/followers', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get follower demographics (simplified)
    const [followersResult] = await pool.execute(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.profile_picture,
        f.created_at as followed_at,
        COUNT(p.id) as their_posts_count
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE f.followed_id = ?
      GROUP BY u.id, f.created_at
      ORDER BY f.created_at DESC
    `, [userId]);
    
    // Get follower growth over time (last 30 days)
    const [growthResult] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_followers
      FROM follows 
      WHERE followed_id = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [userId]);
    
    res.json({
      followers: followersResult,
      growth: growthResult
    });
  } catch (error) {
    console.error('Error fetching follower analytics:', error);
    res.status(500).json({ error: 'Failed to fetch follower analytics' });
  }
});

module.exports = router; 