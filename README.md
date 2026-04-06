# Task Management Application

A full-stack task management web application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

### ✅ Core Features Implemented

- **User Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (user/admin)
  - Password change functionality

- **Task CRUD Operations**
  - Create, read, update, delete tasks
  - Task filtering and search
  - Task status management (pending, in-progress, completed)
  - Priority levels (low, medium, high, urgent)
  - Task categories (work, personal, study, health, finance, other)
  - Subtask management
  - Due date tracking with overdue notifications

- **Real-time Updates**
  - WebSocket integration with Socket.IO
  - Live task updates across connected clients
  - Real-time notifications for task actions

- **Responsive Design**
  - Mobile-first responsive design
  - Modern UI with smooth animations
  - Accessible interface with semantic HTML
  - Cross-browser compatibility

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **express-rate-limit** - Rate limiting

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling with CSS variables
- **Font Awesome** - Icons
- **Socket.IO Client** - Real-time client

## Project Structure

```
task-management-application/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema and methods
│   │   └── Task.js          # Task schema and methods
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── tasks.js         # Task CRUD routes
│   │   └── users.js         # User management routes
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── server.js            # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── styles-new.css       # Complete CSS styling
│   ├── app.js               # Main application logic
│   ├── ui.js                # UI rendering and management
│   └── styles.css           # Original styles (legacy)
├── package.json             # Root package file
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Python (for frontend development server)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the development server:
```bash
python -m http.server 3000
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/subtasks` - Add subtask
- `PUT /api/tasks/:id/subtasks/:subtaskId` - Toggle subtask
- `GET /api/tasks/dashboard/stats` - Get dashboard statistics

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

## Database Schema

### User Model
```javascript
{
  username: String (unique, required)
  email: String (unique, required)
  password: String (hashed, required)
  firstName: String (required)
  lastName: String (required)
  avatar: String (optional)
  role: String (enum: ['user', 'admin'], default: 'user')
  isActive: Boolean (default: true)
  lastLogin: Date
  preferences: {
    theme: String (enum: ['light', 'dark'])
    notifications: {
      email: Boolean
      push: Boolean
    }
  }
}
```

### Task Model
```javascript
{
  title: String (required)
  description: String (required)
  user: ObjectId (ref: 'User', required)
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled'])
  priority: String (enum: ['low', 'medium', 'high', 'urgent'])
  category: String (enum: ['work', 'personal', 'study', 'health', 'finance', 'other'])
  dueDate: Date (required)
  completedAt: Date
  tags: [String]
  attachments: [{
    filename: String
    url: String
    size: Number
    uploadedAt: Date
  }]
  subtasks: [{
    title: String (required)
    completed: Boolean (default: false)
    createdAt: Date (default: Date.now)
  }]
  estimatedHours: Number
  actualHours: Number (default: 0)
  isPublic: Boolean (default: false)
  collaborators: [{
    user: ObjectId (ref: 'User')
    permission: String (enum: ['view', 'edit'])
    addedAt: Date (default: Date.now)
  }]
}
```

## Real-time Features

The application uses Socket.IO for real-time updates:

- **Task Events**: When a task is created, updated, or deleted, all connected clients receive real-time notifications
- **Room-based Communication**: Users join their own room for personalized updates
- **Live Notifications**: Instant feedback for user actions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevent API abuse with rate limiting
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet.js**: Security headers and protections
- **Input Validation**: Server-side validation for all inputs

## Responsive Design

The application features a fully responsive design:

- **Mobile-first approach**: Optimized for mobile devices
- **Breakpoints**: 768px (tablet) and 480px (mobile)
- **Flexible Grid**: CSS Grid and Flexbox for layouts
- **Touch-friendly**: Appropriate button sizes and spacing
- **Progressive Enhancement**: Works without JavaScript enabled (basic functionality)

## Development Features

- **Hot Reload**: Nodemon for backend development
- **Environment Variables**: Configurable settings
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging for debugging
- **Modular Architecture**: Clean separation of concerns

## Future Enhancements

Potential features to add:

- [ ] File upload for task attachments
- [ ] Email notifications
- [ ] Task templates
- [ ] Advanced reporting and analytics
- [ ] Team collaboration features
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Dark mode theme
- [ ] Drag-and-drop task management
- [ ] Time tracking integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
