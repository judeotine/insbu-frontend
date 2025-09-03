# INSBU Statistics Portal - Frontend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Laravel backend running on port 8000

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME=INSBU Statistics Portal
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENV=development
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🔗 Backend Integration

### API Configuration
The frontend is configured to work with your Laravel backend at:
- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Laravel Sanctum with Bearer tokens
- **CORS**: Configured in `backend/config/cors.php`

### Required Backend Routes
Ensure your Laravel backend has these API routes:

#### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register` 
- `GET /api/auth/user`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

#### Dashboard & Statistics
- `GET /api/stats/dashboard`
- `GET /api/stats/users`
- `GET /api/stats/content`
- `GET /api/stats/activity`

#### News Management
- `GET /api/news`
- `POST /api/news`
- `GET /api/news/{id}`
- `PUT /api/news/{id}`
- `DELETE /api/news/{id}`

#### Document Management
- `GET /api/documents`
- `POST /api/documents`
- `GET /api/documents/{id}`
- `GET /api/documents/{id}/download`
- `DELETE /api/documents/{id}`

#### Admin Panel
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `DELETE /api/admin/users/{id}`
- `GET /api/admin/statistics`

## 📱 Features Included

### ✅ Authentication System
- Login/Register with validation
- JWT token management with auto-refresh
- Role-based access control (Admin, Editor, User)
- Protected routes and components

### ✅ Dashboard
- Real-time statistics cards
- Interactive charts with Recharts
- Recent activity feed
- System status monitoring

### ✅ News Management
- Create, edit, delete articles (Admin/Editor)
- Rich content display
- Category filtering and search
- Responsive card layouts

### ✅ Document Management
- Drag-and-drop file upload
- File validation and progress tracking
- Download functionality
- Category organization

### ✅ Admin Panel
- User management (Admin only)
- Role assignment
- System statistics
- User activity monitoring

### ✅ UI/UX Features
- Material UI 5 with custom theme
- Dark/light mode toggle
- Responsive design (mobile-first)
- Loading states and skeletons
- Toast notifications
- Error boundaries
- 404 page with helpful navigation

### ✅ Performance & Security
- Code splitting and lazy loading
- API caching with configurable duration
- Request retry logic with exponential backoff
- Form validation with react-hook-form
- XSS protection and input sanitization
- Performance monitoring hooks

## 🎨 Customization

### Theme Configuration
Edit `src/theme/theme.js` to customize:
- Primary/secondary colors
- Typography settings
- Component styling
- Dark/light mode variants

### API Configuration
Edit `src/utils/constants.js` to modify:
- API timeout settings
- Retry attempt counts
- Cache durations
- Validation rules

### Role Permissions
Edit `src/utils/constants.js` to update:
- User role definitions
- Permission mappings
- Protected route requirements

## 🛠 Development Tools

### Available Scripts
```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint code quality check
```

### Performance Monitoring
The app includes built-in performance monitoring:
- Component render tracking
- API request timing
- Memory usage monitoring
- Network quality detection

### Error Handling
Comprehensive error handling with:
- Global error boundary
- API error processing
- User-friendly error messages
- Fallback UI components

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Laravel backend CORS is configured for `http://localhost:3000`
   - Check `backend/config/cors.php` settings

2. **API Connection Issues**
   - Verify backend is running on `http://localhost:8000`
   - Check network tab in browser dev tools
   - Ensure API routes exist and return JSON

3. **Authentication Problems**
   - Check Laravel Sanctum configuration
   - Verify CSRF tokens if using session auth
   - Clear browser storage and try again

4. **File Upload Issues**
   - Check Laravel storage permissions
   - Verify file size limits in PHP and Laravel
   - Ensure storage link is created: `php artisan storage:link`

### Debug Mode
Set `VITE_DEBUG=true` in your `.env` file to enable:
- Detailed console logging
- Performance metrics display
- API request/response logging

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API responses
3. Review network requests in dev tools
4. Check Laravel logs for backend issues

## 🎯 Next Steps

1. **Start Backend**: Ensure Laravel backend is running
2. **Install Frontend**: Run `npm install` 
3. **Configure Environment**: Create `.env` file
4. **Start Development**: Run `npm run dev`
5. **Test Features**: Login with demo credentials
6. **Customize**: Modify theme and content as needed

The application is now ready for development and production use!
