import React from 'react';
import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const TaskList = ({ tasks, onEdit, onDelete }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No tasks in this category
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`task-card ${getPriorityClass(task.priority)} ${
            task.status === 'completed' ? 'completed' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 flex-1">
              {task.title}
            </h3>
            <div className="flex space-x-2 ml-2">
              <button
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit task"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Delete task"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`status-badge ${getStatusClass(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {task.priority}
              </span>
            </div>

            {task.dueDate && (
              <div className={`flex items-center text-xs ${
                isOverdue(task.dueDate) && task.status !== 'completed' 
                  ? 'text-red-600 font-medium' 
                  : 'text-gray-500'
              }`}>
                <FiCalendar size={12} className="mr-1" />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
