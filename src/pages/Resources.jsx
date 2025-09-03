import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Container,
  useTheme
} from '@mui/material'
import {
  Search as SearchIcon,
  Launch as LaunchIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Description as DocumentIcon,
  Public as WebsiteIcon,
  VideoLibrary as VideoIcon,
  School as EducationIcon
} from '@mui/icons-material'
import { LoadingOverlay, CardSkeleton } from '../components/LoadingScreen'
import { debounce } from '../utils/helpers'

// Comprehensive resources page for external links and educational materials
const Resources = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [filteredResources, setFilteredResources] = useState([])

  // Sample resources data
  const resourcesData = [
    {
      id: 1,
      title: 'Burundi National Statistical System',
      description: 'Official portal of the National Institute of Statistics of Burundi with comprehensive statistical data and reports.',
      url: 'https://www.isteebu.bi/',
      category: 'Official Statistics',
      type: 'website',
      featured: true
    },
    {
      id: 2,
      title: 'World Bank Open Data - Burundi',
      description: 'Free and open access to global development data for Burundi, including economic indicators and development statistics.',
      url: 'https://data.worldbank.org/country/burundi',
      category: 'International Data',
      type: 'website'
    },
    {
      id: 3,
      title: 'UN Statistics Division',
      description: 'United Nations Statistics Division provides global statistical standards and methodologies.',
      url: 'https://unstats.un.org/',
      category: 'International Standards',
      type: 'website'
    },
    {
      id: 4,
      title: 'Statistical Methodology Guide',
      description: 'Comprehensive guide to statistical methodologies used in data collection and analysis.',
      url: '/documents/methodology-guide.pdf',
      category: 'Methodology',
      type: 'document'
    },
    {
      id: 5,
      title: 'IMF Country Data - Burundi',
      description: 'International Monetary Fund data and statistics for Burundi economic indicators.',
      url: 'https://www.imf.org/en/Countries/BDI',
      category: 'Economic Data',
      type: 'website'
    },
    {
      id: 6,
      title: 'OECD Statistics',
      description: 'Organisation for Economic Co-operation and Development statistical data and analysis.',
      url: 'https://www.oecd.org/statistics/',
      category: 'International Data',
      type: 'website'
    },
    {
      id: 7,
      title: 'Data Visualization Best Practices',
      description: 'Video tutorial series on creating effective statistical visualizations and charts.',
      url: 'https://www.youtube.com/watch?v=example',
      category: 'Training',
      type: 'video'
    },
    {
      id: 8,
      title: 'Statistical Software Training',
      description: 'Online courses and tutorials for statistical analysis software including R, SPSS, and Stata.',
      url: '/training/statistical-software',
      category: 'Training',
      type: 'education'
    },
    {
      id: 9,
      title: 'African Development Bank Statistics',
      description: 'Statistical data and development indicators for African countries including Burundi.',
      url: 'https://www.afdb.org/en/knowledge/statistics',
      category: 'Regional Data',
      type: 'website'
    },
    {
      id: 10,
      title: 'Census Methodology Handbook',
      description: 'Detailed handbook on conducting population and housing censuses with best practices.',
      url: '/documents/census-handbook.pdf',
      category: 'Methodology',
      type: 'document'
    }
  ]

  const categories = [
    'Official Statistics',
    'International Data',
    'Economic Data',
    'Regional Data',
    'Methodology',
    'Training',
    'International Standards'
  ]

  // Debounced search
  const debouncedSearch = debounce((term) => {
    filterResources(term, categoryFilter)
  }, 300)

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  useEffect(() => {
    filterResources(searchTerm, categoryFilter)
  }, [categoryFilter])

  const filterResources = (search, category) => {
    let filtered = resourcesData

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.category.toLowerCase().includes(searchLower)
      )
    }

    if (category) {
      filtered = filtered.filter(resource => resource.category === category)
    }

    setFilteredResources(filtered)
  }

  useEffect(() => {
    filterResources('', '')
  }, [])

  const getResourceIcon = (type) => {
    switch (type) {
      case 'website':
        return <WebsiteIcon />
      case 'document':
        return <DocumentIcon />
      case 'video':
        return <VideoIcon />
      case 'education':
        return <EducationIcon />
      default:
        return <LinkIcon />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'website':
        return 'primary'
      case 'document':
        return 'secondary'
      case 'video':
        return 'warning'
      case 'education':
        return 'success'
      default:
        return 'default'
    }
  }

  const handleResourceClick = (resource) => {
    if (resource.url.startsWith('http')) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    } else {
      // Handle internal links or downloads
      window.location.href = resource.url
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
  }

  const activeFiltersCount = [searchTerm, categoryFilter].filter(Boolean).length

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Resources & External Links
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access valuable statistical resources, methodologies, and external data sources
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search resources..."
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

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredResources.length} resources found
              </Typography>
              <Button
                size="small"
                onClick={clearFilters}
                sx={{ textTransform: 'none' }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Card>

        {/* Featured Resources */}
        {filteredResources.some(r => r.featured) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Featured Resources
            </Typography>
            <Grid container spacing={3}>
              {filteredResources
                .filter(resource => resource.featured)
                .map((resource) => (
                  <Grid item xs={12} md={6} key={resource.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: theme.transitions.create(['transform', 'box-shadow']),
                        border: `2px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                      onClick={() => handleResourceClick(resource)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              backgroundColor: theme.palette.primary.main + '20',
                              color: theme.palette.primary.main
                            }}
                          >
                            {getResourceIcon(resource.type)}
                          </Box>
                          <Chip
                            label="Featured"
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>

                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {resource.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {resource.description}
                        </Typography>

                        <Chip
                          label={resource.category}
                          size="small"
                          variant="outlined"
                        />
                      </CardContent>

                      <CardActions>
                        <Button
                          size="small"
                          startIcon={resource.url.startsWith('http') ? <LaunchIcon /> : <DownloadIcon />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResourceClick(resource)
                          }}
                        >
                          {resource.url.startsWith('http') ? 'Visit Site' : 'Access Resource'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* All Resources */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          All Resources
        </Typography>

        <LoadingOverlay loading={loading}>
          {filteredResources.length > 0 ? (
            <Grid container spacing={3}>
              {filteredResources
                .filter(resource => !resource.featured)
                .map((resource) => (
                  <Grid item xs={12} sm={6} lg={4} key={resource.id}>
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
                      onClick={() => handleResourceClick(resource)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Box
                            sx={{
                              color: theme.palette.text.secondary
                            }}
                          >
                            {getResourceIcon(resource.type)}
                          </Box>
                          <Chip
                            label={resource.type}
                            size="small"
                            color={getTypeColor(resource.type)}
                            variant="outlined"
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {resource.title}
                        </Typography>

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
                          {resource.description}
                        </Typography>

                        <Chip
                          label={resource.category}
                          size="small"
                          variant="outlined"
                        />
                      </CardContent>

                      <CardActions>
                        <Button
                          size="small"
                          startIcon={resource.url.startsWith('http') ? <LaunchIcon /> : <DownloadIcon />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResourceClick(resource)
                          }}
                          sx={{ textTransform: 'none' }}
                        >
                          {resource.url.startsWith('http') ? 'Visit' : 'Access'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Card sx={{ p: 6, textAlign: 'center' }}>
              <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No resources found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {activeFiltersCount > 0 
                  ? 'Try adjusting your search terms or filters.'
                  : 'No resources are currently available.'
                }
              </Typography>
              {activeFiltersCount > 0 && (
                <Button variant="outlined" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
        </LoadingOverlay>

        {/* Help Section */}
        <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Need help finding specific resources?</strong>
            <br />
            Contact our support team or check the documentation section for more detailed guides and tutorials.
          </Typography>
        </Alert>
      </Box>
    </Container>
  )
}

export default Resources