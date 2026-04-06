class UI {
  constructor() {
    this.notifications = [];
  }

  renderLogin() {
    document.body.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Thiranex</h1>
            <p>Task Management Application</p>
          </div>
          
          <div id="loginForm" class="auth-form">
            <h2>Login</h2>
            <form>
              <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" required>
              </div>
              <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" required>
              </div>
              <button type="submit" id="loginBtn" class="btn btn-primary">Login</button>
            </form>
            <p class="auth-switch">
              Don't have an account? <a href="#" id="showRegister">Register</a>
            </p>
          </div>
          
          <div id="registerForm" class="auth-form" style="display: none;">
            <h2>Register</h2>
            <form>
              <div class="form-group">
                <label for="registerUsername">Username</label>
                <input type="text" id="registerUsername" required>
              </div>
              <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" required>
              </div>
              <div class="form-group">
                <label for="registerFirstName">First Name</label>
                <input type="text" id="registerFirstName" required>
              </div>
              <div class="form-group">
                <label for="registerLastName">Last Name</label>
                <input type="text" id="registerLastName" required>
              </div>
              <div class="form-group">
                <label for="registerPassword">Password</label>
                <input type="password" id="registerPassword" required>
              </div>
              <button type="submit" id="registerBtn" class="btn btn-primary">Register</button>
            </form>
            <p class="auth-switch">
              Already have an account? <a href="#" id="showLogin">Login</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderDashboard(user) {
    document.body.innerHTML = `
      <header class="header">
        <div class="header-container">
          <div class="logo">
            <h1>Thiranex</h1>
          </div>
          <div class="header-actions">
            <div class="user-info">
              <span class="user-name">${user.fullName}</span>
              <button class="btn btn-secondary" id="logoutBtn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="dashboard">
          <div class="dashboard-header">
            <h2>Welcome, ${user.firstName}!</h2>
            <button class="btn btn-primary" id="addTaskBtn">Add Task</button>
          </div>

          <div class="stats-grid" id="statsGrid">
            <!-- Stats will be rendered here -->
          </div>

          <div class="tasks-section">
            <div class="tasks-header">
              <h3>Your Tasks</h3>
              <div class="filters">
                <input type="text" id="searchInput" placeholder="Search tasks..." class="search-input">
                <select id="statusFilter" class="filter-select">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select id="priorityFilter" class="filter-select">
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div class="tasks-list" id="tasksList">
              <!-- Tasks will be rendered here -->
            </div>
          </div>
        </div>
      </main>

      <!-- Task Modal -->
      <div id="taskModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Add Task</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="taskForm">
            <div class="form-group">
              <label for="taskTitle">Title</label>
              <input type="text" id="taskTitle" required>
            </div>
            <div class="form-group">
              <label for="taskDescription">Description</label>
              <textarea id="taskDescription" rows="3" required></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="taskDueDate">Due Date</label>
                <input type="date" id="taskDueDate" required>
              </div>
              <div class="form-group">
                <label for="taskPriority">Priority</label>
                <select id="taskPriority">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="taskCategory">Category</label>
                <select id="taskCategory">
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="study">Study</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label for="taskStatus">Status</label>
                <select id="taskStatus">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close">Cancel</button>
              <button type="submit" id="taskSubmitBtn" class="btn btn-primary">Save Task</button>
            </div>
          </form>
        </div>
      </div>

      <div id="notificationContainer" class="notification-container"></div>
    `;
  }

  renderTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (!tasks || tasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      `;
      return;
    }

    tasksList.innerHTML = tasks.map(task => `
      <div class="task-card ${task.status === 'completed' ? 'completed' : ''} ${task.isOverdue ? 'overdue' : ''}">
        <div class="task-header">
          <h4 class="task-title">${task.title}</h4>
          <div class="task-actions">
            <button class="btn btn-sm btn-icon" onclick="app.handleTaskAction('edit', '${task._id}')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-icon" onclick="app.handleTaskAction('delete', '${task._id}')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-icon" onclick="app.handleTaskAction('toggle-complete', '${task._id}')" title="Toggle Complete">
              <i class="fas fa-${task.status === 'completed' ? 'undo' : 'check'}"></i>
            </button>
          </div>
        </div>
        
        <p class="task-description">${task.description}</p>
        
        <div class="task-meta">
          <span class="task-status status-${task.status}">${task.status.replace('-', ' ')}</span>
          <span class="task-priority priority-${task.priority}">${task.priority}</span>
          <span class="task-category">${task.category}</span>
          <span class="task-due-date">
            <i class="far fa-calendar"></i>
            ${new Date(task.dueDate).toLocaleDateString()}
          </span>
          ${task.isOverdue ? '<span class="overdue-tag">Overdue</span>' : ''}
        </div>
        
        ${task.subtasks && task.subtasks.length > 0 ? `
          <div class="subtasks">
            <div class="subtasks-header">
              <span>Subtasks (${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length})</span>
            </div>
            <div class="subtasks-list">
              ${task.subtasks.map(subtask => `
                <div class="subtask ${subtask.completed ? 'completed' : ''}">
                  <i class="fas fa-${subtask.completed ? 'check-circle' : 'circle'}"></i>
                  <span>${subtask.title}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  renderStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-content">
          <h3>${stats.totalTasks}</h3>
          <p>Total Tasks</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>${stats.completedTasks}</h3>
          <p>Completed</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>${stats.pendingTasks}</h3>
          <p>Pending</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon overdue">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>${stats.overdueTasks}</h3>
          <p>Overdue</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon progress">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="stat-content">
          <h3>${stats.completionRate}%</h3>
          <p>Completion Rate</p>
        </div>
      </div>
    `;
  }

  renderTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskForm = document.getElementById('taskForm');
    
    modalTitle.textContent = task ? 'Edit Task' : 'Add Task';
    
    if (task) {
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description;
      document.getElementById('taskDueDate').value = new Date(task.dueDate).toISOString().split('T')[0];
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskCategory').value = task.category;
      document.getElementById('taskStatus').value = task.status;
      taskForm.dataset.taskId = task._id;
    } else {
      taskForm.reset();
      delete taskForm.dataset.taskId;
      
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      document.getElementById('taskDueDate').value = tomorrow.toISOString().split('T')[0];
    }
    
    modal.style.display = 'block';
  }

  closeModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  }

  showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    container.appendChild(notification);

    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.removeNotification(notification));

    // Auto remove after 5 seconds
    setTimeout(() => this.removeNotification(notification), 5000);
  }

  removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
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

  showError(message) {
    this.showNotification(message, 'error');
  }

  showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
  }

  hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.innerHTML = button.id.includes('login') ? 'Login' : 
                       button.id.includes('register') ? 'Register' : 
                       button.id.includes('task') ? 'Save Task' : 'Submit';
    }
  }
}
