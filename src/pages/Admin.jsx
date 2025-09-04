import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab,
  useTheme
} from '@mui/material'
import {
  People as UsersIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as AddUserIcon,
  AdminPanelSettings as AdminIcon,
  Lock as SuspendIcon,
  CheckCircle as ActivateIcon,
  Article as ArticleIcon,
  Publish as PublishIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useApi, usePaginatedApi } from '../hooks/useApi'
import adminService from '../services/adminService'
import statsService from '../services/statsService'
import StatCard from '../components/Dashboard/StatCard'
import { LoadingOverlay } from '../components/LoadingScreen'
import { USER_ROLES } from '../utils/constants'
import { formatRelativeTime } from '../utils/helpers'
import toast from 'react-hot-toast'

// Comprehensive admin panel with user management and system controls
const Admin = () => {
  const theme = useTheme()
  const { hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'create' })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null })
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [articleMenuAnchor, setArticleMenuAnchor] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)

  // Only admins can access this page
  if (!hasRole('admin')) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You don't have permission to access the admin panel.</Typography>
        </Alert>
      </Box>
    )
  }

  // Fetch admin statistics
  const {
    data: adminStats,
    loading: statsLoading,
    refetch: refetchStats
  } = useApi(adminService.getSystemStatistics, [], {
    immediate: true,
    cacheKey: 'admin-stats'
  })

  // Fetch users with pagination
  const {
    data: usersData,
    items: usersList,
    loading: usersLoading,
    page,
    totalPages,
    totalItems,
    goToPage,
    refetch: refetchUsers
  } = usePaginatedApi(adminService.getUsers, {
    initialPage: 1,
    pageSize: 10
  })

  // Fetch articles with pagination
  const {
    data: articlesData,
    items: articlesList,
    loading: articlesLoading,
    page: articlesPage,
    totalPages: articlesTotalPages,
    totalItems: articlesTotalItems,
    goToPage: goToArticlesPage,
    refetch: refetchArticles
  } = usePaginatedApi(adminService.getArticles, {
    initialPage: 1,
    pageSize: 10
  })

  // Sample admin stats for development
  const sampleStats = {
    totalUsers: 156,
    activeUsers: 142,
    newUsersThisMonth: 23,
    totalSessions: 1247,
    systemHealth: 'good',
    storageUsed: '2.3 GB',
    storageTotal: '10 GB'
  }

  const stats = adminStats || sampleStats

  const handleUserAction = (action, user) => {
    setSelectedUser(user)
    setMenuAnchor(null)

    switch (action) {
      case 'edit':
        setUserDialog({ open: true, user, mode: 'edit' })
        break
      case 'delete':
        setDeleteDialog({ open: true, user })
        break
      case 'suspend':
        handleSuspendUser(user)
        break
      case 'activate':
        handleActivateUser(user)
        break
      default:
        break
    }
  }

  const handleSuspendUser = async (user) => {
    try {
      await adminService.suspendUser(user.id, 'Suspended by admin')
      toast.success(`User ${user.name} has been suspended`)
      refetchUsers()
    } catch (error) {
      toast.error('Failed to suspend user')
      console.error('Suspend error:', error)
    }
  }

  const handleActivateUser = async (user) => {
    try {
      await adminService.activateUser(user.id)
      toast.success(`User ${user.name} has been activated`)
      refetchUsers()
    } catch (error) {
      toast.error('Failed to activate user')
      console.error('Activate error:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return

    try {
      await adminService.deleteUser(deleteDialog.user.id)
      toast.success('User deleted successfully')
      refetchUsers()
      setDeleteDialog({ open: false, user: null })
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Delete error:', error)
    }
  }

  const handleCreateUser = () => {
    setUserDialog({ open: true, user: null, mode: 'create' })
  }

  const handleSaveUser = async (userData) => {
    try {
      if (userDialog.mode === 'create') {
        await adminService.createUser(userData)
        toast.success('User created successfully')
      } else {
        await adminService.updateUser(userDialog.user.id, userData)
        toast.success('User updated successfully')
      }
      refetchUsers()
      setUserDialog({ open: false, user: null, mode: 'create' })
    } catch (error) {
      toast.error(`Failed to ${userDialog.mode} user`)
      console.error('Save user error:', error)
    }
  }

  const handleArticleAction = (action, article) => {
    setSelectedArticle(article)
    setArticleMenuAnchor(null)

    switch (action) {
      case 'approve':
        handleApproveArticle(article)
        break
      case 'reject':
        handleRejectArticle(article)
        break
      case 'view':
        window.open(`/news/${article.id}`, '_blank')
        break
      default:
        break
    }
  }

  const handleApproveArticle = async (article) => {
    try {
      await adminService.approveArticle(article.id)
      toast.success(`Article "${article.title}" has been approved and published`)
      refetchArticles()
    } catch (error) {
      toast.error('Failed to approve article')
      console.error('Approve error:', error)
    }
  }

  const handleRejectArticle = async (article) => {
    try {
      await adminService.rejectArticle(article.id)
      toast.success(`Article "${article.title}" has been rejected`)
      refetchArticles()
    } catch (error) {
      toast.error('Failed to reject article')
      console.error('Reject error:', error)
    }
  }

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'suspended':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'editor':
        return 'warning'
      case 'user':
        return 'primary'
      default:
        return 'default'
    }
  }

  const tabPanels = [
    {
      label: 'Overview',
      icon: <AnalyticsIcon />
    },
    {
      label: 'Users',
      icon: <UsersIcon />
    },
    {
      label: 'Articles',
      icon: <ArticleIcon />
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />
    },
    {
      label: 'Security',
      icon: <SecurityIcon />
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, system settings, and monitor application health
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          {tabPanels.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="users"
                color="primary"
                subtitle={`${stats.activeUsers} active`}
                loading={statsLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="New Users"
                value={stats.newUsersThisMonth}
                icon="users"
                color="success"
                subtitle="This month"
                loading={statsLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Sessions"
                value={stats.totalSessions}
                icon="views"
                color="info"
                subtitle="All time"
                loading={statsLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Storage Used"
                value={`${stats.storageUsed}/${stats.storageTotal}`}
                icon="stats"
                color="warning"
                subtitle="Storage usage"
                loading={statsLoading}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Health
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={stats.systemHealth}
                      color={stats.systemHealth === 'good' ? 'success' : 'warning'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      All systems operational
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddUserIcon />}
                      onClick={handleCreateUser}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Create New User
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      System Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Articles Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Article Management ({articlesTotalItems} articles)
            </Typography>
          </Box>

          <LoadingOverlay loading={articlesLoading}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {articlesList.map((article) => (
                    <TableRow key={article.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArticleIcon 
                            sx={{ 
                              fontSize: 20,
                              color: theme.palette.text.secondary
                            }} 
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {article.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {article.excerpt?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminIcon 
                            sx={{ 
                              fontSize: 16,
                              color: theme.palette.text.secondary
                            }} 
                          />
                          {article.author?.name || 'Unknown'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={article.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={article.status}
                          size="small"
                          color={getUserStatusColor(article.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(article.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            setArticleMenuAnchor(e.currentTarget)
                            setSelectedArticle(article)
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {articlesTotalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  disabled={articlesPage === 1}
                  onClick={() => goToArticlesPage(articlesPage - 1)}
                  sx={{ mr: 1 }}
                >
                  Previous
                </Button>
                <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                  Page {articlesPage} of {articlesTotalPages}
                </Typography>
                <Button
                  disabled={articlesPage === articlesTotalPages}
                  onClick={() => goToArticlesPage(articlesPage + 1)}
                  sx={{ ml: 1 }}
                >
                  Next
                </Button>
              </Box>
            )}
          </LoadingOverlay>
        </Box>
      )}

      {/* Users Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              User Management ({totalItems} users)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddUserIcon />}
              onClick={handleCreateUser}
            >
              Add User
            </Button>
          </Box>

          <LoadingOverlay loading={usersLoading}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersList.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminIcon 
                            sx={{ 
                              fontSize: 20,
                              color: user.role === 'admin' ? theme.palette.error.main : theme.palette.text.secondary
                            }} 
                          />
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status || 'active'}
                          size="small"
                          color={getUserStatusColor(user.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(user.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            setMenuAnchor(e.currentTarget)
                            setSelectedUser(user)
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}
                  sx={{ mr: 1 }}
                >
                  Previous
                </Button>
                <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  disabled={page === totalPages}
                  onClick={() => goToPage(page + 1)}
                  sx={{ ml: 1 }}
                >
                  Next
                </Button>
              </Box>
            )}
          </LoadingOverlay>
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Alert severity="info">
            System settings functionality will be implemented here.
          </Alert>
        </Box>
      )}

      {/* Security Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Security & Access Control
          </Typography>
          <Alert severity="info">
            Security settings and access logs will be displayed here.
          </Alert>
        </Box>
      )}

      {/* User Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleUserAction('edit', selectedUser)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>

        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={() => handleUserAction('suspend', selectedUser)}>
            <ListItemIcon>
              <SuspendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Suspend User</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleUserAction('activate', selectedUser)}>
            <ListItemIcon>
              <ActivateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate User</ListItemText>
          </MenuItem>
        )}

        <MenuItem 
          onClick={() => handleUserAction('delete', selectedUser)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Article Actions Menu */}
      <Menu
        anchorEl={articleMenuAnchor}
        open={Boolean(articleMenuAnchor)}
        onClose={() => setArticleMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleArticleAction('view', selectedArticle)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Article</ListItemText>
        </MenuItem>

        {selectedArticle?.status === 'pending' && (
          <MenuItem onClick={() => handleArticleAction('approve', selectedArticle)}>
            <ListItemIcon>
              <PublishIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Approve & Publish</ListItemText>
          </MenuItem>
        )}

        {selectedArticle?.status === 'pending' && (
          <MenuItem 
            onClick={() => handleArticleAction('reject', selectedArticle)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Reject Article</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* User Dialog */}
      <UserDialog
        open={userDialog.open}
        user={userDialog.user}
        mode={userDialog.mode}
        onClose={() => setUserDialog({ open: false, user: null, mode: 'create' })}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.user?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// User creation/editing dialog component
const UserDialog = ({ open, user, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    status: 'active'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        password: '',
        status: user.status || 'active'
      })
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        password: '',
        status: 'active'
      })
    }
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create New User' : 'Edit User'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {Object.values(USER_ROLES).map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {mode === 'create' && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Admin