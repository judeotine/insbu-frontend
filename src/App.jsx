import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CustomThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import { useRenderTracker, useBundleMetrics } from './hooks/usePerformance'

// Lazy load components for better performance
const AppLayout = lazy(() => import('./components/Layout/AppLayout'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const News = lazy(() => import('./pages/News'))
const NewsCreate = lazy(() => import('./pages/NewsCreate'))
const NewsEdit = lazy(() => import('./pages/NewsEdit'))
const NewsView = lazy(() => import('./pages/NewsView'))
const NewsDetail = lazy(() => import('./pages/NewsDetail'))
const Documents = lazy(() => import('./pages/Documents'))
const Resources = lazy(() => import('./pages/Resources'))
const Admin = lazy(() => import('./pages/Admin'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const Help = lazy(() => import('./pages/Help'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Public route component that redirects authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Enhanced main App component with performance monitoring and error boundaries
// Provides complete application routing with authentication and role-based access
function App() {
  // Performance monitoring in development
  useRenderTracker('App')
  useBundleMetrics()

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CustomThemeProvider>
  )
}

// Separate component to handle auth loading state properly
const AppContent = () => {
  const { loading: authLoading } = useAuth()

  // Show loading screen while authentication is being initialized
  if (authLoading) {
    return <LoadingScreen message="Initializing..." />
  }

  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            style: {
              background: '#4caf50',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#4caf50',
            },
          },
          error: {
            style: {
              background: '#f44336',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#f44336',
            },
          },
          loading: {
            style: {
              background: '#2196f3',
              color: '#ffffff',
            },
          },
        }}
      />

      {/* Main application routes */}
      <Suspense fallback={<LoadingScreen message="Loading page..." />}>
        <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes with layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - Default route */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* News routes */}
              <Route path="news" element={<News />} />
              <Route path="news/create" element={<NewsCreate />} />
              <Route path="news/:id/edit" element={<NewsEdit />} />
              <Route path="news/:id/view" element={<NewsView />} />
              <Route path="news/:id" element={<NewsDetail />} />
              
              {/* Documents route */}
              <Route path="documents" element={<Documents />} />
              
              {/* Resources route */}
              <Route path="resources" element={<Resources />} />
              
              {/* Admin routes - Admin only */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin/users" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin/analytics" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />

              {/* Settings and Help routes */}
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </>
    )
}

export default App