// Task Management Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    setupEventListeners();
    
    // Add animations and interactions
    setupAnimations();
    
    // Initialize any data
    initializeData();
}

function setupEventListeners() {
    // Refresh button functionality
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }
    
    // Menu button functionality
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', handleMenuToggle);
    }
    
    // Submit button functionality
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Task card interactions
    const taskCard = document.querySelector('.task-card');
    if (taskCard) {
        taskCard.addEventListener('click', handleTaskCardClick);
    }
}

function handleRefresh() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const icon = refreshBtn.querySelector('i');
    
    // Add spinning animation
    icon.style.animation = 'spin 1s linear';
    
    // Simulate data refresh
    setTimeout(() => {
        icon.style.animation = '';
        showNotification('Data refreshed successfully!', 'success');
    }, 1000);
}

function handleMenuToggle() {
    // Toggle mobile menu (placeholder functionality)
    showNotification('Menu functionality coming soon!', 'info');
}

function handleSubmit() {
    const submitBtn = document.querySelector('.submit-btn');
    
    // Add loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate submission
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showNotification('Work submitted successfully!', 'success');
    }, 2000);
}

function handleTaskCardClick(event) {
    // Prevent button clicks from triggering card click
    if (event.target.classList.contains('submit-btn')) {
        return;
    }
    
    // Add subtle interaction feedback
    const taskCard = document.querySelector('.task-card');
    taskCard.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        taskCard.style.transform = '';
    }, 150);
}

function setupAnimations() {
    // Add entrance animations
    const taskCard = document.querySelector('.task-card');
    taskCard.style.opacity = '0';
    taskCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        taskCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        taskCard.style.opacity = '1';
        taskCard.style.transform = 'translateY(0)';
    }, 100);
    
    // Animate feature list items
    const featureItems = document.querySelectorAll('.feature-list li');
    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 500 + (index * 100));
    });
}

function initializeData() {
    // Initialize any application data
    console.log('Task Management Application initialized');
    
    // Set current date/time if needed
    updateDateTime();
}

function updateDateTime() {
    // Update any date/time displays
    const now = new Date();
    console.log('Current time:', now.toLocaleString());
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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
        transition: 'opacity 0.3s ease, transform 0.3s ease'
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
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animation for spinning refresh icon
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleRefresh();
    }
    
    // Ctrl/Cmd + Enter for submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
    }
    
    // Escape to close notifications
    if (event.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
});
