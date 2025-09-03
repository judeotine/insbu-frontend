import React from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material'
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  AccessTime as TimeIcon,
  Person as AuthorIcon
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { formatRelativeTime, truncateText } from '../../utils/helpers'

// Enhanced news card component with actions and responsive design
// Displays news articles with proper formatting and role-based actions
const NewsCard = ({ 
  news, 
  onEdit, 
  onDelete, 
  onShare,
  showActions = true,
  variant = 'default' // 'default', 'compact', 'featured'
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [menuAnchor, setMenuAnchor] = useState(null)

  const {
    id,
    title,
    content,
    excerpt,
    author,
    category,
    status = 'published',
    featured_image,
    created_at,
    updated_at,
    views_count = 0
  } = news

  const canEdit = hasRole(['admin', 'editor'])
  const canDelete = hasRole(['admin', 'editor'])

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleView = () => {
    navigate(`/news/${id}`)
  }

  const handleEdit = (event) => {
    event.stopPropagation()
    handleMenuClose()
    if (onEdit) {
      onEdit(news)
    } else {
      navigate(`/news/${id}/edit`)
    }
  }

  const handleDelete = (event) => {
    event.stopPropagation()
    handleMenuClose()
    if (onDelete) {
      onDelete(news)
    }
  }

  const handleShare = (event) => {
    event.stopPropagation()
    handleMenuClose()
    if (onShare) {
      onShare(news)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'warning'
      case 'pending':
        return 'info'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const displayContent = excerpt || truncateText(content, 150)

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <Card
        sx={{
          cursor: 'pointer',
          transition: theme.transitions.create(['transform', 'box-shadow']),
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
        onClick={handleView}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                flex: 1,
                mr: 1
              }}
            >
              {title}
            </Typography>
            
            {showActions && (canEdit || canDelete) && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <MoreIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
            <Chip
              label={status}
              size="small"
              color={getStatusColor(status)}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, lineHeight: 1.4 }}
          >
            {truncateText(displayContent, 100)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              By {author} • {formatRelativeTime(created_at)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {views_count} views
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Featured variant for hero sections
  if (variant === 'featured') {
    return (
      <Card
        sx={{
          cursor: 'pointer',
          transition: theme.transitions.create(['transform', 'box-shadow']),
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={handleView}
      >
        {featured_image && (
          <CardMedia
            component="img"
            height="240"
            image={featured_image}
            alt={title}
            sx={{
              objectFit: 'cover',
            }}
          />
        )}
        
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={category}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  label={status}
                  size="small"
                  color={getStatusColor(status)}
                />
              </Box>
              
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                {title}
              </Typography>
            </Box>
            
            {showActions && (canEdit || canDelete) && (
              <IconButton
                onClick={handleMenuOpen}
                sx={{ ml: 2 }}
              >
                <MoreIcon />
              </IconButton>
            )}
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {truncateText(displayContent, 200)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AuthorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {author}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatRelativeTime(created_at)}
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              onClick={handleView}
              sx={{ borderRadius: 2 }}
            >
              Read More
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={handleView}
    >
      {featured_image && (
        <CardMedia
          component="img"
          height="200"
          image={featured_image}
          alt={title}
          sx={{
            objectFit: 'cover',
          }}
        />
      )}
      
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              flex: 1,
              mr: 1
            }}
          >
            {title}
          </Typography>
          
          {showActions && (canEdit || canDelete) && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            label={category}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip
            label={status}
            size="small"
            color={getStatusColor(status)}
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.5 }}
        >
          {displayContent}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              By {author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(created_at)} • {views_count} views
            </Typography>
          </Box>
          
          <Button
            size="small"
            startIcon={<ViewIcon />}
            onClick={handleView}
            sx={{ textTransform: 'none' }}
          >
            Read More
          </Button>
        </Box>
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  )
}

export default NewsCard