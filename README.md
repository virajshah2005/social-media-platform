# Social Media Platform

A modern, full-stack social media platform built with React, Node.js, and MySQL. Features include user authentication, posts, stories, direct messaging, notifications, and more.

## 🚀 Features

### Core Features

- **User Authentication**: Secure login/register with JWT tokens
- **Posts**: Create, like, comment, and share posts with images
- **Stories**: 24-hour ephemeral content with media support
- **Direct Messaging**: Real-time chat with other users
- **User Profiles**: Customizable profiles with bio, avatar, and posts
- **Search**: Find users, posts, and hashtags
- **Notifications**: Real-time notifications for likes, comments, follows
- **Explore**: Discover trending posts and new content
- **Responsive Design**: Works on desktop, tablet, and mobile

### Advanced Features

- **Dark/Light Theme**: Toggle between themes
- **Real-time Updates**: Live notifications and message updates
- **Image Upload**: Support for multiple image formats
- **Infinite Scroll**: Smooth loading of posts and content
- **User Following**: Follow/unfollow other users
- **Post Interactions**: Like, comment, and share posts
- **Privacy Controls**: Manage account privacy settings

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## 📁 Project Structure

```
social-media-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # App entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── index.js           # Server entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social-media-platform
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create `.env` file in the server directory:

   ```env
   # Database
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=social_media_db
   DB_PORT=3306

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Server
   PORT=5000
   NODE_ENV=development

   # CORS
   CLIENT_URL=http://localhost:5173
   ```

4. **Set up the database**

   Create a MySQL database and run the initialization script:

   ```sql
   CREATE DATABASE social_media_db;
   USE social_media_db;
   ```

   The database tables will be created automatically when you start the server.

5. **Start the development servers**

   ```bash
   # Start the backend server (from server directory)
   npm run dev

   # Start the frontend (from client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Users

- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:username/posts` - Get user posts

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get specific post
- `DELETE /api/posts/:id` - Delete post

### Stories

- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create a new story
- `DELETE /api/stories/:id` - Delete story

### Messages

- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages/conversations` - Create new conversation
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages/:conversationId` - Send a message

### Search

- `GET /api/search/global` - Global search
- `GET /api/search/users` - Search users
- `GET /api/search/posts` - Search posts
- `GET /api/search/hashtags` - Search hashtags

## 🎨 Customization

### Themes

The application supports dark and light themes. You can customize the theme colors in:

- `client/tailwind.config.js` - Tailwind configuration
- `client/src/index.css` - Global styles

### Styling

- All components use Tailwind CSS classes
- Custom CSS variables for consistent theming
- Responsive design with mobile-first approach

## 🔧 Development

### Adding New Features

1. Create new components in `client/src/components/`
2. Add new pages in `client/src/pages/`
3. Create API routes in `server/routes/`
4. Update database schema if needed

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for better type safety (optional)
- Write clean, readable code with comments

## 🚀 Deployment

### Frontend Deployment

```bash
cd client
npm run build
```

### Backend Deployment

```bash
cd server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Video upload support
- [ ] Advanced search filters
- [ ] User blocking functionality
- [ ] Post scheduling
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Group messaging
- [ ] Post collections/albums

---

Built with ❤️ using modern web technologies
