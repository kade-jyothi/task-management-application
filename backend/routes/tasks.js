const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('collaborators.user', 'username firstName lastName');

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('collaborators.user', 'username firstName lastName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      user: req.user.id
    };

    const task = await Task.create(taskData);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('task-created', {
      task,
      message: 'New task created'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('collaborators.user', 'username firstName lastName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('task-updated', {
      task,
      message: 'Task updated'
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('task-deleted', {
      taskId: req.params.id,
      message: 'Task deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks/:id/subtasks
// @desc    Add a subtask to a task
// @access  Private
router.post('/:id/subtasks', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Subtask title is required'
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.addSubtask(title);
    await task.populate('collaborators.user', 'username firstName lastName');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('subtask-added', {
      task,
      message: 'Subtask added'
    });

    res.status(200).json({
      success: true,
      message: 'Subtask added successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add subtask',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @desc    Toggle subtask completion
// @access  Private
router.put('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.toggleSubtask(req.params.subtaskId);
    await task.populate('collaborators.user', 'username firstName lastName');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('subtask-updated', {
      task,
      message: 'Subtask updated'
    });

    res.status(200).json({
      success: true,
      message: 'Subtask updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subtask',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/dashboard/stats
// @desc    Get task statistics for dashboard
// @access  Private
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      dueSoonTasks,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.findOverdue(userId).countDocuments(),
      Task.findDueSoon(userId, 7).countDocuments(),
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        overdueTasks,
        dueSoonTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByStatus,
        tasksByPriority
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router;
