const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory storage (for demo purposes)
let users = [];
let tasks = [];
let taskIdCounter = 1;
let userIdCounter = 1;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: userIdCounter++,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const userTasks = tasks.filter(task => task.userId === req.user.userId);
    res.json(userTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = {
      id: taskIdCounter++,
      ...req.body,
      userId: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tasks.push(task);
    io.emit('taskUpdated', { action: 'created', task });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskIndex = tasks.findIndex(t => t.id == req.params.id && t.userId === req.user.userId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...req.body,
      updatedAt: new Date()
    };

    io.emit('taskUpdated', { action: 'updated', task: tasks[taskIndex] });
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id == req.params.id && t.userId === req.user.userId);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    io.emit('taskUpdated', { action: 'deleted', taskId: deletedTask.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Task Management Application is ready!');
});
