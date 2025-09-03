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
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Pagination,
  useTheme,
  Fab
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { usePaginatedApi } from '../hooks/useApi'
import documentService from '../services/documentService'
import DocumentUpload from '../components/Documents/DocumentUpload'
import { LoadingOverlay, CardSkeleton } from '../components/LoadingScreen'
import { AccessGuard } from '../components/ProtectedRoute'
import { DOCUMENT_CATEGORIES } from '../utils/constants'
import { debounce, formatFileSize, formatRelativeTime, getFileIcon } from '../utils/helpers'
import toast from 'react-hot-toast'

// Comprehensive document management with upload, download, and organization
const Documents = () => {
  const theme = useTheme()
  const { hasRole } = useAuth()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, document: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)

  // Paginated documents data
  const {
    data: documentsData,
    items: documentsList,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    goToPage,
    setSearchTerm: setApiSearchTerm,
    updateFilters,
    updateSort,
    refetch
  } = usePaginatedApi(documentService.getDocuments, {
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
      type: typeFilter
    })
  }, [categoryFilter, typeFilter, updateFilters])

  useEffect(() => {
    updateSort(sortBy, sortOrder)
  }, [sortBy, sortOrder, updateSort])

  const handleUploadComplete = () => {
    setUploadDialogOpen(false)
    refetch()
    toast.success('Documents uploaded successfully!')
  }

  const handleDownload = async (document) => {
    try {
      await documentService.downloadDocument(document.id, document.original_name)
      toast.success('Download started')
    } catch (error) {
      toast.error('Failed to download document')
      console.error('Download error:', error)
    }
    handleMenuClose()
  }

  const handleEdit = (document) => {
    // Navigate to edit document page or open edit dialog
    console.log('Edit document:', document)
    handleMenuClose()
  }

  const handleDelete = (document) => {
    setDeleteDialog({ open: true, document })
    handleMenuClose()
  }

  const confirmDelete = async () => {
    if (!deleteDialog.document) return

    try {
      await documentService.deleteDocument(deleteDialog.document.id)
      toast.success('Document deleted successfully')
      refetch()
      setDeleteDialog({ open: false, document: null })
    } catch (error) {
      toast.error('Failed to delete document')
      console.error('Delete error:', error)
    }
  }

  const handleShare = (document) => {
    const url = `${window.location.origin}/documents/${document.id}`
    
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: document.description,
        url: url
      })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard')
      }).catch(() => {
        toast.error('Failed to copy link')
      })
    }
    handleMenuClose()
  }

  const handleMenuOpen = (event, document) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
    setSelectedDocument(document)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedDocument(null)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setTypeFilter('')
    setSortBy('created_at')
    setSortOrder('desc')
  }

  const activeFiltersCount = [searchTerm, categoryFilter, typeFilter].filter(Boolean).length

  const canUpload = hasRole(['admin', 'editor'])
  const canEdit = hasRole(['admin', 'editor'])
  const canDelete = hasRole(['admin', 'editor'])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Documents & Resources
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access and manage statistical documents and resources
            </Typography>
          </Box>
          
          <AccessGuard roles={['admin', 'editor']}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Upload Documents
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
                placeholder="Search documents..."
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
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Type Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>File Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="File Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="doc">Word Documents</MenuItem>
                  <MenuItem value="xls">Excel Files</MenuItem>
                  <MenuItem value="csv">CSV Files</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                </Select>
              </FormControl>
            </Grid>

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
                  <MenuItem value="created_at">Upload Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="file_size">File Size</MenuItem>
                  <MenuItem value="downloads">Downloads</MenuItem>
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

          {/* Active Filters */}
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
                {typeFilter && (
                  <Chip
                    label={`Type: ${typeFilter}`}
                    size="small"
                    onDelete={() => setTypeFilter('')}
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
            {loading ? 'Loading...' : `Showing ${documentsList.length} of ${totalItems} documents`}
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
          Failed to load documents. Please try again.
        </Alert>
      )}

      {/* Documents Grid */}
      <LoadingOverlay loading={loading && documentsList.length === 0}>
        {documentsList.length > 0 ? (
          <Grid container spacing={3}>
            {documentsList.map((document) => (
              <Grid item xs={12} sm={6} lg={4} key={document.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: theme.transitions.create(['transform', 'box-shadow']),
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => handleDownload(document)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocumentIcon 
                          sx={{ 
                            fontSize: 32, 
                            color: theme.palette.primary.main 
                          }} 
                        />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {getFileIcon(document.original_name)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {(canEdit || canDelete) && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, document)}
                        >
                          <MoreIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {document.title}
                    </Typography>

                    {document.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {document.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        label={document.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {document.file_size && (
                        <Chip
                          label={formatFileSize(document.file_size)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Uploaded {formatRelativeTime(document.created_at)}
                      {document.downloads_count > 0 && (
                        <> • {document.downloads_count} downloads</>
                      )}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(document)
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Download
                    </Button>
                    
                    <Button
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(document)
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Share
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : !loading ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No documents found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters or search terms.'
                : 'No documents have been uploaded yet.'
              }
            </Typography>
            {activeFiltersCount > 0 ? (
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <AccessGuard roles={['admin', 'editor']}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setUploadDialogOpen(true)}
                >
                  Upload First Document
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

      {/* Floating Upload Button (Mobile) */}
      <AccessGuard roles={['admin', 'editor']}>
        <Fab
          color="primary"
          aria-label="upload"
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <UploadIcon />
        </Fab>
      </AccessGuard>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            onClose={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDownload(selectedDocument)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleShare(selectedDocument)}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        
        {canEdit && (
          <MenuItem onClick={() => handleEdit(selectedDocument)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        
        {canDelete && (
          <MenuItem onClick={() => handleDelete(selectedDocument)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, document: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.document?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, document: null })}
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

export default Documents