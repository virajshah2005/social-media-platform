const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const setupSecurity = (app) => {
  // Basic security headers
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Parse cookies for CSRF
  app.use(cookieParser());

  // CSRF protection
  if (process.env.NODE_ENV === 'production') {
    app.use(csrf({ cookie: true }));
    
    app.use((req, res, next) => {
      res.cookie('XSRF-TOKEN', req.csrfToken());
      next();
    });
  }

  // Secure response headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

module.exports = setupSecurity;
