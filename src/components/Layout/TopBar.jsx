import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

// Top navigation bar with user menu, theme toggle, and notifications
// Provides quick access to user settings and theme preferences
const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMenuClose();
  };

  // Handle profile navigation
  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  // Handle settings navigation
  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Theme Toggle Button */}
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          sx={{
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'rotate(180deg)',
            },
          }}
        >
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Tooltip>

      {/* Notifications Button */}
      <Tooltip title="Notifications">
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
      </Tooltip>

      {/* User Menu Button */}
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleMenuOpen}
          color="inherit"
          sx={{
            padding: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: 'secondary.main',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getUserInitials(user?.name)}
          </Avatar>
        </IconButton>
      </Tooltip>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, backgroundColor: 'background.default' }}>
          <Typography variant="subtitle2" fontWeight="600" noWrap>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email || 'user@example.com'}
          </Typography>
          <Typography variant="caption" color="primary.main" display="block">
            {user?.role?.toUpperCase() || 'USER'}
          </Typography>
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Profile"
            secondary="Manage your account"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            secondary="App preferences"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.main',
              color: 'error.contrastText',
              '& .MuiListItemIcon-root': {
                color: 'error.contrastText',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            secondary="Logout from account"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TopBar;
