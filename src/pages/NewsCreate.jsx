import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Stack,
  useTheme
} from '@mui/material'
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  ArrowBack as BackIcon,
  Preview as PreviewIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import newsService from '../services/newsService'
import { NEWS_CATEGORIES, NEWS_STATUS } from '../utils/constants'
import toast from 'react-hot-toast'

// News creation page for editors and admins
const NewsCreate = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    excerpt: '',
    category: '',
    status: hasRole('admin') ? NEWS_STATUS.PUBLISHED : NEWS_STATUS.DRAFT,
    image_url: ''
  })
  const [errors, setErrors] = useState({})

  // Only editors and admins can access this page
  if (!hasRole(['admin', 'editor'])) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You don't have permission to create news articles.</Typography>
        </Alert>
      </Box>
    )
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Content is required'
    } else if (formData.body.trim().length < 10) {
      newErrors.body = 'Content must be at least 10 characters'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (status = formData.status) => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    setLoading(true)
    try {
      const newsData = {
        title: formData.title.trim(),
        content: formData.body.trim(),
        excerpt: formData.excerpt.trim() || null,
        category: formData.category,
        status,
        featured_image: formData.image_url || null
      }

      const response = await newsService.createNews(newsData)
      
      if (response.success) {
        toast.success(
          status === NEWS_STATUS.PUBLISHED 
            ? 'Article published successfully!' 
            : 'Article saved as draft!'
        )
        navigate('/news')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save article')
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = () => {
    if (hasRole('admin')) {
      handleSave(NEWS_STATUS.PUBLISHED)
    } else {
      // Editors can only submit for review
      handleSave(NEWS_STATUS.PENDING)
    }
  }

  const getStatusLabel = () => {
    if (hasRole('admin')) {
      return formData.status === NEWS_STATUS.PUBLISHED ? 'Published' : 'Draft'
    } else {
      return formData.status === NEWS_STATUS.PENDING ? 'Pending Review' : 'Draft'
    }
  }

  const getStatusColor = () => {
    switch (formData.status) {
      case NEWS_STATUS.PUBLISHED:
        return 'success'
      case NEWS_STATUS.PENDING:
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/news')}
            sx={{ textTransform: 'none' }}
          >
            Back to News
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Create News Article
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {hasRole('admin') 
            ? 'Create and publish news articles directly' 
            : 'Create articles that will be reviewed by administrators before publishing'
          }
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {/* Title */}
              <TextField
                fullWidth
                label="Article Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Enter a compelling title for your article..."
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 200 }}
              />

              {/* Excerpt */}
              <TextField
                fullWidth
                label="Excerpt (Optional)"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                error={!!errors.excerpt}
                helperText={errors.excerpt || 'Brief summary of the article (will be auto-generated if left empty)'}
                placeholder="Write a brief summary..."
                multiline
                rows={3}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 500 }}
              />

              {/* Content */}
              <TextField
                fullWidth
                label="Article Content"
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                error={!!errors.body}
                helperText={errors.body}
                placeholder="Write your article content here..."
                multiline
                rows={15}
                sx={{ mb: 3 }}
              />

              {/* Image URL */}
              <TextField
                fullWidth
                label="Featured Image URL (Optional)"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                error={!!errors.image_url}
                helperText={errors.image_url || 'URL of the featured image for this article'}
                placeholder="https://example.com/image.jpg"
                sx={{ mb: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Publish Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Publish Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    error={!!errors.category}
                  >
                    {NEWS_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel()}
                    color={getStatusColor()}
                    size="small"
                  />
                </Box>

                {!hasRole('admin') && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    As an editor, your articles will be submitted for admin review before publishing.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSave(NEWS_STATUS.DRAFT)}
                    disabled={loading}
                    sx={{ textTransform: 'none' }}
                  >
                    Save as Draft
                  </Button>

                  {hasRole('admin') ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PublishIcon />}
                      onClick={handlePublish}
                      disabled={loading}
                      sx={{ textTransform: 'none' }}
                    >
                      Publish Now
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PublishIcon />}
                      onClick={handlePublish}
                      disabled={loading}
                      sx={{ textTransform: 'none' }}
                    >
                      Submit for Review
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewMode(!previewMode)}
                    sx={{ textTransform: 'none' }}
                  >
                    {previewMode ? 'Hide Preview' : 'Preview'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Preview */}
            {previewMode && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  <Box sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    p: 2,
                    bgcolor: 'background.paper'
                  }}>
                    <Typography variant="h5" gutterBottom>
                      {formData.title || 'Article Title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formData.excerpt || 'Article excerpt will appear here...'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {formData.body || 'Article content will appear here...'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default NewsCreate
