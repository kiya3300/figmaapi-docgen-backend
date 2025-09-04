# FigmaAPI-DocGen Backend (NestJS)

## 🎯 Project Overview

FigmaAPI-DocGen is a platform that automatically generates API documentation from Figma designs. This backend provides the necessary APIs to support the Next.js frontend application.

## 🏗️ Architecture

### Tech Stack
- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport.js
- **File Storage**: AWS S3 / Local Storage
- **Caching**: Redis
- **Background Jobs**: Bull Queue
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Project Structure
```
src/
├── modules/
│   ├── auth/                 # Authentication & Authorization
│   ├── users/                # User Management
│   ├── projects/             # Project Management
│   ├── figma/                # Figma API Integration
│   ├── documentation/        # API Documentation Generation
│   ├── admin/                # Admin Dashboard APIs
│   ├── api-client/           # API Testing & Client Management
│   └── cache/                # Cache Management & Analytics
├── shared/
│   ├── dto/                  # Data Transfer Objects
│   ├── interfaces/           # TypeScript Interfaces
│   ├── guards/               # Authentication Guards
│   ├── decorators/           # Custom Decorators
│   └── utils/                # Utility Functions
├── config/                   # Configuration Files
└── main.ts                   # Application Entry Point
```

## 📋 Core Features

### 1. Authentication & User Management
- [ ] User registration and login
- [ ] JWT token authentication
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social login (Google, GitHub)

### 2. Figma Integration
- [ ] Figma API authentication
- [ ] File fetching and analysis
- [ ] Component extraction
- [ ] Real-time file updates
- [ ] API key management

### 3. Project Management
- [ ] Project creation and management
- [ ] File organization
- [ ] Team collaboration
- [ ] Project sharing and permissions

### 4. API Documentation Generation
- [ ] Component-to-endpoint mapping
- [ ] Automatic API documentation generation
- [ ] Multiple export formats (OpenAPI, JSON, Markdown)
- [ ] Custom documentation templates
- [ ] Version control for documentation

### 5. Admin Dashboard
- [ ] User analytics and metrics
- [ ] System health monitoring
- [ ] Billing and subscription management
- [ ] Usage statistics
- [ ] Admin user management

### 6. API Client Testing
- [ ] Request/response testing
- [ ] Environment management
- [ ] Authentication testing
- [ ] API key management
- [ ] Request history

### 7. Cache Management
- [ ] Redis cache implementation
- [ ] Cache entry monitoring and analytics
- [ ] Cache invalidation strategies
- [ ] Cache performance optimization
- [ ] Cache health monitoring
- [ ] Cache configuration management
- [ ] Cache size distribution tracking
- [ ] Hit rate analytics

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register          # User registration
POST   /auth/login            # User login
POST   /auth/refresh          # Refresh JWT token
POST   /auth/logout           # User logout
POST   /auth/forgot-password  # Password reset request
POST   /auth/reset-password   # Password reset
POST   /auth/verify-email     # Email verification
```

### Users
```
GET    /users/profile         # Get user profile
PUT    /users/profile         # Update user profile
GET    /users/team           # Get team members
POST   /users/team           # Invite team member
DELETE /users/team/:id       # Remove team member
```

### Projects
```
GET    /projects              # List user projects
POST   /projects              # Create new project
GET    /projects/:id          # Get project details
PUT    /projects/:id          # Update project
DELETE /projects/:id          # Delete project
GET    /projects/:id/files    # Get project files
```

### Figma Integration
```
POST   /figma/connect         # Connect Figma account
GET    /figma/files           # List Figma files
GET    /figma/files/:id       # Get file details
POST   /figma/analyze         # Analyze Figma file
GET    /figma/components      # Get file components
POST   /figma/webhook         # Figma webhook handler
```

### Documentation
```
POST   /docs/generate         # Generate API documentation
GET    /docs/:id              # Get documentation
PUT    /docs/:id              # Update documentation
DELETE /docs/:id              # Delete documentation
GET    /docs/:id/export       # Export documentation
POST   /docs/:id/version      # Create new version
```

### Admin
```
GET    /admin/users           # List all users
GET    /admin/metrics         # System metrics
GET    /admin/analytics       # Usage analytics
POST   /admin/users/:id/ban   # Ban user
POST   /admin/users/:id/unban # Unban user
```

### API Client
```
POST   /api-client/test       # Test API endpoint
GET    /api-client/history    # Request history
POST   /api-client/environments # Manage environments
GET    /api-client/keys       # API keys management
```

### Cache Management
```
GET    /cache/stats           # Get cache statistics
GET    /cache/entries         # List cache entries
POST   /cache/refresh         # Refresh cache entries
DELETE /cache/clear           # Clear all cache
DELETE /cache/entries/:key    # Clear specific cache entry
GET    /cache/health          # Cache health status
POST   /cache/config          # Update cache configuration
GET    /cache/analytics       # Cache performance analytics
```

## 🗄️ Database Schema

### Users
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  plan VARCHAR DEFAULT 'free',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Projects
```sql
projects (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  figma_file_id VARCHAR,
  figma_file_name VARCHAR,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Documentation
```sql
documentation (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title VARCHAR NOT NULL,
  content JSONB,
  version INTEGER DEFAULT 1,
  format VARCHAR DEFAULT 'openapi',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### API Keys
```sql
api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  key_hash VARCHAR NOT NULL,
  permissions JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Cache Entries
```sql
cache_entries (
  id UUID PRIMARY KEY,
  cache_key VARCHAR NOT NULL,
  cache_type VARCHAR NOT NULL,
  data JSONB,
  size_bytes BIGINT,
  hit_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Cache Analytics
```sql
cache_analytics (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  cache_type VARCHAR NOT NULL,
  hits INTEGER DEFAULT 0,
  misses INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/figmaapi_docgen"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Figma API
FIGMA_ACCESS_TOKEN="your-figma-token"
FIGMA_CLIENT_ID="your-figma-client-id"
FIGMA_CLIENT_SECRET="your-figma-client-secret"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-s3-bucket"
AWS_REGION="us-east-1"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"

# App
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd figmaapi-docgen-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run start:dev
```

### Available Scripts
```bash
npm run start:dev      # Start development server
npm run start:debug    # Start with debug mode
npm run start:prod     # Start production server
npm run build          # Build application
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Run tests with coverage
npm run lint           # Run linting
npm run format         # Format code
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI JSON**: http://localhost:3001/api-json

## 🔒 Security Considerations

- [ ] JWT token validation
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] File upload security

## 📦 Deployment

### Docker
```bash
# Build image
docker build -t figmaapi-docgen-backend .

# Run container
docker run -p 3001:3001 figmaapi-docgen-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="your-production-db-url"
JWT_SECRET="your-production-jwt-secret"
```

## 🤝 Frontend Integration

### CORS Configuration
```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### Authentication Flow
1. Frontend sends login request
2. Backend validates credentials
3. Backend returns JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in Authorization header

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 📝 Development Notes

### Code Style
- Use TypeScript strict mode
- Follow NestJS conventions
- Use DTOs for request/response validation
- Implement proper error handling
- Add comprehensive logging

### Performance
- Implement caching strategies
- Use database indexing
- Optimize database queries
- Implement pagination
- Use background jobs for heavy operations

### Monitoring
- Add health check endpoints
- Implement logging (Winston)
- Add performance monitoring
- Set up error tracking

## 🎯 Next Steps

1. **Phase 1**: Setup NestJS project structure
2. **Phase 2**: Implement authentication system
3. **Phase 3**: Create core modules (users, projects)
4. **Phase 4**: Implement Figma integration
5. **Phase 5**: Add documentation generation
6. **Phase 6**: Implement cache management system
7. **Phase 7**: Implement admin features
8. **Phase 8**: Add API client testing
9. **Phase 9**: Add testing and optimization
10. **Phase 10**: Deployment and monitoring

---

**Note**: This README will be updated as development progresses. Screenshots and additional requirements from the frontend will be incorporated to ensure perfect alignment between frontend and backend. 