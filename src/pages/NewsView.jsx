import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Alert,
  useTheme
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import newsService from '../services/newsService'
import { LoadingOverlay } from '../components/LoadingScreen'
import { formatRelativeTime } from '../utils/helpers'
import toast from 'react-hot-toast'

// News viewing page for all users
const NewsView = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasRole, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNews()
  }, [id])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await newsService.getNewsById(id)
      if (response.success) {
        setNews(response.data)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setError('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/news/${id}/edit`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const canEdit = hasRole('admin') || (hasRole('editor') && news?.author_id === user?.id)

  if (loading) {
    return <LoadingOverlay loading={true} />
  }

  if (error || !news) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Article Not Found</Typography>
          <Typography>The article you're looking for doesn't exist or has been removed.</Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/news')}
          sx={{ mt: 2 }}
        >
          Back to News
        </Button>
      </Box>
    )
  }

  // Check if user can view this article
  const canView = news.status === 'published' || hasRole(['admin', 'editor'])

  if (!canView) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          <Typography variant="h6">Article Not Available</Typography>
          <Typography>This article is not yet published or you don't have permission to view it.</Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/news')}
          sx={{ mt: 2 }}
        >
          Back to News
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/news')}
          sx={{ textTransform: 'none', mb: 2 }}
        >
          Back to News
        </Button>

        {/* Article Meta */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip
            label={news.category}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={news.status}
            size="small"
            color={news.status === 'published' ? 'success' : 'warning'}
            sx={{ textTransform: 'capitalize' }}
          />
        </Stack>

        {/* Title */}
        <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          {news.title}
        </Typography>

        {/* Author and Date */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {news.author?.name || 'Unknown Author'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatRelativeTime(news.created_at)}
            </Typography>
          </Stack>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Share
          </Button>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Edit
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Featured Image */}
      {news.image_url && (
        <Box sx={{ mb: 4 }}>
          <img
            src={news.image_url}
            alt={news.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: theme.shape.borderRadius,
              maxHeight: '400px',
              objectFit: 'cover'
            }}
          />
        </Box>
      )}

      {/* Excerpt */}
      {news.excerpt && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {news.excerpt}
          </Typography>
        </Box>
      )}

      {/* Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: '1.1rem',
              '& p': { mb: 2 },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 3,
                mb: 2,
                fontWeight: 600
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2
              },
              '& blockquote': {
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
                color: 'text.secondary'
              }
            }}
          >
            {news.body.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Typography>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Published by {news.author?.name || 'Unknown Author'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated {formatRelativeTime(news.updated_at)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

export default NewsView
