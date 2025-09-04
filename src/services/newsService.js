// News service for managing news articles with comprehensive API integration
// Provides CRUD operations for news with caching and error handling

import api from './api'
import { PAGINATION_CONFIG } from '../utils/constants'

const newsService = {
  // Get paginated news list with filtering
  getNewsList: async (params = {}) => {
    const {
      page = 1,
      per_page = PAGINATION_CONFIG.defaultPageSize,
      search = '',
      category = '',
      status = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params

    try {
      const response = await api.getWithCache('/news', {
        params: {
          page,
          per_page,
          search,
          category,
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

  // Get single news article by ID
  getNewsById: async (id) => {
    try {
      const response = await api.getWithCache(`/news/${id}`, {
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

  // Create new news article
  createNews: async (newsData) => {
    const { title, body, content, excerpt, category, status = 'draft', featured_image, image_url } = newsData

    // Client-side validation
    const errors = {}
    
    if (!title || title.trim().length < 3) {
      errors.title = ['Title must be at least 3 characters long']
    }
    
    const articleContent = body || content
    if (!articleContent || articleContent.trim().length < 10) {
      errors.body = ['Content must be at least 10 characters long']
    }
    
    if (!category) {
      errors.category = ['Category is required']
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
      const response = await api.post('/news', {
        title: title.trim(),
        body: articleContent.trim(),
        excerpt: excerpt?.trim() || '',
        category,
        status,
        image_url: featured_image || image_url
      })

      // Clear news cache after creation
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'News article created successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Update existing news article
  updateNews: async (id, newsData) => {
    const { title, body, content, excerpt, category, status, featured_image, image_url } = newsData

    // Client-side validation
    const errors = {}
    
    if (title !== undefined && (!title || title.trim().length < 3)) {
      errors.title = ['Title must be at least 3 characters long']
    }
    
    const articleContent = body || content
    if (articleContent !== undefined && (!articleContent || articleContent.trim().length < 10)) {
      errors.body = ['Content must be at least 10 characters long']
    }
    
    if (category !== undefined && !category) {
      errors.category = ['Category is required']
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
      
      if (title !== undefined) updateData.title = title.trim()
      if (articleContent !== undefined) updateData.body = articleContent.trim()
      if (excerpt !== undefined) updateData.excerpt = excerpt.trim()
      if (category !== undefined) updateData.category = category
      if (status !== undefined) updateData.status = status
      if (featured_image !== undefined || image_url !== undefined) {
        updateData.image_url = featured_image || image_url
      }

      const response = await api.put(`/news/${id}`, updateData)

      // Clear news cache after update
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'News article updated successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Delete news article
  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}`)

      // Clear news cache after deletion
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'News article deleted successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Get featured news
  getFeaturedNews: async (limit = 5) => {
    try {
      const response = await api.getWithCache('/news/featured', {
        params: { limit },
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

  // Get recent news
  getRecentNews: async (limit = 10) => {
    try {
      const response = await api.getWithCache('/news/recent', {
        params: { limit },
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

  // Get news categories
  getCategories: async () => {
    try {
      const response = await api.getWithCache('/news/categories', {
        cacheDuration: 30 * 60 * 1000 // 30 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Search news
  searchNews: async (query, options = {}) => {
    const {
      limit = 20,
      category = '',
      dateFrom = '',
      dateTo = ''
    } = options

    try {
      const response = await api.get('/news/search', {
        params: {
          q: query,
          limit,
          category,
          date_from: dateFrom,
          date_to: dateTo
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

  // Publish news article
  publishNews: async (id) => {
    try {
      const response = await api.patch(`/news/${id}/publish`)

      // Clear news cache after publishing
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'News article published successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Unpublish news article
  unpublishNews: async (id) => {
    try {
      const response = await api.patch(`/news/${id}/unpublish`)

      // Clear news cache after unpublishing
      api.clearCache('news')

      return {
        success: true,
        data: response.data,
        message: 'News article unpublished successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Upload featured image for news
  uploadFeaturedImage: async (file, onProgress = null) => {
    try {
      const response = await api.uploadFile('/news/upload-image', file, {
        onProgress,
        field: 'image'
      })

      return {
        success: true,
        data: response.data,
        message: 'Image uploaded successfully'
      }
    } catch (error) {
      throw error
    }
  }
}

export default newsService