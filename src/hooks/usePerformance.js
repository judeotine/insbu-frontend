// Advanced performance monitoring hooks for React components
// Tracks render counts, component lifecycle, bundle metrics, and memory usage

import { useEffect, useRef, useState, useCallback } from 'react'
import { isDevelopment, perfMark, perfMeasure } from '../utils/helpers'

// =============================================================================
// RENDER TRACKING HOOK
// =============================================================================

/**
 * Tracks component render counts and performance in development
 * Useful for identifying unnecessary re-renders and performance bottlenecks
 */
export const useRenderTracker = (componentName = 'Unknown Component') => {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())
  const mountTime = useRef(Date.now())

  if (isDevelopment()) {
    renderCount.current += 1
    const currentTime = Date.now()
    const timeSinceLastRender = currentTime - lastRenderTime.current
    const timeSinceMount = currentTime - mountTime.current

    // Log render information in development
    if (renderCount.current === 1) {
      console.log(`🟢 ${componentName} mounted`)
    } else if (timeSinceLastRender > 16) { // More than one frame
      console.log(`🔄 ${componentName} rendered #${renderCount.current} (${timeSinceLastRender}ms since last render)`)
    }

    lastRenderTime.current = currentTime

    // Performance mark for each render
    perfMark(`${componentName}-render-${renderCount.current}`)

    useEffect(() => {
      const renderEndTime = Date.now()
      const renderDuration = renderEndTime - currentTime
      
      if (renderDuration > 16) {
        console.warn(`⚠️ ${componentName} slow render: ${renderDuration}ms`)
      }

      return () => {
        console.log(`🔴 ${componentName} unmounted (lived ${Date.now() - mountTime.current}ms)`)
      }
    }, [componentName])
  }

  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - mountTime.current
  }
}

// =============================================================================
// COMPONENT LIFECYCLE HOOK
// =============================================================================

/**
 * Tracks detailed component lifecycle events
 * Provides insights into mount, update, and unmount timings
 */
export const useLifecycleTracker = (componentName = 'Component') => {
  const [lifecycle, setLifecycle] = useState({
    mounted: false,
    mountTime: null,
    updateCount: 0,
    lastUpdateTime: null
  })

  const updateCount = useRef(0)

  useEffect(() => {
    // Component mounted
    const mountTime = Date.now()
    setLifecycle(prev => ({
      ...prev,
      mounted: true,
      mountTime
    }))

    if (isDevelopment()) {
      console.log(`📍 ${componentName} lifecycle: MOUNTED at ${new Date(mountTime).toLocaleTimeString()}`)
    }

    return () => {
      // Component unmounting
      const unmountTime = Date.now()
      const lifespan = unmountTime - mountTime
      
      if (isDevelopment()) {
        console.log(`📍 ${componentName} lifecycle: UNMOUNTING after ${lifespan}ms (${updateCount.current} updates)`)
      }
    }
  }, [componentName])

  useEffect(() => {
    // Component updated (skip first render/mount)
    if (lifecycle.mounted) {
      updateCount.current += 1
      const updateTime = Date.now()
      
      setLifecycle(prev => ({
        ...prev,
        updateCount: updateCount.current,
        lastUpdateTime: updateTime
      }))

      if (isDevelopment()) {
        console.log(`📍 ${componentName} lifecycle: UPDATE #${updateCount.current} at ${new Date(updateTime).toLocaleTimeString()}`)
      }
    }
  })

  return lifecycle
}

// =============================================================================
// BUNDLE METRICS HOOK
// =============================================================================

/**
 * Monitors bundle loading and JavaScript heap usage
 * Provides insights into bundle size and memory consumption
 */
export const useBundleMetrics = () => {
  const [metrics, setMetrics] = useState({
    bundleLoaded: false,
    loadTime: null,
    jsHeapSize: null,
    jsHeapSizeLimit: null,
    jsHeapUsedSize: null
  })

  useEffect(() => {
    const measureBundleMetrics = () => {
      const loadTime = performance.now()
      
      // Memory information (Chrome only)
      const memory = performance.memory
      const memoryInfo = memory ? {
        jsHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        jsHeapUsedSize: memory.usedJSHeapSize
      } : null

      setMetrics({
        bundleLoaded: true,
        loadTime,
        ...memoryInfo
      })

      if (isDevelopment()) {
        console.group('📦 Bundle Metrics')
        console.log(`Load time: ${loadTime.toFixed(2)}ms`)
        
        if (memoryInfo) {
          console.log(`JS Heap Used: ${(memoryInfo.jsHeapUsedSize / 1024 / 1024).toFixed(2)} MB`)
          console.log(`JS Heap Total: ${(memoryInfo.jsHeapSize / 1024 / 1024).toFixed(2)} MB`)
          console.log(`JS Heap Limit: ${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`)
        }
        console.groupEnd()
      }
    }

    // Measure after DOM is ready
    if (document.readyState === 'complete') {
      measureBundleMetrics()
    } else {
      window.addEventListener('load', measureBundleMetrics)
      return () => window.removeEventListener('load', measureBundleMetrics)
    }
  }, [])

  return metrics
}

// =============================================================================
// MEMORY USAGE HOOK
// =============================================================================

/**
 * Monitors memory usage over time
 * Helps identify memory leaks and optimize memory consumption
 */
export const useMemoryMonitor = (interval = 5000) => {
  const [memoryData, setMemoryData] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  const clearData = useCallback(() => {
    setMemoryData([])
  }, [])

  useEffect(() => {
    if (!isMonitoring || !isDevelopment()) return

    const monitor = setInterval(() => {
      const memory = performance.memory
      if (memory) {
        const timestamp = Date.now()
        const memorySnapshot = {
          timestamp,
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        }

        setMemoryData(prev => {
          const newData = [...prev, memorySnapshot]
          // Keep only last 50 measurements
          return newData.slice(-50)
        })

        // Warn if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        if (usagePercent > 80) {
          console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`)
        }
      }
    }, interval)

    return () => clearInterval(monitor)
  }, [isMonitoring, interval])

  return {
    memoryData,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearData,
    hasMemoryAPI: !!performance.memory
  }
}

// =============================================================================
// PERFORMANCE PROFILER HOOK
// =============================================================================

/**
 * Comprehensive performance profiler for React components
 * Combines multiple metrics into a single monitoring solution
 */
export const usePerformanceProfiler = (componentName = 'Component', options = {}) => {
  const {
    trackRenders = true,
    trackLifecycle = true,
    trackMemory = false,
    memoryInterval = 10000
  } = options

  // Render tracking
  const renderMetrics = trackRenders ? useRenderTracker(componentName) : null

  // Lifecycle tracking
  const lifecycleMetrics = trackLifecycle ? useLifecycleTracker(componentName) : null

  // Memory monitoring
  const memoryMonitor = trackMemory ? useMemoryMonitor(memoryInterval) : null

  // Performance timing measurements
  const [performanceTimings, setPerformanceTimings] = useState({})

  const startTiming = useCallback((name) => {
    if (isDevelopment()) {
      const markName = `${componentName}-${name}-start`
      perfMark(markName)
      
      setPerformanceTimings(prev => ({
        ...prev,
        [name]: { startTime: performance.now(), startMark: markName }
      }))
    }
  }, [componentName])

  const endTiming = useCallback((name) => {
    if (isDevelopment()) {
      const timing = performanceTimings[name]
      if (timing) {
        const endTime = performance.now()
        const duration = endTime - timing.startTime
        const endMark = `${componentName}-${name}-end`
        const measureName = `${componentName}-${name}`
        
        perfMark(endMark)
        perfMeasure(measureName, timing.startMark, endMark)
        
        setPerformanceTimings(prev => ({
          ...prev,
          [name]: { ...timing, endTime, duration }
        }))

        console.log(`⏱️ ${componentName} ${name}: ${duration.toFixed(2)}ms`)
      }
    }
  }, [componentName, performanceTimings])

  // Generate performance report
  const generateReport = useCallback(() => {
    if (!isDevelopment()) return null

    const report = {
      component: componentName,
      timestamp: new Date().toISOString(),
      renders: renderMetrics,
      lifecycle: lifecycleMetrics,
      timings: performanceTimings,
      memory: memoryMonitor?.memoryData.slice(-1)[0] || null
    }

    console.group(`📊 Performance Report: ${componentName}`)
    console.table(report)
    console.groupEnd()

    return report
  }, [componentName, renderMetrics, lifecycleMetrics, performanceTimings, memoryMonitor])

  return {
    renderMetrics,
    lifecycleMetrics,
    memoryMonitor,
    performanceTimings,
    startTiming,
    endTiming,
    generateReport
  }
}

// =============================================================================
// NETWORK PERFORMANCE HOOK
// =============================================================================

/**
 * Monitors network performance and connection quality
 * Tracks API response times and connection status
 */
export const useNetworkPerformance = () => {
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null
  })

  const [apiMetrics, setApiMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    slowestRequest: null,
    fastestRequest: null
  })

  // Track network status changes
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      
      setNetworkStatus({
        online: navigator.onLine,
        connectionType: connection?.type || null,
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null
      })
    }

    // Initial status
    updateNetworkStatus()

    // Listen for changes
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    const connection = navigator.connection
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  // Track API request performance
  const trackApiRequest = useCallback((url, startTime, endTime, success = true) => {
    const responseTime = endTime - startTime

    setApiMetrics(prev => {
      const totalRequests = prev.totalRequests + 1
      const successfulRequests = success ? prev.successfulRequests + 1 : prev.successfulRequests
      const failedRequests = success ? prev.failedRequests : prev.failedRequests + 1
      
      // Calculate new average
      const totalResponseTime = (prev.averageResponseTime * prev.totalRequests) + responseTime
      const averageResponseTime = totalResponseTime / totalRequests

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        slowestRequest: !prev.slowestRequest || responseTime > prev.slowestRequest.time 
          ? { url, time: responseTime } 
          : prev.slowestRequest,
        fastestRequest: !prev.fastestRequest || responseTime < prev.fastestRequest.time 
          ? { url, time: responseTime } 
          : prev.fastestRequest
      }
    })

    if (isDevelopment()) {
      const status = success ? '✅' : '❌'
      console.log(`${status} API Request: ${url} (${responseTime.toFixed(2)}ms)`)
    }
  }, [])

  const getNetworkQuality = useCallback(() => {
    if (!networkStatus.online) return 'offline'
    
    const { effectiveType, rtt, downlink } = networkStatus
    
    if (effectiveType === '4g' && rtt < 100 && downlink > 1) return 'excellent'
    if (effectiveType === '4g' || (rtt < 200 && downlink > 0.5)) return 'good'
    if (effectiveType === '3g' || (rtt < 500 && downlink > 0.1)) return 'fair'
    return 'poor'
  }, [networkStatus])

  return {
    networkStatus,
    apiMetrics,
    trackApiRequest,
    getNetworkQuality,
    quality: getNetworkQuality()
  }
}

// =============================================================================
// EXPORT ALL HOOKS
// =============================================================================

export default {
  useRenderTracker,
  useLifecycleTracker,
  useBundleMetrics,
  useMemoryMonitor,
  usePerformanceProfiler,
  useNetworkPerformance
}
