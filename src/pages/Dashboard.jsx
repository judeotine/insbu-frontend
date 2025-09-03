import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  useTheme
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../hooks/useApi'
import statsService from '../services/statsService'
import StatCard from '../components/Dashboard/StatCard'
import ActivityChart from '../components/Dashboard/ActivityChart'
import RecentActivity from '../components/Dashboard/RecentActivity'
import { LoadingOverlay } from '../components/LoadingScreen'
import { formatNumber, formatRelativeTime } from '../utils/helpers'
import toast from 'react-hot-toast'

// Comprehensive dashboard with real-time statistics and activity monitoring
// Provides role-based data visualization and quick access to key metrics
const Dashboard = () => {
  const theme = useTheme()
  const { user, hasRole } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Fetch dashboard statistics
  const {
    data: dashboardStats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useApi(statsService.getDashboardStats, [], {
    immediate: true,
    cacheKey: 'dashboard-stats',
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  })

  // Sample dashboard data for development/demo
  const sampleStats = {
    totalUsers: 1247,
    totalDocuments: 856,
    totalNews: 124,
    totalViews: 15632,
    usersGrowth: 12.5,
    documentsGrowth: 8.3,
    newsGrowth: 15.7,
    viewsGrowth: 22.1,
    recentStats: {
      todayUsers: 89,
      todayDocuments: 12,
      todayNews: 3,
      todayViews: 234
    }
  }

  const stats = dashboardStats || sampleStats

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetchStats()
      setLastRefresh(new Date())
      toast.success('Dashboard updated successfully')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        refetchStats()
        setLastRefresh(new Date())
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [refetchStats])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome back, {user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your {hasRole('admin') ? 'system' : 'account'} today.
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 2 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        {/* Last updated info */}
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatRelativeTime(lastRefresh)}
        </Typography>
      </Box>

      {/* Error handling */}
      {statsError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard data. Please try refreshing.
        </Alert>
      )}

      <LoadingOverlay loading={statsLoading && !stats}>
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={formatNumber(stats.totalUsers)}
              growth={stats.usersGrowth}
              icon="users"
              color="primary"
              subtitle={`${stats.recentStats?.todayUsers || 0} today`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Documents"
              value={formatNumber(stats.totalDocuments)}
              growth={stats.documentsGrowth}
              icon="documents"
              color="secondary"
              subtitle={`${stats.recentStats?.todayDocuments || 0} uploaded today`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="News Articles"
              value={formatNumber(stats.totalNews)}
              growth={stats.newsGrowth}
              icon="news"
              color="success"
              subtitle={`${stats.recentStats?.todayNews || 0} published today`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Views"
              value={formatNumber(stats.totalViews)}
              growth={stats.viewsGrowth}
              icon="views"
              color="info"
              subtitle={`${stats.recentStats?.todayViews || 0} today`}
            />
          </Grid>

          {/* Activity Chart */}
          <Grid item xs={12} lg={8}>
            <ActivityChart
              title="Activity Trends (Last 14 Days)"
              type="area"
              loading={refreshing}
            />
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} lg={4}>
            <RecentActivity
              loading={refreshing}
              maxItems={6}
            />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2}>
                  {hasRole(['admin', 'editor']) && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            py: 2, 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                          onClick={() => window.location.href = '/news'}
                        >
                          Create News Article
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            py: 2, 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                          onClick={() => window.location.href = '/documents'}
                        >
                          Upload Document
                        </Button>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        py: 2, 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                      onClick={() => window.location.href = '/documents'}
                    >
                      Browse Documents
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        py: 2, 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                      onClick={() => window.location.href = '/news'}
                    >
                      Read Latest News
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AnalyticsIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    System Status
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">API Status</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: theme.palette.success.main
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'currentColor'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Operational
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Database</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: theme.palette.success.main
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'currentColor'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Connected
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">File Storage</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: theme.palette.success.main
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'currentColor'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Available
                      </Typography>
                    </Box>
                  </Box>
                  
                  {hasRole('admin') && (
                    <Button
                      size="small"
                      startIcon={<TrendingIcon />}
                      sx={{ 
                        mt: 1, 
                        textTransform: 'none',
                        alignSelf: 'flex-start'
                      }}
                      onClick={() => window.location.href = '/admin'}
                    >
                      View Admin Panel
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </LoadingOverlay>
    </Box>
  )
}

export default Dashboard