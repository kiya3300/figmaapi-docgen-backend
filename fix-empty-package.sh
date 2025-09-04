#!/bin/bash

echo "🔧 Fixing empty package.json..."
echo "=============================="

# Create a minimal, working package.json
cat > package.json << 'PACKAGEJSON'
{
  "name": "figmaapi-docgen-backend",
  "version": "1.0.0",
  "description": "Backend API for FigmaAPI-DocGen platform",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc",
    "start:prod": "node dist/main.js"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "@nestjs/bull": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "uuid": "^9.0.0",
    "axios": "^1.4.0",
    "redis": "^4.6.0",
    "bull": "^4.10.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@types/node": "^20.3.1",
    "@types/express": "^4.17.17",
    "typescript": "^5.1.3"
  }
}
PACKAGEJSON

# Create a simple tsconfig.json
cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
TSCONFIG

echo "✅ Files created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check the files: cat package.json"
echo "2. Add and commit: git add . && git commit -m 'Fix empty package.json'"
echo "3. Push: git push origin main"
echo "4. Redeploy on Render"
