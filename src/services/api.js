// Enhanced API client with retry logic, error handling, and interceptors
// Provides comprehensive HTTP client with automatic retry, caching, and error processing

import axios from 'axios'
import { storage, handleApiError } from '../utils/helpers'
import { API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from '../utils/constants'

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// =============================================================================
// REQUEST INTERCEPTORS
// =============================================================================

// Request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for performance tracking
    config.metadata = { startTime: Date.now() }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// =============================================================================
// RESPONSE INTERCEPTORS
// =============================================================================

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Calculate response time
    const endTime = Date.now()
    const responseTime = endTime - response.config.metadata.startTime

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${responseTime}ms)`,
        response.status
      )
    }

    // Add response metadata
    response.responseTime = responseTime

    return response
  },
  async (error) => {
    const originalRequest = error.config
    const responseTime = Date.now() - (originalRequest?.metadata?.startTime || 0)

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${responseTime}ms)`,
        error.response?.status || 'Network Error'
      )
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response

      // Handle validation errors (422)
      if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        error.validationErrors = data.errors || {}
      }

      // Handle unauthorized (401) - token might be expired
      if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
        originalRequest._retry = true
        
        // Clear invalid token
        storage.remove(STORAGE_KEYS.AUTH_TOKEN)
        delete api.defaults.headers.common['Authorization']
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      // Handle forbidden (403)
      if (status === HTTP_STATUS.FORBIDDEN) {
        console.warn('Access forbidden - insufficient permissions')
      }

      // Handle not found (404)
      if (status === HTTP_STATUS.NOT_FOUND) {
        console.warn('Resource not found:', originalRequest?.url)
      }

      // Handle server errors (5xx)
      if (status >= 500) {
        console.error('Server error:', status, data?.message)
      }
    }

    // Process and return structured error
    const processedError = handleApiError(error)
    return Promise.reject(processedError)
  }
)

// =============================================================================
// RETRY MECHANISM
// =============================================================================

// Enhanced request function with retry logic
const requestWithRetry = async (config, retryCount = 0) => {
  try {
    return await api(config)
  } catch (error) {
    const shouldRetry = 
      retryCount < API_CONFIG.retryAttempts &&
      (!error.response || error.response.status >= 500) &&
      error.code !== 'ECONNABORTED' // Don't retry timeout errors

    if (shouldRetry) {
      const delay = API_CONFIG.retryDelay * Math.pow(2, retryCount) // Exponential backoff
      
      console.warn(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${API_CONFIG.retryAttempts})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return requestWithRetry(config, retryCount + 1)
    }

    throw error
  }
}

// =============================================================================
// ENHANCED HTTP METHODS
// =============================================================================

// Enhanced GET request with caching support
api.getWithCache = async (url, config = {}) => {
  const cacheKey = `api_cache_${url}_${JSON.stringify(config.params || {})}`
  const cacheDuration = config.cacheDuration || 5 * 60 * 1000 // 5 minutes default

  // Check cache first
  if (config.useCache !== false) {
    const cachedData = storage.get(cacheKey)
    if (cachedData && Date.now() - cachedData.timestamp < cacheDuration) {
      console.log('📦 Using cached data for:', url)
      return { data: cachedData.data, fromCache: true }
    }
  }

  try {
    const response = await requestWithRetry({ method: 'GET', url, ...config })
    
    // Cache successful response
    if (config.useCache !== false && response.status === HTTP_STATUS.OK) {
      storage.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
    }

    return { ...response, fromCache: false }
  } catch (error) {
    throw error
  }
}

// Enhanced POST request with optimistic updates
api.postOptimistic = async (url, data, config = {}) => {
  const { onOptimisticUpdate, onRollback } = config

  // Apply optimistic update if provided
  if (onOptimisticUpdate) {
    onOptimisticUpdate(data)
  }

  try {
    const response = await requestWithRetry({ 
      method: 'POST', 
      url, 
      data, 
      ...config 
    })
    return response
  } catch (error) {
    // Rollback optimistic update on error
    if (onRollback) {
      onRollback(error)
    }
    throw error
  }
}

// Batch request function
api.batch = async (requests) => {
  try {
    const promises = requests.map(request => api(request))
    const responses = await Promise.allSettled(promises)
    
    return responses.map((result, index) => ({
      request: requests[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason : null
    }))
  } catch (error) {
    console.error('Batch request error:', error)
    throw error
  }
}

// =============================================================================
// FILE UPLOAD UTILITIES
// =============================================================================

// Enhanced file upload with progress tracking
api.uploadFile = async (url, file, options = {}) => {
  const {
    onProgress = null,
    additionalData = {},
    field = 'file'
  } = options

  const formData = new FormData()
  formData.append(field, file)

  // Add additional data to form
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key])
  })

  const config = {
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted, progressEvent)
      }
    }
  }

  return requestWithRetry(config)
}

// Download file utility
api.downloadFile = async (url, filename, config = {}) => {
  try {
    const response = await api({
      method: 'GET',
      url,
      responseType: 'blob',
      ...config
    })

    // Create download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    return response
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Clear API cache
api.clearCache = (pattern = null) => {
  if (!pattern) {
    // Clear all API cache
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('api_cache_')) {
        storage.remove(key)
      }
    })
  } else {
    // Clear cache matching pattern
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('api_cache_') && key.includes(pattern)) {
        storage.remove(key)
      }
    })
  }
}

// Get API health status
api.health = async () => {
  try {
    const response = await api.get('/health')
    return {
      healthy: true,
      status: response.status,
      data: response.data
    }
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    }
  }
}

// Set authentication token
api.setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
  } else {
    delete api.defaults.headers.common['Authorization']
    storage.remove(STORAGE_KEYS.AUTH_TOKEN)
  }
}

// Get current authentication token
api.getAuthToken = () => {
  return storage.get(STORAGE_KEYS.AUTH_TOKEN)
}

// =============================================================================
// REQUEST CANCELLATION
// =============================================================================

// Cancel token store for request cancellation
const cancelTokens = new Map()

// Create cancellable request
api.cancellable = (key) => {
  // Cancel previous request with same key
  if (cancelTokens.has(key)) {
    cancelTokens.get(key).cancel('Request cancelled due to new request')
  }

  // Create new cancel token
  const source = axios.CancelToken.source()
  cancelTokens.set(key, source)

  return {
    request: (config) => api({ ...config, cancelToken: source.token }),
    cancel: (message) => {
      source.cancel(message)
      cancelTokens.delete(key)
    }
  }
}

// Cancel all requests
api.cancelAll = () => {
  cancelTokens.forEach((source, key) => {
    source.cancel('All requests cancelled')
  })
  cancelTokens.clear()
}

// =============================================================================
// EXPORT API CLIENT
// =============================================================================

export { api }
export default api