// Document service for file management with upload/download capabilities
// Provides comprehensive document management with validation and progress tracking

import api from './api'
import { PAGINATION_CONFIG, FILE_UPLOAD_CONFIG } from '../utils/constants'
import { validateFile, formatFileSize } from '../utils/helpers'

const documentService = {
  // Get paginated documents list with filtering
  getDocuments: async (params = {}) => {
    const {
      page = 1,
      per_page = PAGINATION_CONFIG.defaultPageSize,
      search = '',
      category = '',
      type = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params

    try {
      const response = await api.getWithCache('/documents', {
        params: {
          page,
          per_page,
          search,
          category,
          type,
          sort_by,
          sort_order
        },
        cacheDuration: 3 * 60 * 1000 // 3 minutes cache
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      throw error
    }
  },

  // Get single document by ID
  getDocumentById: async (id) => {
    try {
      const response = await api.getWithCache(`/documents/${id}`, {
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

  // Upload new document with validation
  uploadDocument: async (file, metadata = {}, onProgress = null) => {
    const {
      title,
      description = '',
      category,
      is_public = true,
      tags = []
    } = metadata

    // Validate file
    const fileValidation = validateFile(file)
    if (!fileValidation.valid) {
      throw {
        response: {
          status: 422,
          data: {
            errors: {
              file: fileValidation.errors
            }
          }
        }
      }
    }

    // Validate metadata
    const errors = {}
    
    if (!title || title.trim().length < 3) {
      errors.title = ['Title must be at least 3 characters long']
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
      const additionalData = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_public: is_public ? '1' : '0',
        tags: Array.isArray(tags) ? tags.join(',') : tags
      }

      const response = await api.uploadFile('/documents', file, {
        onProgress,
        additionalData,
        field: 'file'
      })

      // Clear documents cache after upload
      api.clearCache('documents')

      return {
        success: true,
        data: response.data,
        message: 'Document uploaded successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Update document metadata
  updateDocument: async (id, metadata) => {
    const { title, description, category, is_public, tags } = metadata

    // Client-side validation
    const errors = {}
    
    if (title !== undefined && (!title || title.trim().length < 3)) {
      errors.title = ['Title must be at least 3 characters long']
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
      if (description !== undefined) updateData.description = description.trim()
      if (category !== undefined) updateData.category = category
      if (is_public !== undefined) updateData.is_public = is_public
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [tags]

      const response = await api.put(`/documents/${id}`, updateData)

      // Clear documents cache after update
      api.clearCache('documents')

      return {
        success: true,
        data: response.data,
        message: 'Document updated successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Delete document
  deleteDocument: async (id) => {
    try {
      const response = await api.delete(`/documents/${id}`)

      // Clear documents cache after deletion
      api.clearCache('documents')

      return {
        success: true,
        data: response.data,
        message: 'Document deleted successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Download document
  downloadDocument: async (id, filename = null) => {
    try {
      // Get document info first to get the filename
      if (!filename) {
        const docResponse = await api.get(`/documents/${id}`)
        filename = docResponse.data.original_name || `document-${id}`
      }

      const response = await api.downloadFile(`/documents/${id}/download`, filename)

      return {
        success: true,
        message: 'Document downloaded successfully'
      }
    } catch (error) {
      throw error
    }
  },

  // Get document categories
  getCategories: async () => {
    try {
      const response = await api.getWithCache('/documents/categories', {
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

  // Search documents
  searchDocuments: async (query, options = {}) => {
    const {
      limit = 20,
      category = '',
      type = '',
      dateFrom = '',
      dateTo = ''
    } = options

    try {
      const response = await api.get('/documents/search', {
        params: {
          q: query,
          limit,
          category,
          type,
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

  // Get recent documents
  getRecentDocuments: async (limit = 10) => {
    try {
      const response = await api.getWithCache('/documents/recent', {
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

  // Get popular documents
  getPopularDocuments: async (limit = 10) => {
    try {
      const response = await api.getWithCache('/documents/popular', {
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

  // Bulk upload documents
  bulkUpload: async (files, defaultMetadata = {}, onProgress = null) => {
    const results = []
    let completed = 0

    for (const file of files) {
      try {
        const fileMetadata = {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          category: defaultMetadata.category || 'General',
          description: defaultMetadata.description || '',
          is_public: defaultMetadata.is_public !== undefined ? defaultMetadata.is_public : true,
          ...defaultMetadata
        }

        const result = await documentService.uploadDocument(
          file,
          fileMetadata,
          (progress) => {
            if (onProgress) {
              const totalProgress = ((completed / files.length) + (progress / 100 / files.length)) * 100
              onProgress(Math.round(totalProgress), file.name)
            }
          }
        )

        results.push({
          file: file.name,
          success: true,
          data: result.data
        })
      } catch (error) {
        results.push({
          file: file.name,
          success: false,
          error: error.message || 'Upload failed'
        })
      }

      completed++
      if (onProgress) {
        onProgress((completed / files.length) * 100, `Completed ${completed}/${files.length}`)
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    return {
      success: failCount === 0,
      results,
      summary: {
        total: files.length,
        successful: successCount,
        failed: failCount
      },
      message: `Upload completed: ${successCount} successful, ${failCount} failed`
    }
  },

  // Get document statistics
  getDocumentStats: async () => {
    try {
      const response = await api.getWithCache('/documents/stats', {
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

  // Check if user can access document
  canAccessDocument: async (id) => {
    try {
      const response = await api.get(`/documents/${id}/access`)
      return {
        success: true,
        canAccess: response.data.can_access,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        canAccess: false,
        error: error.message
      }
    }
  },

  // Get file upload configuration
  getUploadConfig: () => {
    return {
      maxSize: FILE_UPLOAD_CONFIG.maxSize,
      maxSizeFormatted: formatFileSize(FILE_UPLOAD_CONFIG.maxSize),
      allowedTypes: FILE_UPLOAD_CONFIG.allowedTypes,
      allowedExtensions: FILE_UPLOAD_CONFIG.allowedExtensions
    }
  },

  // Validate file before upload
  validateFile: (file) => {
    return validateFile(file)
  }
}

export default documentService