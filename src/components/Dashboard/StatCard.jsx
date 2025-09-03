import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Skeleton
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as UsersIcon,
  Description as DocumentsIcon,
  Article as NewsIcon,
  Visibility as ViewsIcon,
  Assessment as StatsIcon
} from '@mui/icons-material'

// Enhanced statistics card with growth indicators and icons
// Displays key metrics with visual appeal and trend information
const StatCard = ({ 
  title, 
  value, 
  growth, 
  icon, 
  color = 'primary',
  subtitle,
  loading = false 
}) => {
  const theme = useTheme()

  // Icon mapping
  const iconMap = {
    users: UsersIcon,
    documents: DocumentsIcon,
    news: NewsIcon,
    views: ViewsIcon,
    stats: StatsIcon
  }

  const IconComponent = iconMap[icon] || StatsIcon

  // Color mapping
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  }

  const cardColor = colorMap[color] || theme.palette.primary.main
  const isPositiveGrowth = growth >= 0
  const growthColor = isPositiveGrowth ? theme.palette.success.main : theme.palette.error.main

  // Loading skeleton
  if (loading) {
    return (
      <Card sx={{ height: 140 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
          <Skeleton variant="text" width="50%" height={16} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        height: 140,
        position: 'relative',
        overflow: 'hidden',
        transition: theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: cardColor,
        }
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with title and icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mt: 0.5,
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
          </Box>
          
          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${cardColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComponent
              sx={{
                fontSize: 24,
                color: cardColor
              }}
            />
          </Box>
        </Box>

        {/* Footer with growth and subtitle */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Subtitle */}
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {subtitle}
              </Typography>
            )}
            
            {/* Growth indicator */}
            {typeof growth === 'number' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: `${growthColor}15`,
                }}
              >
                {isPositiveGrowth ? (
                  <TrendingUpIcon 
                    sx={{ 
                      fontSize: 14, 
                      color: growthColor 
                    }} 
                  />
                ) : (
                  <TrendingDownIcon 
                    sx={{ 
                      fontSize: 14, 
                      color: growthColor 
                    }} 
                  />
                )}
                
                <Typography
                  variant="caption"
                  sx={{
                    color: growthColor,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  {Math.abs(growth).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatCard