// Professional Material UI theme for INSBU Statistics Portal
// Provides comprehensive styling with dark/light mode support and accessibility features

import { createTheme } from '@mui/material/styles'

// =============================================================================
// COLOR PALETTE DEFINITIONS
// =============================================================================

const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    neutral: '#f5f5f5',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
}

const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: '#000000',
  },
  secondary: {
    main: '#f48fb1',
    light: '#fce4ec',
    dark: '#ad1457',
    contrastText: '#000000',
  },
  success: {
    main: '#81c784',
    light: '#c8e6c9',
    dark: '#4caf50',
    contrastText: '#000000',
  },
  warning: {
    main: '#ffb74d',
    light: '#fff3e0',
    dark: '#ff9800',
    contrastText: '#000000',
  },
  error: {
    main: '#e57373',
    light: '#ffebee',
    dark: '#f44336',
    contrastText: '#000000',
  },
  info: {
    main: '#64b5f6',
    light: '#e1f5fe',
    dark: '#2196f3',
    contrastText: '#000000',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    neutral: '#2c2c2c',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
}

// =============================================================================
// TYPOGRAPHY CONFIGURATION
// =============================================================================

const typography = {
  fontFamily: [
    'Roboto',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  
  // Headings with consistent scaling
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.005em',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  
  // Body text variants
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // UI text variants
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.025em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  
  // Button text
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.025em',
    textTransform: 'none',
  },
}

// =============================================================================
// COMPONENT CUSTOMIZATIONS
// =============================================================================

const getComponentOverrides = (mode) => ({
  // App Bar customization
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'light' ? '#1976d2' : '#1e1e1e',
        boxShadow: mode === 'light' 
          ? '0 2px 4px rgba(0,0,0,0.1)' 
          : '0 2px 4px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
      },
    },
  },
  
  // Card improvements
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'light'
          ? '0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'light'
            ? '0 4px 16px rgba(0,0,0,0.15)'
            : '0 4px 16px rgba(0,0,0,0.4)',
        },
      },
    },
  },
  
  // Paper elevation improvements
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: mode === 'light'
          ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
          : '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.5)',
      },
      elevation2: {
        boxShadow: mode === 'light'
          ? '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)'
          : '0 3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.25)',
      },
    },
  },
  
  // Button improvements
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
        padding: '8px 16px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
        },
      },
      sizeSmall: {
        padding: '6px 12px',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '0.9375rem',
      },
    },
  },
  
  // Input field improvements
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        transition: 'all 0.2s ease',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: mode === 'light' ? '#1976d2' : '#90caf9',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 2,
        },
      },
    },
  },
  
  // TextField improvements
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiInputLabel-root': {
          fontWeight: 500,
        },
      },
    },
  },
  
  // Chip improvements
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontWeight: 500,
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
    },
  },
  
  // Dialog improvements
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: mode === 'light'
          ? '0 10px 40px rgba(0,0,0,0.2)'
          : '0 10px 40px rgba(0,0,0,0.5)',
      },
    },
  },
  
  // Table improvements
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
      },
      head: {
        fontWeight: 600,
        backgroundColor: mode === 'light' ? '#f5f5f5' : '#2c2c2c',
      },
    },
  },
  
  // Drawer improvements
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: '0 16px 16px 0',
        borderRight: 'none',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      },
    },
  },
  
  // Menu improvements
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        marginTop: 4,
        boxShadow: mode === 'light'
          ? '0 4px 20px rgba(0,0,0,0.15)'
          : '0 4px 20px rgba(0,0,0,0.4)',
      },
    },
  },
  
  // Loading button
  MuiLoadingButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  
  // Tooltip improvements
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.875rem',
        padding: '8px 12px',
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
        color: mode === 'light' ? '#ffffff' : '#000000',
      },
      arrow: {
        color: mode === 'light' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
      },
    },
  },
  
  // Snackbar improvements
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiSnackbarContent-root': {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
  },
})

// =============================================================================
// BREAKPOINT CUSTOMIZATION
// =============================================================================

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
}

// =============================================================================
// SPACING CUSTOMIZATION
// =============================================================================

const spacing = 8 // Base spacing unit (8px)

// =============================================================================
// THEME FACTORY FUNCTION
// =============================================================================

export const createCustomTheme = (mode = 'light') => {
  const palette = mode === 'light' ? lightPalette : darkPalette
  
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography,
    breakpoints,
    spacing,
    components: getComponentOverrides(mode),
    
    // Custom theme extensions
    custom: {
      // Dashboard card colors
      dashboard: {
        primary: palette.primary.main,
        secondary: palette.secondary.main,
        success: palette.success.main,
        warning: palette.warning.main,
        error: palette.error.main,
        info: palette.info.main,
      },
      
      // Chart colors
      chart: {
        colors: [
          palette.primary.main,
          palette.secondary.main,
          palette.success.main,
          palette.warning.main,
          palette.info.main,
          '#9c27b0', // Purple
          '#ff5722', // Deep Orange
          '#009688', // Teal
          '#3f51b5', // Indigo
          '#795548', // Brown
        ],
      },
      
      // Sidebar styling
      sidebar: {
        width: 280,
        collapsedWidth: 64,
        backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
        borderColor: mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
      },
      
      // Content area styling
      content: {
        backgroundColor: palette.background.default,
        maxWidth: 1200,
        padding: spacing * 3,
      },
      
      // Animation durations
      transitions: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      
      // Z-index scale
      zIndex: {
        sidebar: 1200,
        appBar: 1300,
        modal: 1400,
        tooltip: 1500,
      },
      
      // Border radius scale
      borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        extraLarge: 16,
        round: '50%',
      },
      
      // Box shadow scale
      shadows: {
        light: mode === 'light' 
          ? '0 1px 3px rgba(0,0,0,0.12)' 
          : '0 1px 3px rgba(0,0,0,0.3)',
        medium: mode === 'light' 
          ? '0 4px 6px rgba(0,0,0,0.1)' 
          : '0 4px 6px rgba(0,0,0,0.3)',
        heavy: mode === 'light' 
          ? '0 10px 25px rgba(0,0,0,0.15)' 
          : '0 10px 25px rgba(0,0,0,0.4)',
      },
    },
    
    // Shape customization
    shape: {
      borderRadius: 8,
    },
    
    // Accessibility improvements
    accessibility: {
      focusRing: {
        color: palette.primary.main,
        width: 2,
        offset: 2,
      },
      contrast: {
        minimum: 4.5, // WCAG AA standard
        enhanced: 7, // WCAG AAA standard
      },
    },
  })
}

// Export default light theme
export default createCustomTheme('light')