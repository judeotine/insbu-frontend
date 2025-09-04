import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
  Button,
  Skeleton,
  useTheme
} from '@mui/material'
import {
  Article as NewsIcon,
  Description as DocumentIcon,
  Person as UserIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material'
import { formatRelativeTime } from '../../utils/helpers'

// Recent activity feed component with real-time updates
// Displays latest user actions and system events
const RecentActivity = ({ activities = [], loading = false, maxItems = 8 }) => {
  const theme = useTheme()

  // Sample activity data for development/demo
  const sampleActivities = [
    {
      id: 1,
      type: 'document',
      action: 'uploaded',
      title: 'Economic Report Q4 2023',
      user: 'Marie Uwimana',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      category: 'Economic Reports'
    },
    {
      id: 2,
      type: 'news',
      action: 'published',
      title: 'New Census Data Available',
      user: 'Jean Baptiste',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      category: 'Census Data'
    },
    {
      id: 3,
      type: 'user',
      action: 'registered',
      title: 'New user joined',
      user: 'Alice Mukamana',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      category: 'System'
    },
    {
      id: 4,
      type: 'document',
      action: 'downloaded',
      title: 'Agriculture Statistics 2023',
      user: 'Pierre Ntahobari',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      category: 'Agriculture'
    },
    {
      id: 5,
      type: 'news',
      action: 'edited',
      title: 'Healthcare Statistics Update',
      user: 'Marie Uwimana',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'Healthcare'
    },
    {
      id: 6,
      type: 'document',
      action: 'uploaded',
      title: 'Education Report 2023',
      user: 'John Nshimirimana',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      category: 'Education'
    },
    {
      id: 7,
      type: 'news',
      action: 'published',
      title: 'Infrastructure Development Stats',
      user: 'Grace Niragire',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      category: 'Infrastructure'
    },
    {
      id: 8,
      type: 'user',
      action: 'login',
      title: 'User logged in',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      category: 'System'
    }
  ]

  const activityData = activities.length > 0 ? activities : sampleActivities
  const displayedActivities = activityData.slice(0, maxItems)

  // Get icon based on activity type and action
  const getActivityIcon = (type, action) => {
    switch (type) {
      case 'document':
        return action === 'uploaded' ? <UploadIcon /> : <DocumentIcon />
      case 'news':
        return action === 'published' ? <NewsIcon /> : <EditIcon />
      case 'user':
        return action === 'login' ? <ViewIcon /> : <UserIcon />
      default:
        return <DocumentIcon />
    }
  }

  // Get color based on activity type
  const getActivityColor = (type, action) => {
    switch (type) {
      case 'document':
        return action === 'uploaded' ? theme.palette.primary.main : theme.palette.info.main
      case 'news':
        return action === 'published' ? theme.palette.success.main : theme.palette.warning.main
      case 'user':
        return theme.palette.secondary.main
      default:
        return theme.palette.text.secondary
    }
  }

  // Get action text with proper formatting
  const getActionText = (activity) => {
    const { type, action, title, user } = activity
    
    switch (type) {
      case 'document':
        return (
          <>
            <strong>{user}</strong> {action} document{' '}
            <em>"{title}"</em>
          </>
        )
      case 'news':
        return (
          <>
            <strong>{user}</strong> {action} news article{' '}
            <em>"{title}"</em>
          </>
        )
      case 'user':
        return (
          <>
            <strong>{user}</strong> {action === 'registered' ? 'joined the platform' : action}
          </>
        )
      default:
        return (
          <>
            <strong>{user}</strong> performed action on{' '}
            <em>"{title}"</em>
          </>
        )
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
          <List disablePadding>
            {Array.from({ length: 5 }).map((_, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="80%" />}
                  secondary={<Skeleton variant="text" width="40%" />}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        <List disablePadding>
          {displayedActivities.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: index < displayedActivities.length - 1 
                  ? `1px solid ${theme.palette.divider}` 
                  : 'none',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 1,
                  mx: -1,
                  px: 1,
                },
                transition: theme.transitions.create(['background-color'], {
                  duration: theme.transitions.duration.short,
                }),
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    backgroundColor: getActivityColor(activity.type, activity.action),
                    width: 40,
                    height: 40,
                  }}
                >
                  {getActivityIcon(activity.type, activity.action)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.4,
                      mb: 0.5,
                      '& strong': {
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      },
                      '& em': {
                        fontStyle: 'normal',
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                      },
                    }}
                  >
                    {getActionText(activity)}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }} component="div">
                    <Typography variant="caption" color="text.secondary" component="span">
                      {formatRelativeTime(activity.timestamp)}
                    </Typography>
                    {activity.category && (
                      <Chip
                        label={activity.category}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    )}
                  </Box>
                }
                secondaryTypographyProps={{
                  component: 'div'
                }}
              />
            </ListItem>
          ))}
        </List>

        {displayedActivities.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="body2">
              No recent activity to display
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivity