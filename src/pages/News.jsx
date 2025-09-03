import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Card,
  CardContent,
  useTheme
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Article as NewsIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { usePaginatedApi } from '../hooks/useApi'
import newsService from '../services/newsService'
import NewsCard from '../components/News/NewsCard'
import { LoadingOverlay, CardSkeleton } from '../components/LoadingScreen'
import { AccessGuard } from '../components/ProtectedRoute'
import { NEWS_CATEGORIES, NEWS_STATUS } from '../utils/constants'
import { debounce } from '../utils/helpers'
import toast from 'react-hot-toast'

// Comprehensive news management page with filtering and CRUD operations
const News = () => {
  const theme = useTheme()
  const { hasRole } = useAuth()
  const [deleteDialog, setDeleteDialog] = useState({ open: false, news: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Paginated news data
  const {
    data: newsData,
    items: newsList,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    goToPage,
    setSearchTerm: setApiSearchTerm,
    updateFilters,
    updateSort,
    refetch
  } = usePaginatedApi(newsService.getNewsList, {
    initialPage: 1,
    pageSize: 12
  })

  // Debounced search
  const debouncedSearch = debounce((term) => {
    setApiSearchTerm(term)
  }, 300)

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  useEffect(() => {
    updateFilters({
      category: categoryFilter,
      status: statusFilter
    })
  }, [categoryFilter, statusFilter, updateFilters])

  useEffect(() => {
    updateSort(sortBy, sortOrder)
  }, [sortBy, sortOrder, updateSort])

  const handleCreateNews = () => {
    // Navigate to create news page or open create dialog
    window.location.href = '/news/create'
  }

  const handleEditNews = (news) => {
    // Navigate to edit news page
    window.location.href = `/news/${news.id}/edit`
  }

  const handleDeleteNews = (news) => {
    setDeleteDialog({ open: true, news })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.news) return

    try {
      await newsService.deleteNews(deleteDialog.news.id)
      toast.success('News article deleted successfully')
      refetch() // Refresh the list
      setDeleteDialog({ open: false, news: null })
    } catch (error) {
      toast.error('Failed to delete news article')
      console.error('Delete error:', error)
    }
  }

  const handleShareNews = (news) => {
    const url = `${window.location.origin}/news/${news.id}`
    
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.excerpt || news.content.substring(0, 100),
        url: url
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard')
      }).catch(() => {
        toast.error('Failed to copy link')
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setStatusFilter('')
    setSortBy('created_at')
    setSortOrder('desc')
  }

  const activeFiltersCount = [searchTerm, categoryFilter, statusFilter].filter(Boolean).length

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              News & Articles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with the latest news and statistical insights
            </Typography>
          </Box>
          
          <AccessGuard roles={['admin', 'editor']}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNews}
              sx={{ borderRadius: 2 }}
            >
              Create Article
            </Button>
          </AccessGuard>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {NEWS_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter (for editors/admins) */}
            <AccessGuard roles={['admin', 'editor']}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    {Object.entries(NEWS_STATUS).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </AccessGuard>

            {/* Sort */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="created_at">Date Created</MenuItem>
                  <MenuItem value="updated_at">Last Updated</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="views_count">Views</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => setSortOrder(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active Filters & Actions */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Active filters:
                </Typography>
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    size="small"
                    onDelete={() => setSearchTerm('')}
                  />
                )}
                {categoryFilter && (
                  <Chip
                    label={`Category: ${categoryFilter}`}
                    size="small"
                    onDelete={() => setCategoryFilter('')}
                  />
                )}
                {statusFilter && (
                  <Chip
                    label={`Status: ${statusFilter}`}
                    size="small"
                    onDelete={() => setStatusFilter('')}
                  />
                )}
              </Stack>
              
              <Button
                size="small"
                onClick={clearFilters}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Card>

        {/* Results Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading...' : `Showing ${newsList.length} of ${totalItems} articles`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Page {page} of {totalPages}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error handling */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Failed to load news articles. Please try again.
        </Alert>
      )}

      {/* News Grid */}
      <LoadingOverlay loading={loading && newsList.length === 0}>
        {newsList.length > 0 ? (
          <Grid container spacing={3}>
            {newsList.map((news) => (
              <Grid item xs={12} sm={6} lg={4} key={news.id}>
                <NewsCard
                  news={news}
                  onEdit={handleEditNews}
                  onDelete={handleDeleteNews}
                  onShare={handleShareNews}
                  showActions={hasRole(['admin', 'editor'])}
                />
              </Grid>
            ))}
          </Grid>
        ) : !loading ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <NewsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No articles found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters or search terms.'
                : 'No news articles have been published yet.'
              }
            </Typography>
            {activeFiltersCount > 0 ? (
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <AccessGuard roles={['admin', 'editor']}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNews}>
                  Create First Article
                </Button>
              </AccessGuard>
            )}
          </Card>
        ) : (
          <CardSkeleton count={6} />
        )}
      </LoadingOverlay>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => goToPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, news: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete News Article</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.news?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, news: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default News