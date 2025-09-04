# FigmaAPI-DocGen Backend

A NestJS backend for the FigmaAPI-DocGen platform that automatically generates API documentation from Figma designs.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd figmaapi-docgen-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run prisma:seed
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

The application will be available at:
- **API**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

## 📋 Available Scripts

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

## 🏗️ Project Structure

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

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Health Check
- `GET /health` - Service health status

## 🗄️ Database

The project uses PostgreSQL with Prisma ORM. The database schema includes:

- **Users** - User accounts and profiles
- **Projects** - Figma projects and files
- **Documentation** - Generated API documentation
- **API Keys** - User API keys and permissions
- **Cache Entries** - Cache management and analytics

## 🔧 Environment Variables

Copy `env.example` to `.env` and configure:

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

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI JSON**: http://localhost:3001/api-json

## 🔒 Security

- JWT token authentication
- Rate limiting
- CORS configuration
- Input validation
- Helmet security headers

## 🚀 Deployment

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 