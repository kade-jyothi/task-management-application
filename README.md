# Task Management Application

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, real-time updates, and responsive design.

## Features

- **User Authentication & Authorization**
  - Secure user registration and login
  - JWT-based authentication
  - Protected routes

- **CRUD Operations for Tasks**
  - Create, read, update, and delete tasks
  - Task status management (pending, in-progress, completed)
  - Priority levels (low, medium, high)
  - Due date tracking with overdue indicators

- **Real-time Updates**
  - WebSocket integration using Socket.io
  - Live task updates across multiple clients
  - Real-time notifications for task changes

- **Responsive Design**
  - Mobile-first approach
  - Works seamlessly on desktop, tablet, and mobile devices
  - Modern UI with Tailwind CSS

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Object Data Modeling (ODM)
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time client
- **React Toastify** - Notifications
- **React Datepicker** - Date selection
- **React Icons** - Icon library
- **Tailwind CSS** - Utility-first CSS framework

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd task-management-appilication
```

### 2. Install dependencies
```bash
# Install all dependencies (both backend and frontend)
npm run install-all
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start the application

#### Option 1: Development mode (both servers)
```bash
npm run dev
```

#### Option 2: Start servers separately
```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend server
npm run client
```

#### Option 3: Production build
```bash
# Build frontend
cd client && npm run build

# Start backend
cd .. && npm start
```

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - User login

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View tasks organized by status (Pending, In Progress, Completed)
3. **Create Tasks**: Click "Add New Task" to create tasks with title, description, priority, and due date
4. **Manage Tasks**: Edit or delete tasks using the action buttons
5. **Real-time Updates**: Changes are automatically reflected across all connected clients

## Project Structure

```
task-management-appilication/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── client/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Navbar.js
│   │   │   ├── TaskDashboard.js
│   │   │   ├── TaskForm.js
│   │   │   └── TaskList.js
│   │   ├── context/          # React context
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json          # Frontend dependencies
└── README.md
```

## Learning Outcomes

This project demonstrates:
- Full-stack application architecture
- RESTful API design and implementation
- User authentication and authorization
- Real-time web applications with WebSockets
- Responsive web design principles
- Modern React development patterns
- Database integration with MongoDB
- State management with React Context API

## Future Enhancements

- Task categories and tags
- File attachments for tasks
- Team collaboration features
- Task comments and activity logs
- Email notifications
- Dark mode support
- Advanced filtering and search
- Data visualization and analytics
