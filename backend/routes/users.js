const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin or own profile)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    // Allow users to get their own profile or admins to get any profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile'
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('taskCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin or own profile)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Allow users to update their own profile or admins to update any profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { username, email, firstName, lastName, role, isActive, preferences } = req.body;
    
    // Build update object
    const allowedUpdates = {};
    
    if (username !== undefined) allowedUpdates.username = username;
    if (email !== undefined) allowedUpdates.email = email;
    if (firstName !== undefined) allowedUpdates.firstName = firstName;
    if (lastName !== undefined) allowedUpdates.lastName = lastName;
    if (preferences !== undefined) allowedUpdates.preferences = preferences;
    
    // Only admins can update role and isActive
    if (req.user.role === 'admin') {
      if (role !== undefined) allowedUpdates.role = role;
      if (isActive !== undefined) allowedUpdates.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Note: In a real application, you might want to soft delete
    // or handle the user's tasks before deleting

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      recentUsers,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.find({ isActive: true })
        .sort({ lastLogin: -1 })
        .limit(5)
        .select('username email firstName lastName lastLogin createdAt'),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        recentUsers,
        usersByRole
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
});

module.exports = router;
