// Admin service for user and system management
// Provides administrative functions with role-based access control

import api from './api'
import { PAGINATION_CONFIG, USER_ROLES } from '../utils/constants'
import { isValidEmail } from '../utils/helpers'

const adminService = {
  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    const {
      page = 1,
      per_page = PAGINATION_CONFIG.defaultPageSize,
      search = '',
      role = '',
      status = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params

    try {
      const response = await api.getWithCache('/admin/users', {
        params: {
          page,
          per_page,
          search,
          role,
          status,
          sort_by,
          sort_order
        },
        cacheDuration: 2 * 60 * 1000 // 2 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get single user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Create new user
  createUser: async (userData) => {
    const { name, email, password, role = USER_ROLES.USER, status = 'active' } = userData

    // Client-side validation
    const errors = {}
    
    if (!name || name.trim().length < 2) {
      errors.name = ['Name must be at least 2 characters long']
    }
    
    if (!email) {
      errors.email = ['Email is required']
    } else if (!isValidEmail(email)) {
      errors.email = ['Please enter a valid email address']
    }
    
    if (!password || password.length < 8) {
      errors.password = ['Password must be at least 8 characters long']
    }
    
    if (!Object.values(USER_ROLES).includes(role)) {
      errors.role = ['Invalid role selected']
    }

    if (Object.keys(errors).length > 0) {
      throw {
        response: {
          status: 422,
          data: { errors }
        }
      }
    }

    try {
      const response = await api.post('/admin/users', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        status
      })

      // Clear users cache after creation
      api.clearCache('admin/users')

      return {
        success: true,
        data: response.data,
        message: 'User created successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    const { name, email, role, status, password } = userData

    // Client-side validation
    const errors = {}
    
    if (name !== undefined && (!name || name.trim().length < 2)) {
      errors.name = ['Name must be at least 2 characters long']
    }
    
    if (email !== undefined) {
      if (!email) {
        errors.email = ['Email is required']
      } else if (!isValidEmail(email)) {
        errors.email = ['Please enter a valid email address']
      }
    }
    
    if (role !== undefined && !Object.values(USER_ROLES).includes(role)) {
      errors.role = ['Invalid role selected']
    }
    
    if (password !== undefined && password && password.length < 8) {
      errors.password = ['Password must be at least 8 characters long']
    }

    if (Object.keys(errors).length > 0) {
      throw {
        response: {
          status: 422,
          data: { errors }
        }
      }
    }

    try {
      const updateData = {}
      
      if (name !== undefined) updateData.name = name.trim()
      if (email !== undefined) updateData.email = email.toLowerCase().trim()
      if (role !== undefined) updateData.role = role
      if (status !== undefined) updateData.status = status
      if (password !== undefined && password) updateData.password = password

      const response = await api.put(`/admin/users/${id}`, updateData)

      // Clear users cache after update
      api.clearCache('admin/users')

      return {
        success: true,
        data: response.data,
        message: 'User updated successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`)

      // Clear users cache after deletion
      api.clearCache('admin/users')

      return {
        success: true,
        data: response.data,
        message: 'User deleted successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Update user role
  updateUserRole: async (id, role) => {
    if (!Object.values(USER_ROLES).includes(role)) {
      throw {
        response: {
          status: 422,
          data: {
            errors: {
              role: ['Invalid role selected']
            }
          }
        }
      }
    }

    try {
      const response = await api.patch(`/admin/users/${id}/role`, { role })

      // Clear users cache after role update
      api.clearCache('admin/users')

      return {
        success: true,
        data: response.data,
        message: 'User role updated successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Suspend user
  suspendUser: async (id, reason = '') => {
    try {
      const response = await api.patch(`/admin/users/${id}/suspend`, {
        reason: reason.trim()
      })

      // Clear users cache after suspension
      api.clearCache('admin/users')

      return {
        success: true,
        data: response.data,
        message: 'User suspended successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Activate user
  activateUser: async (id) => {
    try {
      const response = await api.patch(`/admin/users/${id}/activate`)

      // Clear users cache after activation
      api.clearCache('admin/users')

      return {
        success: true,
        data: response.data,
        message: 'User activated successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Get user activity log
  getUserActivity: async (id, params = {}) => {
    const {
      page = 1,
      per_page = 20,
      action = '',
      date_from = '',
      date_to = ''
    } = params

    try {
      const response = await api.get(`/admin/users/${id}/activity`, {
        params: {
          page,
          per_page,
          action,
          date_from,
          date_to
        }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get system statistics for admin
  getSystemStatistics: async () => {
    try {
      const response = await api.getWithCache('/admin/statistics', {
        cacheDuration: 5 * 60 * 1000 // 5 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get system settings
  getSystemSettings: async () => {
    try {
      const response = await api.getWithCache('/admin/settings', {
        cacheDuration: 10 * 60 * 1000 // 10 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Update system settings
  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings)

      // Clear settings cache after update
      api.clearCache('admin/settings')

      return {
        success: true,
        data: response.data,
        message: 'Settings updated successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Get activity logs
  getActivityLogs: async (params = {}) => {
    const {
      page = 1,
      per_page = 50,
      action = '',
      user_id = '',
      date_from = '',
      date_to = ''
    } = params

    try {
      const response = await api.get('/admin/activity-logs', {
        params: {
          page,
          per_page,
          action,
          user_id,
          date_from,
          date_to
        }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Export data
  exportData: async (type, filters = {}) => {
    try {
      const response = await api.post(`/admin/export/${type}`, filters, {
        responseType: 'blob'
      })

      // Create download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        message: 'Data exported successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Backup system
  createBackup: async () => {
    try {
      const response = await api.post('/admin/backup')

      return {
        success: true,
        data: response.data,
        message: 'Backup created successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Get backup list
  getBackups: async () => {
    try {
      const response = await api.get('/admin/backups')

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Send system notification
  sendNotification: async (notificationData) => {
    const { title, message, type = 'info', recipients = 'all' } = notificationData

    // Client-side validation
    const errors = {}
    
    if (!title || title.trim().length < 3) {
      errors.title = ['Title must be at least 3 characters long']
    }
    
    if (!message || message.trim().length < 10) {
      errors.message = ['Message must be at least 10 characters long']
    }

    if (Object.keys(errors).length > 0) {
      throw {
        response: {
          status: 422,
          data: { errors }
        }
      }
    }

    try {
      const response = await api.post('/admin/notifications', {
        title: title.trim(),
        message: message.trim(),
        type,
        recipients
      })

      return {
        success: true,
        data: response.data,
        message: 'Notification sent successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Article management methods
  getArticles: async (params = {}) => {
    const {
      page = 1,
      per_page = PAGINATION_CONFIG.defaultPageSize,
      search = '',
      status = '',
      category = '',
      author_id = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params

    try {
      const response = await api.getWithCache('/admin/articles', {
        params: {
          page,
          per_page,
          search,
          status,
          category,
          author_id,
          sort_by,
          sort_order
        },
        cacheDuration: 2 * 60 * 1000 // 2 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  approveArticle: async (id) => {
    try {
      const response = await api.patch(`/admin/articles/${id}/approve`)

      // Clear articles cache after approval
      api.clearCache('admin/articles')
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'Article approved and published successfully'
      }
    } catch (error) {
      throw error
    }
  },

  rejectArticle: async (id, reason = '') => {
    try {
      const response = await api.patch(`/admin/articles/${id}/reject`, {
        reason: reason.trim()
      })

      // Clear articles cache after rejection
      api.clearCache('admin/articles')
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'Article rejected successfully'
      }
    } catch (error) {
      throw error
    }
  }
}

export default adminService