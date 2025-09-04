# INSBU Statistics Portal

A modern, full-stack web application for the Institute of National Statistics of Burundi (INSBU) built with React and Laravel. This portal provides a comprehensive platform for managing and displaying statistical data, news, documents, and user interactions.

## 🌟 Features

### Frontend (React + Vite + Material UI)
- **Modern UI/UX**: Beautiful, responsive design using Material UI 5
- **Dark/Light Mode**: Theme switching with persistence
- **Dashboard**: Interactive statistics cards and charts
- **News Management**: Create, edit, and view news articles
- **Document Management**: Upload, download, and organize documents
- **User Management**: Role-based access control (Admin, Editor, User)
- **Authentication**: Secure login/signup with JWT tokens
- **Responsive Design**: Mobile-first approach with smooth animations

### Backend (Laravel + Sanctum)
- **RESTful API**: Clean, well-documented API endpoints
- **Authentication**: Laravel Sanctum for secure API authentication
- **Role-Based Access**: Admin, Editor, and User roles with permissions
- **File Management**: Secure file upload and download system
- **Database**: MySQL with comprehensive migrations and seeders
- **Security**: Input validation, sanitization, and protection

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PHP (v8.1+)
- Composer
- MySQL

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_DATABASE=insbu_statistics
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate --seed

# Create storage link
php artisan storage:link

# Start development server
php artisan serve
```

## 📁 Project Structure

```
├── src/                          # React frontend
│   ├── components/              # Reusable UI components
│   │   ├── Dashboard/          # Dashboard-specific components
│   │   ├── Documents/          # Document management components
│   │   ├── Layout/             # Layout components (Sidebar, TopBar)
│   │   └── News/               # News-related components
│   ├── contexts/               # React contexts (Auth, Theme)
│   ├── pages/                  # Main application pages
│   ├── services/               # API service functions
│   ├── theme/                  # Material UI theme configuration
│   └── utils/                  # Utility functions
│
├── backend/                      # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/   # API controllers
│   │   └── Models/             # Eloquent models
│   ├── database/
│   │   ├── migrations/         # Database migrations
│   │   └── seeders/            # Database seeders
│   └── routes/                 # API routes
```

## 🎨 Design Features

### Material UI Components
- Custom theme with professional colors
- Consistent typography and spacing
- Smooth animations and transitions
- Responsive grid system
- Interactive charts using Recharts

### User Experience
- Loading states and skeletons
- Error boundaries and 404 pages
- Toast notifications
- Form validation
- Search and filtering
- Pagination

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management and role assignment
- All content management privileges
- System statistics and logs

### Editor
- Create, edit, and delete news articles
- Upload and manage documents
- View all content and statistics

### User
- View published news and documents
- Download public documents
- Access dashboard and statistics

## 🔐 Security Features

### Frontend Security
- JWT token management
- Protected routes
- Form validation
- XSS prevention
- Clear error handling

### Backend Security
- Laravel Sanctum authentication
- Input validation and sanitization
- Role-based middleware
- File upload security
- CORS configuration

## 📊 Sample Data

The application includes comprehensive seeders with:
- **Users**: 1 Admin, 3 Editors, 5 Users
- **News**: 8 sample articles across different categories
- **Documents**: 12 sample documents with various file types

### Default Login Credentials
- **Admin**: admin@insbu.bi / password123
- **Editor**: marie.uwimana@insbu.bi / password123
- **User**: demo@insbu.bi / demo123

## 🛠 Development

### Available Scripts (Frontend)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Available Commands (Backend)
```bash
php artisan serve            # Start development server
php artisan migrate:fresh    # Fresh migration
php artisan db:seed          # Run seeders
php artisan route:list       # List all routes
php artisan tinker          # Laravel REPL
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### News
- `GET /api/news` - Get news articles
- `POST /api/news` - Create news article
- `GET /api/news/{id}` - Get specific article
- `PUT /api/news/{id}` - Update article
- `DELETE /api/news/{id}` - Delete article

### Documents
- `GET /api/documents` - Get documents
- `POST /api/documents` - Upload document
- `GET /api/documents/{id}/download` - Download document
- `DELETE /api/documents/{id}` - Delete document

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/role` - Update user role
- `GET /api/admin/statistics` - Get system statistics

## 🎯 Teaching Notes

This project is designed for educational purposes and includes:
- **Clean Code**: Well-commented, readable code structure
- **Best Practices**: Modern React and Laravel patterns
- **Security**: Real-world security implementations
- **Scalability**: Extensible architecture for future features
- **Documentation**: Comprehensive inline and external documentation

## 🤝 Contributing

This project is designed for learning and extension. Students can:
1. Add new page components
2. Implement additional features
3. Enhance the UI/UX
4. Extend the API functionality
5. Add more sophisticated analytics

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For questions or support regarding this educational project, please refer to the inline code comments and documentation provided throughout the codebase.

---

**Built with ❤️ for educational purposes**  
*Institute of National Statistics of Burundi (INSBU) Statistics Portal*
