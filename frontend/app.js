class TaskManagementApp {
  constructor() {
    this.api = new API();
    this.auth = new Auth(this.api);
    this.ui = new UI();
    this.socket = null;
    this.currentUser = null;
    
    this.init();
  }

  async init() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      this.api.setToken(token);
      try {
        const userData = await this.auth.getCurrentUser();
        this.currentUser = userData.user;
        this.initSocket();
        this.showDashboard();
      } catch (error) {
        console.error('Failed to get user data:', error);
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  }

  initSocket() {
    this.socket = io('http://localhost:5000');
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      if (this.currentUser) {
        this.socket.emit('join-room', this.currentUser.id);
      }
    });

    this.socket.on('task-created', (data) => {
      this.ui.showNotification(data.message, 'success');
      if (this.currentPage === 'dashboard') {
        this.loadTasks();
      }
    });

    this.socket.on('task-updated', (data) => {
      this.ui.showNotification(data.message, 'info');
      if (this.currentPage === 'dashboard') {
        this.loadTasks();
      }
    });

    this.socket.on('task-deleted', (data) => {
      this.ui.showNotification(data.message, 'warning');
      if (this.currentPage === 'dashboard') {
        this.loadTasks();
      }
    });
  }

  showLogin() {
    this.currentPage = 'login';
    this.ui.renderLogin();
    this.setupLoginEvents();
  }

  showDashboard() {
    this.currentPage = 'dashboard';
    this.ui.renderDashboard(this.currentUser);
    this.setupDashboardEvents();
    this.loadTasks();
    this.loadStats();
  }

  setupLoginEvents() {
    // Login form
    const loginForm = document.querySelector('#loginForm form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Register form
    const registerForm = document.querySelector('#registerForm form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegister();
      });
    }

    // Toggle between login and register
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (showRegister) {
      showRegister.addEventListener('click', () => {
        this.ui.showRegisterForm();
      });
    }
    
    if (showLogin) {
      showLogin.addEventListener('click', () => {
        this.ui.showLoginForm();
      });
    }
  }

  setupDashboardEvents() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.showAddTaskModal());
    }

    // Task form
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleTaskSubmit();
      });
    }

    // Search and filters
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    if (searchInput) {
      searchInput.addEventListener('input', () => this.debounce(() => this.loadTasks(), 500)());
    }
    
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.loadTasks());
    }
    
    if (priorityFilter) {
      priorityFilter.addEventListener('change', () => this.loadTasks());
    }

    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(btn => {
      btn.addEventListener('click', () => this.ui.closeModal());
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.ui.closeModal();
      }
    });
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      this.ui.showLoading('loginBtn');
      const response = await this.auth.login(email, password);
      
      localStorage.setItem('token', response.data.token);
      this.currentUser = response.data.user;
      this.api.setToken(response.data.token);
      
      this.initSocket();
      this.showDashboard();
      this.ui.showNotification('Login successful!', 'success');
    } catch (error) {
      this.ui.showError(error.message);
    } finally {
      this.ui.hideLoading('loginBtn');
    }
  }

  async handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;

    try {
      this.ui.showLoading('registerBtn');
      const response = await this.auth.register(username, email, password, firstName, lastName);
      
      localStorage.setItem('token', response.data.token);
      this.currentUser = response.data.user;
      this.api.setToken(response.data.token);
      
      this.initSocket();
      this.showDashboard();
      this.ui.showNotification('Registration successful!', 'success');
    } catch (error) {
      this.ui.showError(error.message);
    } finally {
      this.ui.hideLoading('registerBtn');
    }
  }

  handleLogout() {
    localStorage.removeItem('token');
    this.currentUser = null;
    if (this.socket) {
      this.socket.disconnect();
    }
    this.showLogin();
    this.ui.showNotification('Logged out successfully', 'info');
  }

  async loadTasks() {
    try {
      const search = document.getElementById('searchInput')?.value || '';
      const status = document.getElementById('statusFilter')?.value || '';
      const priority = document.getElementById('priorityFilter')?.value || '';
      
      const params = new URLSearchParams({ search, status, priority });
      const response = await this.api.get(`/tasks?${params}`);
      
      this.ui.renderTasks(response.data.tasks);
    } catch (error) {
      this.ui.showError('Failed to load tasks');
      console.error('Load tasks error:', error);
    }
  }

  async loadStats() {
    try {
      const response = await this.api.get('/tasks/dashboard/stats');
      this.ui.renderStats(response.data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  showAddTaskModal(task = null) {
    this.ui.renderTaskModal(task);
    this.setupTaskModalEvents(task);
  }

  setupTaskModalEvents(task) {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.dataset.taskId = task ? task._id : '';
    }
  }

  async handleTaskSubmit() {
    const taskForm = document.getElementById('taskForm');
    const taskId = taskForm.dataset.taskId;
    const isEdit = !!taskId;

    const formData = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      dueDate: document.getElementById('taskDueDate').value,
      priority: document.getElementById('taskPriority').value,
      category: document.getElementById('taskCategory').value,
      status: document.getElementById('taskStatus').value
    };

    try {
      this.ui.showLoading('taskSubmitBtn');
      
      let response;
      if (isEdit) {
        response = await this.api.put(`/tasks/${taskId}`, formData);
        this.ui.showNotification('Task updated successfully!', 'success');
      } else {
        response = await this.api.post('/tasks', formData);
        this.ui.showNotification('Task created successfully!', 'success');
      }
      
      this.ui.closeModal();
      this.loadTasks();
      this.loadStats();
    } catch (error) {
      this.ui.showError(error.message);
    } finally {
      this.ui.hideLoading('taskSubmitBtn');
    }
  }

  async handleTaskAction(action, taskId) {
    try {
      switch (action) {
        case 'edit':
          const taskResponse = await this.api.get(`/tasks/${taskId}`);
          this.showAddTaskModal(taskResponse.data.task);
          break;
          
        case 'delete':
          if (confirm('Are you sure you want to delete this task?')) {
            await this.api.delete(`/tasks/${taskId}`);
            this.ui.showNotification('Task deleted successfully!', 'warning');
            this.loadTasks();
            this.loadStats();
          }
          break;
          
        case 'toggle-complete':
          const task = await this.api.get(`/tasks/${taskId}`);
          const newStatus = task.data.task.status === 'completed' ? 'pending' : 'completed';
          await this.api.put(`/tasks/${taskId}`, { status: newStatus });
          this.loadTasks();
          this.loadStats();
          break;
      }
    } catch (error) {
      this.ui.showError(error.message);
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// API Class
class API {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Auth Class
class Auth {
  constructor(api) {
    this.api = api;
  }

  async login(email, password) {
    return await this.api.post('/auth/login', { email, password });
  }

  async register(username, email, password, firstName, lastName) {
    return await this.api.post('/auth/register', {
      username,
      email,
      password,
      firstName,
      lastName
    });
  }

  async getCurrentUser() {
    return await this.api.get('/auth/me');
  }

  async updateProfile(profileData) {
    return await this.api.put('/auth/profile', profileData);
  }

  async changePassword(currentPassword, newPassword) {
    return await this.api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async logout() {
    return await this.api.post('/auth/logout');
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TaskManagementApp();
});
