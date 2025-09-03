import React, { useState } from 'react'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as SignupIcon
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { VALIDATION_RULES, APP_CONFIG } from '../utils/constants'
import toast from 'react-hot-toast'

// Professional signup page with comprehensive form validation
const Signup = () => {
  const theme = useTheme()
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupError, setSignupError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
  })

  const watchPassword = watch('password')

  const onSubmit = async (data) => {
    try {
      setSignupError('')
      clearErrors()

      const result = await registerUser(data)
      
      if (result.success) {
        toast.success('Account created successfully! Welcome to INSBU!', {
          duration: 4000,
          position: 'top-center'
        })
        navigate('/dashboard', { replace: true })
      } else {
        setSignupError(result.error || 'Registration failed. Please try again.')
        
        // Handle specific validation errors
        if (result.status === 422 && result.errors) {
          Object.keys(result.errors).forEach(field => {
            setError(field, {
              type: 'server',
              message: result.errors[field][0]
            })
          })
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setSignupError('An unexpected error occurred. Please try again.')
      toast.error('Registration failed. Please try again.')
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: theme.shadows[4],
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              I
            </Typography>
          </Box>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            Create Account
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Join {APP_CONFIG.name} today
          </Typography>
        </Box>

        {/* Signup Form */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: theme.palette.background.paper,
          }}
        >
          {/* Error Alert */}
          {signupError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setSignupError('')}
            >
              {signupError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Name Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              type="text"
              autoComplete="name"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              {...register('name', {
                required: VALIDATION_RULES.name.required,
                minLength: VALIDATION_RULES.name.minLength
              })}
            />

            {/* Email Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              {...register('email', {
                required: VALIDATION_RULES.email.required,
                pattern: VALIDATION_RULES.email.pattern
              })}
            />

            {/* Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message || 'Minimum 8 characters'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              {...register('password', {
                required: VALIDATION_RULES.password.required,
                minLength: VALIDATION_RULES.password.minLength
              })}
            />

            {/* Confirm Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="password_confirmation"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              {...register('password_confirmation', {
                required: 'Please confirm your password',
                validate: value => value === watchPassword || 'Passwords do not match'
              })}
            />

            {/* Signup Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || loading}
              startIcon={
                isSubmitting || loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SignupIcon />
                )
              }
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            {/* Sign In Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in to your account
              </Link>
            </Box>

            {/* Terms and Privacy */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                By creating an account, you agree to our{' '}
                <Link href="#" color="primary" sx={{ textDecoration: 'none' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" color="primary" sx={{ textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {APP_CONFIG.description}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            © 2024 INSBU. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Signup