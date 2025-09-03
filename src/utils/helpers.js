// Comprehensive utility functions for the INSBU Statistics Portal
// Provides 50+ helper functions for dates, files, validation, performance, and more

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { STORAGE_KEYS, FILE_UPLOAD_CONFIG } from './constants'

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn(`Error getting ${key} from localStorage:`, error)
      return null
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Error setting ${key} in localStorage:`, error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('Error clearing localStorage:', error)
      return false
    }
  }
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date'
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Invalid date'
  }
}

export const formatDateTime = (date) => {
  return formatDate(date, 'PPP p')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : 'Invalid date'
  } catch (error) {
    console.warn('Error formatting relative time:', error)
    return 'Invalid date'
  }
}

export const isDateInRange = (date, startDate, endDate) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  
  return dateObj >= start && dateObj <= end
}

// =============================================================================
// STRING UTILITIES
// =============================================================================

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + suffix
}

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, capitalizeFirst)
}

export const removeHtmlTags = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

export const sanitizeInput = (input) => {
  if (!input) return ''
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

export const isValidPassword = (password) => {
  return password && password.length >= 8
}

export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateFile = (file) => {
  const errors = []
  
  if (!file) {
    errors.push('No file selected')
    return { valid: false, errors }
  }
  
  // Check file size
  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    errors.push(`File size must be less than ${formatFileSize(FILE_UPLOAD_CONFIG.maxSize)}`)
  }
  
  // Check file type
  if (!FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    errors.push('File type not allowed')
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase()
  if (!FILE_UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    errors.push('File extension not allowed')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// =============================================================================
// FILE UTILITIES
// =============================================================================

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const getFileIcon = (filename) => {
  const extension = getFileExtension(filename).toLowerCase()
  
  const iconMap = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    csv: '📊',
    txt: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  }
  
  return iconMap[extension] || '📎'
}

export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

export const sortByProperty = (array, property, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[property]
    const bVal = b[property]
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
    }
    
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
  })
}

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const unique = (array) => {
  return [...new Set(array)]
}

export const chunk = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const filterBySearch = (array, searchTerm, searchFields) => {
  if (!searchTerm) return array
  
  const term = searchTerm.toLowerCase()
  
  return array.filter(item => {
    return searchFields.some(field => {
      const value = item[field]
      return value && value.toString().toLowerCase().includes(term)
    })
  })
}

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

export const formatNumber = (number, options = {}) => {
  const defaults = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
  
  return new Intl.NumberFormat('en-US', { ...defaults, ...options }).format(number)
}

export const formatCurrency = (amount, currency = 'BIF') => {
  return new Intl.NumberFormat('en-BI', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const clamp = (number, min, max) => {
  return Math.min(Math.max(number, min), max)
}

export const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min
}

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

export const debounce = (func, wait, immediate = false) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const memoize = (fn) => {
  const cache = new Map()
  
  return (...args) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// =============================================================================
// DOM UTILITIES
// =============================================================================

export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const top = element.offsetTop - offset
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return true
  }
}

export const getViewportSize = () => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  }
}

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.message || error.message
    
    return {
      status,
      message,
      type: 'api_error'
    }
  } else if (error.request) {
    // Request made but no response
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      type: 'network_error'
    }
  } else {
    // Something else happened
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      type: 'unknown_error'
    }
  }
}

export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error ${context}:`, error)
  }
  
  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: { context } })
}

// =============================================================================
// COLOR UTILITIES
// =============================================================================

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export const adjustBrightness = (hex, percent) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const adjust = (color) => {
    const adjusted = Math.round(color * (1 + percent / 100))
    return Math.max(0, Math.min(255, adjusted))
  }
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b))
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

export const announceToScreenReader = (message) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey)
  firstElement?.focus()
  
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

// =============================================================================
// DEVELOPMENT UTILITIES
// =============================================================================

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development'
}

export const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

export const perfMark = (name) => {
  if (isDevelopment() && 'performance' in window) {
    performance.mark(name)
  }
}

export const perfMeasure = (name, startMark, endMark) => {
  if (isDevelopment() && 'performance' in window) {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name)[0]
    console.log(`${name}: ${measure.duration.toFixed(2)}ms`)
  }
}
