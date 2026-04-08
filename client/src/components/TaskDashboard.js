import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import axios from 'axios';

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { socket } = useSocket();

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('taskUpdated', (data) => {
        if (data.action === 'created') {
          setTasks(prev => [data.task, ...prev]);
          toast.success('New task added!');
        } else if (data.action === 'updated') {
          setTasks(prev => prev.map(task => 
            task._id === data.task._id ? data.task : task
          ));
          toast.info('Task updated!');
        } else if (data.action === 'deleted') {
          setTasks(prev => prev.filter(task => task._id !== data.taskId));
          toast.info('Task deleted!');
        }
      });

      return () => {
        socket.off('taskUpdated');
      };
    }
  }, [socket]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, taskData);
      } else {
        await axios.post('/api/tasks', taskData);
      }
      handleFormClose();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const filteredTasks = {
    pending: tasks.filter(task => task.status === 'pending'),
    inProgress: tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed')
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <button
            onClick={handleCreateTask}
            className="btn btn-primary"
          >
            Add New Task
          </button>
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending</h2>
          <TaskList
            tasks={filteredTasks.pending}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">In Progress</h2>
          <TaskList
            tasks={filteredTasks.inProgress}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Completed</h2>
          <TaskList
            tasks={filteredTasks.completed}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;
