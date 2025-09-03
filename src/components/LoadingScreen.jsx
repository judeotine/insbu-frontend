import React from 'react'
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
  useTheme,
  Button,
  Card,
  CardContent,
  Skeleton
} from '@mui/material'
import { APP_CONFIG } from '../utils/constants'

// Beautiful loading screen with animations and branding
// Provides smooth loading experience with theme-aware styling
const LoadingScreen = ({ 
  message = 'Loading...', 
  size = 60,
  showLogo = true,
  fullScreen = true 
}) => {
  const theme = useTheme()

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.background.default,
      zIndex: theme.zIndex.modal + 1
    }),
    ...(!fullScreen && {
      minHeight: '200px',
      padding: theme.spacing(4)
    })
  }

  return (
    <Fade in timeout={300}>
      <Box sx={containerStyles}>
        {/* Logo/Branding */}
        {showLogo && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}
          >
            {/* Logo placeholder - you can replace with actual logo */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[4],
                animation: 'pulse 2s infinite'
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                I
              </Typography>
            </Box>

            {/* App name */}
            <Typography
              variant="h5"
              component="h1"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                textAlign: 'center',
                opacity: 0.9
              }}
            >
              {APP_CONFIG.name}
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
                opacity: 0.7,
                fontSize: '0.875rem'
              }}
            >
              {APP_CONFIG.description}
            </Typography>
          </Box>
        )}

        {/* Loading spinner */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              animation: 'spin 1.5s linear infinite'
            }}
          />
          
          {/* Secondary progress ring */}
          <CircularProgress
            size={size + 20}
            thickness={2}
            variant="indeterminate"
            sx={{
              color: theme.palette.primary.light,
              position: 'absolute',
              opacity: 0.3,
              animationDuration: '2s'
            }}
          />
        </Box>

        {/* Loading message */}
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            fontWeight: 500,
            letterSpacing: '0.025em'
          }}
        >
          {message}
        </Typography>

        {/* Loading dots animation */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            mt: 1
          }}
        >
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                opacity: 0.6,
                animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite both`
              }}
            />
          ))}
        </Box>

        {/* CSS animations */}
        <style jsx="true" global="true">{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.05);
              opacity: 0.8;
            }
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </Box>
    </Fade>
  )
}

// Loading overlay component for use within other components
export const LoadingOverlay = ({ loading, children, message = 'Loading...' }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: 'inherit'
          }}
        >
          <LoadingScreen 
            message={message}
            size={40}
            showLogo={false}
            fullScreen={false}
          />
        </Box>
      )}
    </Box>
  )
}

// Loading button component
export const LoadingButton = ({ 
  loading, 
  children, 
  loadingText = 'Loading...', 
  ...props 
}) => {
  return (
    <Button
      {...props}
      disabled={loading || props.disabled}
      startIcon={loading ? <CircularProgress size={16} /> : props.startIcon}
    >
      {loading ? loadingText : children}
    </Button>
  )
}

// Skeleton loading for cards
export const CardSkeleton = ({ count = 1, height = 200 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={height} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="text" width="20%" height={20} />
              <Skeleton variant="text" width="15%" height={20} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default LoadingScreen
