import React, { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createCustomTheme } from '../theme/theme'
import { STORAGE_KEYS, THEME_CONFIG } from '../utils/constants'
import { storage } from '../utils/helpers'

// Enhanced theme context with system preference detection and persistence
// Provides smooth theme transitions and accessibility support
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  theme: null,
  systemPreference: 'light',
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider')
  }
  return context
}

export const CustomThemeProvider = ({ children }) => {
  // Detect system theme preference
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Initialize theme state
  const [systemPreference, setSystemPreference] = useState(getSystemTheme())
  const [mode, setMode] = useState(() => {
    const saved = storage.get(STORAGE_KEYS.THEME_MODE)
    return saved || systemPreference
  })

  // Create theme based on current mode
  const theme = createCustomTheme(mode)

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      const newSystemPreference = e.matches ? 'dark' : 'light'
      setSystemPreference(newSystemPreference)
      
      // Update theme if user hasn't manually set a preference
      const userPreference = storage.get(STORAGE_KEYS.THEME_MODE)
      if (!userPreference) {
        setMode(newSystemPreference)
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  // Persist theme preference
  useEffect(() => {
    storage.set(STORAGE_KEYS.THEME_MODE, mode)
    
    // Update document theme for CSS variables
    document.documentElement.setAttribute('data-theme', mode)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        mode === 'light' ? '#1976d2' : '#90caf9'
      )
    }
  }, [mode])

  // Theme toggle function
  const toggleTheme = () => {
    setMode(prevMode => {
      const newMode = prevMode === THEME_CONFIG.modes.LIGHT 
        ? THEME_CONFIG.modes.DARK 
        : THEME_CONFIG.modes.LIGHT
      
      // Add smooth transition class
      document.documentElement.classList.add('theme-transition')
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition')
      }, 300)
      
      return newMode
    })
  }

  // Set specific theme
  const setTheme = (newMode) => {
    if (Object.values(THEME_CONFIG.modes).includes(newMode)) {
      setMode(newMode)
    }
  }

  // Reset to system preference
  const resetToSystem = () => {
    setMode(systemPreference)
    storage.remove(STORAGE_KEYS.THEME_MODE)
  }

  const value = {
    mode,
    toggleTheme,
    setTheme,
    resetToSystem,
    theme,
    systemPreference,
    isSystemTheme: mode === systemPreference && !storage.get(STORAGE_KEYS.THEME_MODE),
  }

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <style jsx="true" global="true">{`
          .theme-transition,
          .theme-transition *,
          .theme-transition *:before,
          .theme-transition *:after {
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-delay: 0ms !important;
          }
        `}</style>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}