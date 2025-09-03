import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, Alert, AlertTitle, Button } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from './LoadingScreen'

// Enhanced protected route component with role-based access control
// Provides comprehensive authentication and authorization checking
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackUrl = '/login',
  showAccessDenied = true 
}) => {
  const { 
    isAuthenticated, 
    loading, 
    user, 
    hasRole, 
    hasPermission,
    logout 
  } = useAuth()
  const location = useLocation()

  // Show loading screen while authentication is being checked
  if (loading) {
    return <LoadingScreen message="Verifying authentication..." />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackUrl} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role))
    
    if (!hasRequiredRole) {
      if (showAccessDenied) {
        return <AccessDeniedScreen userRole={user?.role} requiredRoles={requiredRoles} />
      }
      return <Navigate to="/dashboard" replace />
    }
  }

  // Check permission-based access if required permissions are specified
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission))
    
    if (!hasRequiredPermission) {
      if (showAccessDenied) {
        return <AccessDeniedScreen userRole={user?.role} requiredPermissions={requiredPermissions} />
      }
      return <Navigate to="/dashboard" replace />
    }
  }

  // User is authenticated and authorized - render the protected content
  return children
}

// Access denied screen component
const AccessDeniedScreen = ({ userRole, requiredRoles = [], requiredPermissions = [] }) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        textAlign: 'center'
      }}
    >
      <Alert 
        severity="error" 
        sx={{ 
          maxWidth: 600, 
          mb: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Access Denied
        </AlertTitle>
        
        <Box sx={{ mt: 2, textAlign: 'left' }}>
          <p>You don't have permission to access this page.</p>
          
          {userRole && (
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Your role:</strong> {userRole}
            </p>
          )}
          
          {requiredRoles.length > 0 && (
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Required roles:</strong> {requiredRoles.join(', ')}
            </p>
          )}
          
          {requiredPermissions.length > 0 && (
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Required permissions:</strong> {requiredPermissions.join(', ')}
            </p>
          )}
        </Box>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          onClick={handleGoBack}
          sx={{ minWidth: 120 }}
        >
          Go Back
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/dashboard'}
          sx={{ minWidth: 120 }}
        >
          Dashboard
        </Button>
        
        <Button 
          variant="text" 
          color="error"
          onClick={handleLogout}
          sx={{ minWidth: 120 }}
        >
          Logout
        </Button>
      </Box>

      {/* Help text */}
      <Box sx={{ mt: 4, opacity: 0.7 }}>
        <p style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          If you believe this is an error, please contact your administrator.
        </p>
      </Box>
    </Box>
  )
}

// HOC for protecting components with roles
export const withRoleProtection = (WrappedComponent, requiredRoles = []) => {
  return (props) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  )
}

// HOC for protecting components with permissions
export const withPermissionProtection = (WrappedComponent, requiredPermissions = []) => {
  return (props) => (
    <ProtectedRoute requiredPermissions={requiredPermissions}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  )
}

// Hook for checking access within components
export const useAccessControl = () => {
  const { hasRole, hasPermission, user } = useAuth()

  const checkAccess = (roles = [], permissions = []) => {
    if (roles.length > 0) {
      const hasRequiredRole = roles.some(role => hasRole(role))
      if (!hasRequiredRole) return false
    }

    if (permissions.length > 0) {
      const hasRequiredPermission = permissions.some(permission => hasPermission(permission))
      if (!hasRequiredPermission) return false
    }

    return true
  }

  return {
    checkAccess,
    canAccess: checkAccess,
    hasRole,
    hasPermission,
    userRole: user?.role,
    isAdmin: hasRole('admin'),
    isEditor: hasRole(['admin', 'editor']),
    isUser: hasRole('user')
  }
}

// Component for conditionally rendering content based on access
export const AccessGuard = ({ 
  roles = [], 
  permissions = [], 
  fallback = null, 
  children 
}) => {
  const { checkAccess } = useAccessControl()

  if (!checkAccess(roles, permissions)) {
    return fallback
  }

  return children
}

export default ProtectedRoute