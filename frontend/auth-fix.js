// Fixed Authentication JavaScript
class AuthManager {
  constructor() {
    this.api = new API();
    this.init();
  }

  init() {
    this.setupAuthEvents();
    this.checkExistingSession();
  }

  setupAuthEvents() {
    // Login form submission
    const loginForm = document.querySelector('#loginForm form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register form submission
    const registerForm = document.querySelector('#registerForm form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Toggle between forms
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterForm();
      });
    }

    if (showLoginLink) {
      showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    }
  }

  async handleLogin() {
    try {
      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;

      if (!email || !password) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }

      this.setLoading('loginBtn', true);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      this.showNotification('Login successful!', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      this.showNotification(error.message, 'error');
    } finally {
      this.setLoading('loginBtn', false);
    }
  }

  async handleRegister() {
    try {
      const username = document.getElementById('registerUsername')?.value;
      const email = document.getElementById('registerEmail')?.value;
      const password = document.getElementById('registerPassword')?.value;
      const firstName = document.getElementById('registerFirstName')?.value;
      const lastName = document.getElementById('registerLastName')?.value;

      if (!username || !email || !password || !firstName || !lastName) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }

      if (password.length < 6) {
        this.showNotification('Password must be at least 6 characters', 'error');
        return;
      }

      this.setLoading('registerBtn', true);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      this.showNotification('Registration successful!', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      this.showNotification(error.message, 'error');
    } finally {
      this.setLoading('registerBtn', false);
    }
  }

  showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
  }

  showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  }

  setLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (button) {
      if (loading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      } else {
        button.disabled = false;
        button.innerHTML = buttonId === 'loginBtn' ? 'Login' : 'Register';
      }
    }
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '1000',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      minWidth: '300px',
      maxWidth: '400px'
    });

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.background = '#4caf50';
        break;
      case 'error':
        notification.style.background = '#f44336';
        break;
      case 'warning':
        notification.style.background = '#ff9800';
        break;
      default:
        notification.style.background = '#2196f3';
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  async checkExistingSession() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        // Verify token is still valid
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // User is logged in, redirect to dashboard
          this.loadDashboard(JSON.parse(user));
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  loadDashboard(user) {
    // Simple dashboard redirect
    document.body.innerHTML = `
      <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
        <h1>Welcome to Task Management Dashboard</h1>
        <p>Hello, ${user.firstName} ${user.lastName}!</p>
        <button onclick="logout()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Logout</button>
        <div style="margin-top: 2rem;">
          <h2>Your Tasks</h2>
          <p>Loading tasks...</p>
        </div>
      </div>
    `;

    // Load tasks
    this.loadTasks();
  }

  async loadTasks() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.renderTasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  renderTasks(tasks) {
    const tasksContainer = document.querySelector('div[style*="margin-top: 2rem"] p');
    if (tasksContainer) {
      if (tasks.length === 0) {
        tasksContainer.textContent = 'No tasks found. Create your first task!';
      } else {
        tasksContainer.innerHTML = tasks.map(task => `
          <div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Status: ${task.status} | Priority: ${task.priority}</p>
            <p>Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
          </div>
        `).join('');
      }
    }
  }
}

// Simple API class
class API {
  async request(url, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});
