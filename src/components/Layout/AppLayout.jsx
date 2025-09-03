import React, { useState } from 'react'
import { 
  Box, 
  useTheme, 
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext'
import Sidebar from './Sidebar'
import { APP_CONFIG } from '../../utils/constants'

// Main application layout with responsive sidebar and top navigation
// Provides consistent layout structure for all authenticated pages
const AppLayout = () => {
  const theme = useTheme()
  const customTheme = useCustomTheme()
  const { user, logout } = useAuth()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState(null)

  const sidebarWidth = 280
  const collapsedSidebarWidth = 64

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null)
  }

  const handleLogout = async () => {
    handleProfileMenuClose()
    await logout()
  }

  const handleThemeToggle = () => {
    customTheme.toggleTheme()
    handleProfileMenuClose()
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left side - Menu and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ 
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {APP_CONFIG.name}
            </Typography>
          </Box>

          {/* Right side - Actions and Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ borderRadius: 2 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                p: 0.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Avatar
                sx={{ 
                  width: 36, 
                  height: 36,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: sidebarOpen ? sidebarWidth : collapsedSidebarWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? sidebarWidth : collapsedSidebarWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: isMobile ? 0 : (sidebarOpen ? 0 : `-${sidebarWidth - collapsedSidebarWidth}px`),
          width: isMobile ? '100%' : (sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : `calc(100% - ${collapsedSidebarWidth}px)`),
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />
        
        {/* Page content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User info */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: {user?.role || 'User'}
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Menu items */}
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {customTheme.mode === 'dark' ? 
              <LightModeIcon fontSize="small" /> : 
              <DarkModeIcon fontSize="small" />
            }
          </ListItemIcon>
          <ListItemText>
            {customTheme.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxWidth: 400,
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Divider />
        
        {/* Sample notifications */}
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2">
              New document uploaded
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2">
              News article published
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2">
              System maintenance scheduled
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yesterday
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AppLayout