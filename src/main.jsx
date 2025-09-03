import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Error boundary for the entire app
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary Caught:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Roboto, sans-serif',
          maxWidth: '600px',
          margin: '100px auto'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            We're sorry, but something unexpected happened. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: '30px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Remove initial loading screen after React has loaded
const removeInitialLoading = () => {
  const initialLoading = document.querySelector('.initial-loading')
  if (initialLoading) {
    initialLoading.style.opacity = '0'
    initialLoading.style.transition = 'opacity 0.3s ease'
    setTimeout(() => {
      initialLoading.remove()
    }, 300)
  }
}

// Remove after a delay to ensure React has mounted
setTimeout(removeInitialLoading, 1000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)