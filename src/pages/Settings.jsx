import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material'
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const { isDarkMode, toggleTheme } = useCustomTheme()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Profile Settings
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    phone: '',
    location: ''
  })

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newsUpdates: true,
    documentAlerts: true,
    systemAlerts: true
  })

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityVisible: false,
    emailVisible: false
  })

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileSave = async () => {
    try {
      setLoading(true)
      setError('')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    try {
      setLoading(true)
      setError('')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOpenPasswordDialog(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<PersonIcon color="primary" />}
              title="Profile Settings"
              subheader="Manage your personal information"
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {user?.email}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PhotoCameraIcon />}
                    variant="outlined"
                  >
                    Change Photo
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                margin="normal"
                placeholder="Tell us about yourself..."
              />

              <TextField
                fullWidth
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Location"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                margin="normal"
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleProfileSave}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<SecurityIcon color="error" />}
              title="Security Settings"
              subheader="Manage your account security"
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Chip label={user?.role} color="primary" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Role"
                    secondary={`You are logged in as ${user?.role}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Password"
                    secondary="Last changed 30 days ago"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenPasswordDialog(true)}
                    >
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" size="small" disabled>
                      Setup
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Login Sessions"
                    secondary="Manage active sessions"
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" size="small">
                      View
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<NotificationsIcon color="info" />}
              title="Notification Settings"
              subheader="Choose what notifications you receive"
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        emailNotifications: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="News Updates"
                    secondary="Get notified about new news articles"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.newsUpdates}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        newsUpdates: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Document Alerts"
                    secondary="Get notified about new documents"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.documentAlerts}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        documentAlerts: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="System Alerts"
                    secondary="Important system notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.systemAlerts}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        systemAlerts: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<PaletteIcon color="secondary" />}
              title="Appearance Settings"
              subheader="Customize your experience"
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Toggle between light and dark themes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={isDarkMode}
                      onChange={toggleTheme}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Language"
                    secondary="Choose your preferred language"
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" size="small">
                      English
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Compact Mode"
                    secondary="Use compact spacing"
                  />
                  <ListItemSecondaryAction>
                    <Switch disabled />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type={showCurrentPassword ? 'text' : 'password'}
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />

          <TextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained" disabled={loading}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Settings