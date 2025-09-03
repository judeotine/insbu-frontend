import React from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  useTheme,
  Container
} from '@mui/material'
import { 
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Professional 404 page with helpful navigation and modern design
const NotFound = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/')
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      handleGoHome()
    }
  }

  const handleSearch = () => {
    navigate('/search')
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4
        }}
      >
        {/* 404 Illustration */}
        <Box
          sx={{
            mb: 4,
            position: 'relative'
          }}
        >
          {/* Large 404 Text */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
              fontWeight: 700,
              color: theme.palette.primary.main,
              opacity: 0.1,
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}
          >
            404
          </Typography>
          
          {/* Overlay content */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[8],
                mb: 2,
                mx: 'auto'
              }}
            >
              <SearchIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'white',
                  opacity: 0.9
                }} 
              />
            </Box>
          </Box>
        </Box>

        {/* Error message card */}
        <Card 
          sx={{ 
            maxWidth: 600, 
            width: '100%',
            mb: 4,
            boxShadow: theme.shadows[4]
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2
              }}
            >
              Page Not Found
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                fontWeight: 400
              }}
            >
              The page you're looking for doesn't exist
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                lineHeight: 1.6
              }}
            >
              The page <code style={{ 
                backgroundColor: theme.palette.action.hover,
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: 'monospace'
              }}>{location.pathname}</code> might have been moved, deleted, or you entered the wrong URL.
            </Typography>

            {/* Action buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                mt: 4
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  minWidth: 140
                }}
              >
                Go Home
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<BackIcon />}
                onClick={handleGoBack}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  minWidth: 140
                }}
              >
                Go Back
              </Button>
              
              {isAuthenticated && (
                <Button
                  variant="text"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    minWidth: 140
                  }}
                >
                  Search
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Helpful links */}
        {isAuthenticated && (
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: theme.palette.text.primary }}
              >
                Quick Navigation
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center'
                }}
              >
                {[
                  { label: 'Dashboard', path: '/dashboard' },
                  { label: 'News', path: '/news' },
                  { label: 'Documents', path: '/documents' },
                  { label: 'Resources', path: '/resources' },
                ].map(({ label, path }) => (
                  <Button
                    key={path}
                    variant="text"
                    size="small"
                    onClick={() => navigate(path)}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      py: 0.5
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Additional help text */}
        <Typography
          variant="body2"
          sx={{
            mt: 4,
            color: theme.palette.text.secondary,
            opacity: 0.7,
            maxWidth: 400
          }}
        >
          If you continue to experience issues, please contact our support team.
        </Typography>
      </Box>
    </Container>
  )
}

export default NotFound
