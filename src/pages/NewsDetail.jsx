import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  Divider,
  useTheme
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  Person as AuthorIcon,
  Visibility as ViewIcon,
  Print as PrintIcon
} from '@mui/icons-material'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../hooks/useApi'
import newsService from '../services/newsService'
import { AccessGuard } from '../components/ProtectedRoute'
import { formatDate, formatRelativeTime } from '../utils/helpers'
import toast from 'react-hot-toast'

// Detailed news article view with full content and actions
const NewsDetail = () => {
  const theme = useTheme()
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [menuAnchor, setMenuAnchor] = useState(null)

  // Fetch news article
  const {
    data: news,
    loading,
    error,
    refetch
  } = useApi(
    () => newsService.getNewsById(id),
    [id],
    {
      immediate: true,
      cacheKey: `news-${id}`,
      cacheDuration: 10 * 60 * 1000 // 10 minutes
    }
  )

  const canEdit = hasRole(['admin', 'editor'])
  const canDelete = hasRole(['admin', 'editor'])

  const handleBack = () => {
    navigate('/news')
  }

  const handleEdit = () => {
    navigate(`/news/${id}/edit`)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      await newsService.deleteNews(id)
      toast.success('Article deleted successfully')
      navigate('/news')
    } catch (error) {
      toast.error('Failed to delete article')
      console.error('Delete error:', error)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    
    if (navigator.share) {
      navigator.share({
        title: news?.title,
        text: news?.excerpt || news?.content?.substring(0, 100),
        url: url
      })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard')
      }).catch(() => {
        toast.error('Failed to copy link')
      })
    }
    setMenuAnchor(null)
  }

  const handlePrint = () => {
    window.print()
    setMenuAnchor(null)
  }

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  // Error handling
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Failed to load the article. Please try again.
        </Alert>
      </Container>
    )
  }

  // Loading state
  if (loading || !news) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="200px" height={24} />
        </Box>
        
        <Card sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={300} />
          <Box sx={{ p: 4 }}>
            <Skeleton variant="text" width="100%" height={48} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Card>
      </Container>
    )
  }

  const {
    title,
    content,
    excerpt,
    author,
    category,
    status,
    featured_image,
    created_at,
    updated_at,
    views_count = 0
  } = news

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/news"
          color="inherit"
          sx={{ textDecoration: 'none' }}
        >
          News
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ textTransform: 'none' }}
        >
          Back to News
        </Button>
      </Box>

      {/* Main Article */}
      <Card sx={{ mb: 4 }}>
        {/* Featured Image */}
        {featured_image && (
          <CardMedia
            component="img"
            height="400"
            image={featured_image}
            alt={title}
            sx={{ objectFit: 'cover' }}
          />
        )}

        {/* Article Content */}
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            {/* Categories and Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Chip
                label={category}
                color="primary"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                label={status}
                size="small"
                color={status === 'published' ? 'success' : 'warning'}
              />
            </Box>

            {/* Title and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  flex: 1,
                  mr: 2
                }}
              >
                {title}
              </Typography>

              {/* Actions Menu */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
                
                {(canEdit || canDelete) && (
                  <IconButton onClick={handleMenuOpen}>
                    <MoreIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Article Meta */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              flexWrap: 'wrap',
              color: 'text.secondary'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AuthorIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  By <strong>{author}</strong>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {formatDate(created_at, 'PPP')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ViewIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {views_count} views
                </Typography>
              </Box>

              {updated_at !== created_at && (
                <Typography variant="body2">
                  Updated {formatRelativeTime(updated_at)}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Excerpt */}
          {excerpt && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                lineHeight: 1.6,
                color: theme.palette.text.secondary,
                fontStyle: 'italic',
                mb: 4,
                p: 3,
                backgroundColor: theme.palette.action.hover,
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}
            >
              {excerpt}
            </Typography>
          )}

          {/* Main Content */}
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: '1.125rem',
              '& p': {
                mb: 2
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 600,
                mt: 3,
                mb: 2
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2
              },
              '& li': {
                mb: 1
              },
              '& blockquote': {
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
                color: theme.palette.text.secondary
              }
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Box>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Article</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>
        
        <AccessGuard roles={['admin', 'editor']}>
          <>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Article</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Article</ListItemText>
            </MenuItem>
          </>
        </AccessGuard>
      </Menu>

      {/* Print Styles */}
      <style jsx="true" global="true">{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
          
          .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          .MuiChip-root {
            background: #f5f5f5 !important;
            color: #333 !important;
          }
        }
      `}</style>
    </Container>
  )
}

export default NewsDetail