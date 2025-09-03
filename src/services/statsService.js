// Statistics service for dashboard and analytics data
// Provides comprehensive statistics with caching and real-time updates

import api from './api'

const statsService = {
  // Get dashboard overview statistics
  getDashboardStats: async () => {
    try {
      const response = await api.getWithCache('/stats/dashboard', {
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

  // Get user statistics
  getUserStats: async (timeframe = '30d') => {
    try {
      const response = await api.getWithCache('/stats/users', {
        params: { timeframe },
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

  // Get content statistics
  getContentStats: async (timeframe = '30d') => {
    try {
      const response = await api.getWithCache('/stats/content', {
        params: { timeframe },
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

  // Get activity statistics
  getActivityStats: async (timeframe = '7d') => {
    try {
      const response = await api.getWithCache('/stats/activity', {
        params: { timeframe },
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

  // Get system performance statistics
  getSystemStats: async () => {
    try {
      const response = await api.get('/stats/system')

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get real-time statistics
  getRealTimeStats: async () => {
    try {
      const response = await api.get('/stats/realtime')

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get chart data for specific metric
  getChartData: async (metric, options = {}) => {
    const {
      timeframe = '30d',
      granularity = 'day',
      category = null
    } = options

    try {
      const response = await api.getWithCache(`/stats/charts/${metric}`, {
        params: {
          timeframe,
          granularity,
          category
        },
        cacheDuration: 15 * 60 * 1000 // 15 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get analytics data for admin
  getAnalytics: async (dateRange = {}) => {
    const { startDate, endDate } = dateRange

    try {
      const response = await api.getWithCache('/stats/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        cacheDuration: 30 * 60 * 1000 // 30 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  }
}

export default statsService