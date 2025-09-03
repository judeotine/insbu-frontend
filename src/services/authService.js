// Comprehensive authentication service with validation and error handling
// Provides all authentication-related API calls with proper error handling

import api from './api'
import { VALIDATION_RULES } from '../utils/constants'
import { isValidEmail, isValidPassword } from '../utils/helpers'

// =============================================================================
// AUTHENTICATION SERVICE
// =============================================================================

const authService = {
  // User login with validation
  login: async (credentials) => {
    const { email, password } = credentials

    // Client-side validation
    const errors = {}
    
    if (!email) {
      errors.email = VALIDATION_RULES.email.required
    } else if (!isValidEmail(email)) {
      errors.email = VALIDATION_RULES.email.pattern.message
    }
    
    if (!password) {
      errors.password = VALIDATION_RULES.password.required
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
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password
      })

      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      }
    } catch (error) {
      // Handle specific login errors
      if (error.response?.status === 401) {
        throw {
          response: {
            status: 401,
            data: {
              message: 'Invalid email or password. Please check your credentials and try again.'
            }
          }
        }
      }
      
      throw error
    }
  },

  // User registration with comprehensive validation
  register: async (userData) => {
    const { name, email, password, password_confirmation } = userData

    // Client-side validation
    const errors = {}
    
    // Name validation
    if (!name) {
      errors.name = VALIDATION_RULES.name.required
    } else if (name.length < VALIDATION_RULES.name.minLength.value) {
      errors.name = VALIDATION_RULES.name.minLength.message
    }
    
    // Email validation
    if (!email) {
      errors.email = VALIDATION_RULES.email.required
    } else if (!isValidEmail(email)) {
      errors.email = VALIDATION_RULES.email.pattern.message
    }
    
    // Password validation
    if (!password) {
      errors.password = VALIDATION_RULES.password.required
    } else if (!isValidPassword(password)) {
      errors.password = VALIDATION_RULES.password.minLength.message
    }
    
    // Password confirmation validation
    if (!password_confirmation) {
      errors.password_confirmation = 'Password confirmation is required'
    } else if (password !== password_confirmation) {
      errors.password_confirmation = 'Passwords do not match'
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
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        password_confirmation
      })

      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      }
    } catch (error) {
      // Handle specific registration errors
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors || {}
        
        // Map server errors to user-friendly messages
        if (serverErrors.email?.includes('has already been taken')) {
          serverErrors.email = ['An account with this email already exists. Please use a different email or try logging in.']
        }
        
        throw {
          response: {
            status: 422,
            data: { errors: serverErrors }
          }
        }
      }
      
      throw error
    }
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/user')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Refresh authentication token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // User logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return {
        success: true,
        data: response.data || {},
        message: 'Logged out successfully'
      }
    } catch (error) {
      // Even if server logout fails, we should clear local state
      console.warn('Server logout failed, but continuing with local logout:', error)
      return {
        success: true,
        data: {},
        message: 'Logged out locally'
      }
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const { name, email, current_password, password, password_confirmation } = profileData

    // Client-side validation
    const errors = {}
    
    // Name validation (if provided)
    if (name !== undefined) {
      if (!name) {
        errors.name = VALIDATION_RULES.name.required
      } else if (name.length < VALIDATION_RULES.name.minLength.value) {
        errors.name = VALIDATION_RULES.name.minLength.message
      }
    }
    
    // Email validation (if provided)
    if (email !== undefined) {
      if (!email) {
        errors.email = VALIDATION_RULES.email.required
      } else if (!isValidEmail(email)) {
        errors.email = VALIDATION_RULES.email.pattern.message
      }
    }
    
    // Password validation (if changing password)
    if (password) {
      if (!current_password) {
        errors.current_password = 'Current password is required to change password'
      }
      
      if (!isValidPassword(password)) {
        errors.password = VALIDATION_RULES.password.minLength.message
      }
      
      if (!password_confirmation) {
        errors.password_confirmation = 'Password confirmation is required'
      } else if (password !== password_confirmation) {
        errors.password_confirmation = 'Passwords do not match'
      }
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
      if (current_password) updateData.current_password = current_password
      if (password) updateData.password = password
      if (password_confirmation) updateData.password_confirmation = password_confirmation

      const response = await api.put('/auth/profile', updateData)
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      // Handle specific profile update errors
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors || {}
        
        // Map server errors to user-friendly messages
        if (serverErrors.current_password) {
          serverErrors.current_password = ['Current password is incorrect']
        }
        
        if (serverErrors.email?.includes('has already been taken')) {
          serverErrors.email = ['This email is already in use by another account']
        }
        
        throw {
          response: {
            status: 422,
            data: { errors: serverErrors }
          }
        }
      }
      
      throw error
    }
  },

  // Password reset request
  requestPasswordReset: async (email) => {
    // Client-side validation
    if (!email) {
      throw {
        response: {
          status: 422,
          data: {
            errors: {
              email: [VALIDATION_RULES.email.required]
            }
          }
        }
      }
    }

    if (!isValidEmail(email)) {
      throw {
        response: {
          status: 422,
          data: {
            errors: {
              email: [VALIDATION_RULES.email.pattern.message]
            }
          }
        }
      }
    }

    try {
      const response = await api.post('/auth/password/reset', {
        email: email.toLowerCase().trim()
      })

      return {
        success: true,
        data: response.data,
        message: 'Password reset instructions sent to your email'
      }
    } catch (error) {
      throw error
    }
  },

  // Reset password with token
  resetPassword: async (resetData) => {
    const { token, email, password, password_confirmation } = resetData

    // Client-side validation
    const errors = {}
    
    if (!token) {
      errors.token = ['Reset token is required']
    }
    
    if (!email) {
      errors.email = [VALIDATION_RULES.email.required]
    } else if (!isValidEmail(email)) {
      errors.email = [VALIDATION_RULES.email.pattern.message]
    }
    
    if (!password) {
      errors.password = [VALIDATION_RULES.password.required]
    } else if (!isValidPassword(password)) {
      errors.password = [VALIDATION_RULES.password.minLength.message]
    }
    
    if (!password_confirmation) {
      errors.password_confirmation = ['Password confirmation is required']
    } else if (password !== password_confirmation) {
      errors.password_confirmation = ['Passwords do not match']
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
      const response = await api.post('/auth/password/update', {
        token,
        email: email.toLowerCase().trim(),
        password,
        password_confirmation
      })

      return {
        success: true,
        data: response.data,
        message: 'Password reset successfully'
      }
    } catch (error) {
      // Handle specific password reset errors
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors || {}
        
        if (serverErrors.token) {
          serverErrors.token = ['Invalid or expired reset token. Please request a new password reset.']
        }
        
        throw {
          response: {
            status: 422,
            data: { errors: serverErrors }
          }
        }
      }
      
      throw error
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/email/verify', { token })
      return {
        success: true,
        data: response.data,
        message: 'Email verified successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Resend email verification
  resendEmailVerification: async () => {
    try {
      const response = await api.post('/auth/email/resend')
      return {
        success: true,
        data: response.data,
        message: 'Verification email sent'
      }
    } catch (error) {
      throw error
    }
  },

  // Check if user is authenticated (client-side check)
  isAuthenticated: () => {
    const token = api.getAuthToken()
    return !!token
  },

  // Validate session
  validateSession: async () => {
    try {
      const response = await api.get('/auth/validate')
      return {
        valid: true,
        data: response.data
      }
    } catch (error) {
      return {
        valid: false,
        error: error.message
      }
    }
  }
}

export default authService