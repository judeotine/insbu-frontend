import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Tooltip,
  Divider,
  Chip,
  useTheme
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Article as NewsIcon,
  Description as DocumentsIcon,
  Folder as ResourcesIcon,
  AdminPanelSettings as AdminIcon,
  BarChart as StatsIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AccessGuard } from '../ProtectedRoute'

// Responsive sidebar navigation with role-based menu items
// Provides smooth navigation with visual feedback and accessibility
const Sidebar = ({ open, onToggle }) => {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()

  // Navigation menu items with role-based access
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'editor', 'user']
    },
    {
      id: 'news',
      label: 'News',
      icon: <NewsIcon />,
      path: '/news',
      roles: ['admin', 'editor', 'user'],
      badge: hasRole(['admin', 'editor']) ? 'Edit' : null
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <DocumentsIcon />,
      path: '/documents',
      roles: ['admin', 'editor', 'user'],
      badge: hasRole(['admin', 'editor']) ? 'Upload' : null
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: <ResourcesIcon />,
      path: '/resources',
      roles: ['admin', 'editor', 'user']
    }
  ]

  // Admin-only menu items
  const adminMenuItems = [
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <AdminIcon />,
      path: '/admin',
      roles: ['admin']
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <UsersIcon />,
      path: '/admin/users',
      roles: ['admin']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <StatsIcon />,
      path: '/admin/analytics',
      roles: ['admin']
    }
  ]

  // Settings and help items
  const bottomMenuItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['admin', 'editor', 'user']
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      roles: ['admin', 'editor', 'user']
    }
  ]

  const handleNavigation = (path) => {
    navigate(path)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < theme.breakpoints.values.lg) {
      onToggle()
    }
  }

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const renderMenuItem = (item) => {
    const isActive = isActiveRoute(item.path)
    
    const menuButton = (
      <ListItemButton
        onClick={() => handleNavigation(item.path)}
        sx={{
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
          backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
          color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
          '&:hover': {
            backgroundColor: isActive 
              ? theme.palette.primary.dark 
              : theme.palette.action.hover,
          },
          transition: theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.short,
          }),
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
            minWidth: open ? 40 : 'auto',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        
        {open && (
          <>
            <ListItemText
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                },
              }}
            />
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: isActive 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.primary.main,
                  color: isActive 
                    ? theme.palette.primary.main 
                    : theme.palette.primary.contrastText,
                }}
              />
            )}
          </>
        )}
      </ListItemButton>
    )

    // Wrap with tooltip when sidebar is collapsed
    if (!open) {
      return (
        <Tooltip
          key={item.id}
          title={item.label}
          placement="right"
          arrow
        >
          <ListItem disablePadding>
            {menuButton}
          </ListItem>
        </Tooltip>
      )
    }

    return (
      <ListItem key={item.id} disablePadding>
        {menuButton}
      </ListItem>
    )
  }

  const renderMenuSection = (items, showDivider = false) => {
    const accessibleItems = items.filter(item => 
      !item.roles || item.roles.some(role => hasRole(role))
    )

    if (accessibleItems.length === 0) return null

    return (
      <>
        {showDivider && <Divider sx={{ my: 1, mx: 2 }} />}
        <List disablePadding>
          {accessibleItems.map(renderMenuItem)}
        </List>
      </>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Toolbar spacer */}
      <Toolbar />

      {/* User info section */}
      {open && (
        <Box sx={{ px: 2, py: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.action.hover,
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle2" noWrap>
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.name || 'User'}
            </Typography>
            <Chip
              label={user?.role || 'User'}
              size="small"
              color="primary"
              sx={{ mt: 1, fontSize: '0.75rem' }}
            />
          </Box>
        </Box>
      )}

      {/* Main navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        {/* Main menu items */}
        {renderMenuSection(menuItems)}

        {/* Admin menu items */}
        <AccessGuard roles={['admin']}>
          {renderMenuSection(adminMenuItems, true)}
        </AccessGuard>
      </Box>

      {/* Bottom menu items */}
      <Box sx={{ px: 1, pb: 2 }}>
        {renderMenuSection(bottomMenuItems, true)}
      </Box>

      {/* Version info (when expanded) */}
      {open && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center' }}
          >
            Version 1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default Sidebar