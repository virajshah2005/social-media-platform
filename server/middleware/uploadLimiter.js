const rateLimit = require('express-rate-limit');

const mediaUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 media uploads per windowMs
  message: 'Too many media uploads from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = mediaUploadLimiter;
