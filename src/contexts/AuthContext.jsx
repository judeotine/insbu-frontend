import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storage, handleApiError } from '../utils/helpers'
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants'
import api from '../services/api'
import authService from '../services/authService'

// Enhanced authentication context with token refresh and role management
// Provides comprehensive authentication state management with automatic token refresh
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateUser: () => {},
  refreshToken: () => {},
  hasRole: () => false,
  hasPermission: () => false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Computed authentication state
  const isAuthenticated = !!user

  // Initialize authentication state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Initialize authentication from stored token
  const initializeAuth = async () => {
    try {
      const token = storage.get(STORAGE_KEYS.AUTH_TOKEN)
      
      if (!token) {
        setLoading(false)
        return
      }

      // Set token in API client
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Verify token and get user data
      await fetchCurrentUser()
    } catch (error) {
      console.warn('Failed to initialize auth:', error)
      // Clear invalid token
      await logout()
    } finally {
      setLoading(false)
    }
  }

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser()
      setUser(response.data)
      return response.data
    } catch (error) {
      const processedError = handleApiError(error)
      
      // If token is invalid, logout
      if (processedError.status === 401) {
        await logout()
        throw new Error('Session expired. Please log in again.')
      }
      
      throw processedError
    }
  }

  // Login function with comprehensive error handling
  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const response = await authService.login(credentials)
      const { user: userData, token } = response.data
      
      // Store token and user data
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      // Track login event
      console.log('User logged in:', userData.email)
      
      // Don't call fetchCurrentUser here since we already have user data
      setLoading(false)
      
      return {
        success: true,
        user: userData,
        message: 'Login successful'
      }
    } catch (error) {
      const processedError = handleApiError(error)
      
      // Ensure auth state is clean on failed login
      await logout()
      
      return {
        success: false,
        error: processedError.message,
        status: processedError.status
      }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true)
      
      const response = await authService.register(userData)
      const { user: newUser, token } = response.data
      
      // Auto-login after successful registration
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(newUser)
      
      console.log('User registered and logged in:', newUser.email)
      
      return {
        success: true,
        user: newUser,
        message: 'Registration successful'
      }
    } catch (error) {
      const processedError = handleApiError(error)
      
      return {
        success: false,
        error: processedError.message,
        status: processedError.status
      }
    } finally {
      setLoading(false)
    }
  }

  // Logout function with cleanup
  const logout = useCallback(async () => {
    try {
      // Attempt to revoke token on server
      const token = storage.get(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        try {
          await authService.logout()
        } catch (error) {
          // Continue with logout even if server logout fails
          console.warn('Server logout failed:', error)
        }
      }
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      // Clean up local state regardless of server response
      storage.remove(STORAGE_KEYS.AUTH_TOKEN)
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setLoading(false)
      
      console.log('User logged out')
    }
  }, [])

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }))
  }, [])

  // Token refresh function
  const refreshToken = useCallback(async () => {
    if (refreshing) {
      return false // Prevent multiple simultaneous refresh attempts
    }

    try {
      setRefreshing(true)
      
      const response = await authService.refreshToken()
      const { token, user: userData } = response.data
      
      // Update stored token
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update user data if provided
      if (userData) {
        setUser(userData)
      }
      
      console.log('Token refreshed successfully')
      return true
    } catch (error) {
      console.warn('Token refresh failed:', error)
      
      // Force logout if refresh fails
      await logout()
      return false
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, logout])

  // Role checking utilities
  const hasRole = useCallback((role) => {
    if (!user || !user.role) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }, [user])

  // Permission checking utility
  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false
    
    // Admin has all permissions
    if (user.role === USER_ROLES.ADMIN) {
      return true
    }
    
    // Check role-based permissions from constants
    const rolePermissions = {
      [USER_ROLES.ADMIN]: [
        'manage_users', 'manage_roles', 'create_news', 'edit_news', 
        'delete_news', 'upload_documents', 'delete_documents', 
        'view_analytics', 'manage_system'
      ],
      [USER_ROLES.EDITOR]: [
        'create_news', 'edit_news', 'delete_news', 
        'upload_documents', 'delete_documents'
      ],
      [USER_ROLES.USER]: [
        'view_news', 'download_documents', 'view_dashboard'
      ]
    }
    
    const userPermissions = rolePermissions[user.role] || []
    
    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.includes(p))
    }
    
    return userPermissions.includes(permission)
  }, [user])

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole(USER_ROLES.ADMIN)
  }, [hasRole])

  // Check if user is editor or admin
  const canEdit = useCallback(() => {
    return hasRole([USER_ROLES.ADMIN, USER_ROLES.EDITOR])
  }, [hasRole])

  // Auto token refresh setup
  useEffect(() => {
    if (!isAuthenticated) return

    // Set up automatic token refresh
    const refreshInterval = setInterval(async () => {
      const token = storage.get(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        try {
          // Check if token needs refresh (you might want to decode JWT to check expiry)
          await refreshToken()
        } catch (error) {
          console.warn('Automatic token refresh failed:', error)
        }
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated, refreshToken])

  // API interceptor for automatic token refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry && isAuthenticated) {
          originalRequest._retry = true
          
          const refreshed = await refreshToken()
          if (refreshed) {
            // Retry the original request with new token
            const token = storage.get(STORAGE_KEYS.AUTH_TOKEN)
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          }
        }
        
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [isAuthenticated, refreshToken])

  // Context value
  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    refreshing,
    
    // Actions
    login,
    logout,
    register,
    updateUser,
    refreshToken,
    
    // Utilities
    hasRole,
    hasPermission,
    isAdmin,
    canEdit,
    
    // User info helpers
    userName: user?.name || '',
    userEmail: user?.email || '',
    userRole: user?.role || '',
    userAvatar: user?.avatar || null,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}