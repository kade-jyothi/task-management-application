const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must belong to a user']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'study', 'health', 'finance', 'other'],
    default: 'other'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Subtask title cannot exceed 100 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000'],
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return this.dueDate < new Date();
});

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const today = new Date();
  const diffTime = this.dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Set completedAt when task is marked as completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Reset completedAt if task is unmarked as completed
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
  
  next();
});

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function(userId) {
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() }
  });
};

// Static method to find tasks due soon
taskSchema.statics.findDueSoon = function(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $gte: new Date(), $lte: futureDate }
  });
};

// Instance method to add subtask
taskSchema.methods.addSubtask = function(title) {
  this.subtasks.push({ title });
  return this.save();
};

// Instance method to toggle subtask
taskSchema.methods.toggleSubtask = function(subtaskId) {
  const subtask = this.subtasks.id(subtaskId);
  if (subtask) {
    subtask.completed = !subtask.completed;
    return this.save();
  }
  throw new Error('Subtask not found');
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
