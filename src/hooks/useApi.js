// Enhanced API hooks with caching, retries, pagination, and infinite scroll
// Provides comprehensive data fetching capabilities with error handling

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNetworkPerformance } from './usePerformance'
import { debounce, handleApiError } from '../utils/helpers'

// =============================================================================
// BASIC API HOOK
// =============================================================================

/**
 * Enhanced useApi hook with automatic retries, caching, and error handling
 * Provides loading states, error handling, and retry mechanisms
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const {
    immediate = true,
    retryAttempts = 3,
    retryDelay = 1000,
    cacheKey = null,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    onSuccess = null,
    onError = null
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const abortControllerRef = useRef(null)
  const cacheRef = useRef(new Map())
  const { trackApiRequest } = useNetworkPerformance()

  // Cache utilities
  const getCachedData = useCallback((key) => {
    const cached = cacheRef.current.get(key)
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data
    }
    return null
  }, [cacheDuration])

  const setCachedData = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [])

  // Main fetch function with retry logic
  const fetchData = useCallback(async (...args) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    // Check cache first
    if (cacheKey) {
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        setError(null)
        return cachedData
      }
    }

    setLoading(true)
    setError(null)
    
    let lastError = null
    
    for (let i = 0; i <= retryAttempts; i++) {
      try {
        setAttempt(i)
        
        const startTime = performance.now()
        const result = await apiFunction({ signal, ...args })
        const endTime = performance.now()
        
        // Track API performance
        trackApiRequest(apiFunction.name || 'API Request', startTime, endTime, true)
        
        setData(result)
        setLoading(false)
        setError(null)
        setAttempt(0)
        
        // Cache successful result
        if (cacheKey) {
          setCachedData(cacheKey, result)
        }
        
        // Success callback
        if (onSuccess) {
          onSuccess(result)
        }
        
        return result
      } catch (err) {
        lastError = err
        
        // Don't retry if request was aborted
        if (err.name === 'AbortError') {
          break
        }
        
        // Track failed API request
        const endTime = performance.now()
        trackApiRequest(apiFunction.name || 'API Request', 0, endTime, false)
        
        // If not the last attempt, wait before retrying
        if (i < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i)))
        }
      }
    }
    
    // All retries failed
    const processedError = handleApiError(lastError)
    setError(processedError)
    setLoading(false)
    setAttempt(0)
    
    // Error callback
    if (onError) {
      onError(processedError)
    }
    
    throw processedError
  }, [apiFunction, retryAttempts, retryDelay, cacheKey, getCachedData, setCachedData, trackApiRequest, onSuccess, onError])

  // Effect to fetch data when dependencies change
  useEffect(() => {
    if (immediate) {
      fetchData(...dependencies)
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, dependencies)

  // Manual refetch function
  const refetch = useCallback((...args) => {
    return fetchData(...args)
  }, [fetchData])

  // Clear cache function
  const clearCache = useCallback(() => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey)
    }
  }, [cacheKey])

  return {
    data,
    loading,
    error,
    attempt,
    refetch,
    clearCache
  }
}

// =============================================================================
// PAGINATED API HOOK
// =============================================================================

/**
 * Hook for paginated API calls with search and filtering
 * Manages pagination state and provides utilities for data manipulation
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    searchDebounceMs = 300,
    cachePages = true
  } = options

  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')

  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term)
      setPage(1) // Reset to first page on search
    }, searchDebounceMs),
    [searchDebounceMs]
  )

  const apiParams = {
    page,
    per_page: pageSize,
    search: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...filters
  }

  const cacheKey = cachePages ? `paginated-${JSON.stringify(apiParams)}` : null

  const {
    data: response,
    loading,
    error,
    refetch,
    clearCache
  } = useApi(
    apiFunction,
    [apiParams],
    { cacheKey, immediate: true }
  )

  // Extract pagination data from response
  useEffect(() => {
    if (response?.data) {
      setTotalPages(response.last_page || 0)
      setTotalItems(response.total || 0)
    }
  }, [response])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1)
    }
  }, [page, totalPages])

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }, [page])

  const goToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber)
    }
  }, [totalPages])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }, [])

  const updateSort = useCallback((field, order = 'asc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1) // Reset to first page when sort changes
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setSortBy(null)
    setSortOrder('asc')
    setPage(1)
  }, [])

  return {
    // Data
    data: response?.data || [],
    items: response?.data || [],
    
    // Pagination
    page,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    
    // Navigation
    nextPage,
    prevPage,
    goToPage,
    setPage,
    
    // Search and filters
    searchTerm,
    setSearchTerm: debouncedSearch,
    filters,
    updateFilters,
    clearFilters,
    
    // Sorting
    sortBy,
    sortOrder,
    updateSort,
    
    // State
    loading,
    error,
    refetch,
    clearCache
  }
}

// =============================================================================
// INFINITE SCROLL HOOK
// =============================================================================

/**
 * Hook for infinite scroll functionality
 * Automatically loads more data when user scrolls near bottom
 */
export const useInfiniteScroll = (apiFunction, options = {}) => {
  const {
    pageSize = 10,
    threshold = 0.8, // Load more when 80% scrolled
    enabled = true
  } = options

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const observerRef = useRef(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !enabled) return

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await apiFunction({
        page,
        per_page: pageSize
      })

      const newItems = response.data || []
      
      if (newItems.length === 0 || newItems.length < pageSize) {
        setHasMore(false)
      }

      setItems(prev => [...prev, ...newItems])
      setPage(prev => prev + 1)
    } catch (err) {
      const processedError = handleApiError(err)
      setError(processedError)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [apiFunction, page, pageSize, hasMore, enabled])

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold }
    )

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, threshold, hasMore, loading, enabled])

  // Reset function
  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
    loadingRef.current = false
  }, [])

  // Manual load more function
  const manualLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMore()
    }
  }, [loadMore, loading, hasMore])

  // Ref callback for the loading trigger element
  const setTriggerRef = useCallback((node) => {
    if (observerRef.current && node) {
      observerRef.current.observe(node)
    }
  }, [])

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore: manualLoadMore,
    reset,
    setTriggerRef
  }
}

// =============================================================================
// OPTIMISTIC UPDATES HOOK
// =============================================================================

/**
 * Hook for optimistic UI updates
 * Updates UI immediately then syncs with server
 */
export const useOptimisticUpdate = (apiFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    rollbackOnError = true
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const previousDataRef = useRef(null)

  const mutate = useCallback(async (optimisticData, actualUpdateFn) => {
    // Store previous data for rollback
    previousDataRef.current = data

    // Apply optimistic update immediately
    setData(optimisticData)
    setLoading(true)
    setError(null)

    try {
      // Perform actual API call
      const result = await apiFunction(actualUpdateFn)
      
      // Update with real data from server
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      const processedError = handleApiError(err)
      setError(processedError)
      
      // Rollback to previous data on error
      if (rollbackOnError) {
        setData(previousDataRef.current)
      }
      
      if (onError) {
        onError(processedError)
      }
      
      throw processedError
    } finally {
      setLoading(false)
    }
  }, [data, apiFunction, onSuccess, onError, rollbackOnError])

  return {
    data,
    loading,
    error,
    mutate,
    setData
  }
}

// =============================================================================
// EXPORT ALL HOOKS
// =============================================================================

export default {
  useApi,
  usePaginatedApi,
  useInfiniteScroll,
  useOptimisticUpdate
}
