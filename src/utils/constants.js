// Application constants and configuration

export const APP_CONFIG = {
  name: 'INSBU Statistics Portal',
  version: '1.0.0',
  description: 'Institute of National Statistics of Burundi',
  author: 'INSBU Development Team',
  supportEmail: 'support@insbu.bi',
}

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'insbu_auth_token',
  THEME_MODE: 'insbu_theme_mode',
  USER_PREFERENCES: 'insbu_user_preferences',
  LANGUAGE: 'insbu_language',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
}

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_roles',
    'create_news',
    'edit_news',
    'delete_news',
    'upload_documents',
    'delete_documents',
    'view_analytics',
    'manage_system',
  ],
  [USER_ROLES.EDITOR]: [
    'create_news',
    'edit_news',
    'delete_news',
    'upload_documents',
    'delete_documents',
  ],
  [USER_ROLES.USER]: [
    'view_news',
    'download_documents',
    'view_dashboard',
  ],
}

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  maxPageSize: 100,
}

export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.jpg', '.jpeg', '.png', '.gif'],
}

export const NEWS_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const NEWS_CATEGORIES = [
  'Economic Reports',
  'Census Data', 
  'Agriculture',
  'Healthcare',
  'Education',
  'Infrastructure',
  'Trade',
  'Employment',
  'Social Statistics',
  'Methodology',
]

export const DOCUMENT_CATEGORIES = [
  'Economic Reports',
  'Census Data',
  'Agriculture', 
  'Healthcare',
  'Education',
  'Infrastructure',
  'Trade',
  'Employment',
  'Social Statistics',
  'Methodology',
  'Internal',
]

export const THEME_CONFIG = {
  modes: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
}

export const CHART_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  purple: '#9c27b0',
  orange: '#ff5722',
  teal: '#009688',
  indigo: '#3f51b5',
}

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  SAVE_SUCCESS: 'Successfully saved!',
  DELETE_SUCCESS: 'Successfully deleted!',
  UPDATE_SUCCESS: 'Successfully updated!',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
}

export const VALIDATION_RULES = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address'
    }
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    }
  },
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters'
    }
  },
  title: {
    required: 'Title is required',
    minLength: {
      value: 3,
      message: 'Title must be at least 3 characters'
    }
  },
}
