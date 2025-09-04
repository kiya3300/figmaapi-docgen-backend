#!/bin/bash

echo "🔧 Fixing Nest CLI issue..."
echo "==========================="

# Move @nestjs/cli to dependencies in main package.json
echo "1. Moving @nestjs/cli to dependencies..."
sed -i '' '/"@nestjs\/cli": "\^10.0.0"/d' package.json
sed -i '' '/"@prisma\/client": "\^5.0.0",/a\
    "@nestjs/cli": "^10.0.0",' package.json

# Move @nestjs/cli to dependencies in ML service package.json
echo "2. Moving @nestjs/cli to dependencies in ML service..."
sed -i '' '/"@nestjs\/cli": "\^10.0.0"/d' ml-service/package.json
sed -i '' '/"@tensorflow\/tfjs-node": "\^4.10.0",/a\
    "@nestjs/cli": "^10.0.0",' ml-service/package.json

# Update Node.js version
echo "3. Updating Node.js version..."
echo "20.11.0" > .nvmrc

# Commit and push changes
echo "4. Committing and pushing changes..."
git add .
git commit -m "🔧 Fix Nest CLI issue - Move to dependencies and update Node.js"
git push origin main

echo "✅ Nest CLI issue fixed!"
echo ""
echo "📋 Next steps:"
echo "1. Redeploy on Render"
echo "2. Check build logs"
echo "3. Verify deployment success"
echo ""
echo "🔗 Render Dashboard: https://dashboard.render.com"
