// Authentication functions
async function registerUser(event) {
  event.preventDefault();

  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const adminKey = document.getElementById('register-admin-key').value;

  try {
    logger.info('Registering user', { context: { email } });
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, confirmPassword, adminKey })
    });

    const data = await response.json();

    if (response.ok) {
      logger.info('Registration successful', { context: { email } });
      showAlert('Registration successful! Please login.', 'success');
      setTimeout(() => window.location.href = '/login.html', 2000);
    } else { 
      logger.warn('Registration failed', { context: { data } });
      showAlert(data.message || 'Registration failed', 'error'); 
    }
  } catch (error) {
    logger.error('Registration error', { context: { error } });
    console.error('Registration error:', error);
    showAlert('An error occurred during registration', 'error');
  }
}

async function loginAdmin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const adminKey = document.getElementById('login-admin-key').value;

  try {
    logger.info('Admin logging in', { context: { email } });
    const response = await fetch('/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, adminKey })
    });

    const data = await response.json();

    if (response.ok) {
      logger.info('Admin login successful', { context: { email } });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showAlert('Admin login successful! Redirecting...', 'success');
      setTimeout(() => window.location.href = '/admin-page.html', 2000);
    } else {
      logger.warn('Admin login failed', { context: { email } });
      showAlert(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    logger.error('Admin login error', { context: { error } });
    console.error('Login error:', error);
    showAlert('An error occurred during login', 'error');
  }
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    logger.info('User logging in', { context: { email } });
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      logger.info('User login successful', { context: { email } });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showAlert('Login successful! redirecting to dashboard, please wait...', 'success');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    } else {
      logger.warn('User login failed', { context: { email } });
      showAlert(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    logger.error('User login error', { context: { error } });
    console.error('Login error:', error);
    showAlert('An error occurred during login', 'error');
  }
}

// Employee management functions
async function loadEmployees() {
  const token = localStorage.getItem('token');

  try {
    logger.info('Loading employees', { context: { token } });
    const response = await fetch('/api/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      logger.warn('Failed to fetch employees', { context: { token } });
      throw new Error('Failed to fetch employees');
    }

    const employees = await response.json();
    displayEmployees(employees);
  } catch (error) {
    logger.error('Error loading employees', { context: { error } });
    console.error('Error loading employees:', error);
    showAlert('Error loading employees', 'error');
  }
}

function displayEmployees(employees) {
  const tbody = document.getElementById('employees-tbody');

  if (!tbody) return;
  tbody.innerHTML = '';

  employees.forEach(employee => {
    logger.info('Displaying employee', { context: { employee } });
    const row = document.createElement('tr');
    const formattedSalary = parseFloat(employee.salary || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    row.innerHTML = `
      <td>${employee.id}</td>
      <td>${employee.name}</td>
      <td>${employee.email}</td>
      <td>${employee.position}</td>
      <td>${employee.department}</td>
      <td>${formattedSalary}</td>
      <td>
        <button class="btn" onclick="editEmployee(${employee.id})">Edit</button>
        <button class="btn btn-secondary" onclick="deleteEmployee(${employee.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function createEmployee(event) {
  logger.info('Creating employee', { context: { event } });
  event.preventDefault();

  const name = document.getElementById('employee-name').value;
  const email = document.getElementById('employee-email').value;
  const position = document.getElementById('employee-position').value;
  const department = document.getElementById('employee-department').value;
  const salary = parseFloat(document.getElementById('employee-salary').value);
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, position, department, salary })
    });

    const data = await response.json();

    if (response.ok) {
      logger.info('Employee created successfully', { context: { data } });
      showAlert('Employee created successfully!', 'success');
      document.getElementById('employee-form').reset();
      loadEmployees();
    } else {
      logger.warn('Error creating employee', { context: { data } });
      showAlert(data.message || 'Error creating employee', 'error');
    }
  } catch (error) {
    logger.error('Error creating employee', { context: { error } });
    console.error('Error creating employee:', error);
    showAlert('An error occurred', 'error');
  }
}

async function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    logger.info('Deleting employee', { context: { id } });
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      logger.info('Employee deleted successfully', { context: { data } });
      showAlert('Employee deleted successfully!', 'success');
      loadEmployees();
    } else {
      logger.warn('Error deleting employee', { context: { data } });
      showAlert(data.message || 'Error deleting employee', 'error');
    }
  } catch (error) {
    logger.error('Error deleting employee', { context: { error } });
    console.error('Error deleting employee:', error);
    showAlert('An error occurred', 'error');
  }
}

function editEmployee(id) {
  window.location.href = `/employee-edit.html?id=${id}`;
}

async function logout() {
  try {
    logger.info('Logging out');
    await fetch('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  } catch (error) {
    logger.error('Logout error', { context: { error } });
    console.error('Logout error:', error);
  }
}

// Utility functions
function showAlert(message, type) {
  logger.info('Showing alert', { context: { message, type } });
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 3000);
}

// Admin management functions
async function loadUsers() {
  const token = localStorage.getItem('token');

  try {
    logger.info('Loading users', { context: { token } });
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) { 
      logger.warn('Failed to fetch users', { context: { token } });
      throw new Error('Failed to fetch users'); 
    }

    const users = await response.json();
    displayUsers(users);
  } catch (error) {
    logger.error('Error loading users', { context: { error } });
    console.error('Error loading users:', error);
    showAlert('Error loading users', 'error');
  }
}

function displayUsers(users) {
  logger.info('Displaying users', { context: { users } });
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    const isChecked = user.role === 'admin' ? 'checked' : '';
    const createdDate = new Date(user.created_at).toLocaleDateString();
    
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${createdDate}</td>
      <td>
        <label class="switch">
          <input type="checkbox" ${isChecked} onchange="toggleAdminRole(${user.id}, this.checked)">
          <span class="slider round"></span>
        </label>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function toggleAdminRole(userId, isAdmin) {
  const token = localStorage.getItem('token');
  const newRole = isAdmin ? 'admin' : 'user';

  try {
    logger.info('Toggling admin role', { context: { userId, newRole } });
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (response.ok) {
      logger.info('Admin role updated', { context: { userId, newRole } });
      showAlert(`User role updated to ${newRole}`, 'success');
      loadUsers(); // Refresh list
    } else {
      const data = await response.json();
      logger.warn('Error updating admin role', { context: { userId, newRole, data } });
      showAlert(data.message || 'Error updating role', 'error');
      loadUsers(); // Revert toggle on error
    }
  } catch (error) {
    logger.error('Error updating role', { context: { error } });
    console.error('Error updating role:', error);
    showAlert('An error occurred', 'error');
    loadUsers(); // Revert toggle on error
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path === '/dashboard') {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      const adminBtn = document.getElementById('admin-btn');
      if (adminBtn) adminBtn.style.display = 'inline-block';
    }
  } else if (path === '/admin' || path === '/admin-page.html') {
    loadUsers();
  } else if (path === '/employee-list.html') {
    loadEmployees();
  }
});
