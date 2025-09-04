#!/bin/bash

echo "🔧 Fixing deployment issues..."
echo "=============================="

# Update tsconfig-paths version
echo "1. Updating tsconfig-paths version..."
sed -i '' 's/"tsconfig-paths": "\^4.2.1"/"tsconfig-paths": "\^4.1.0"/' package.json

# Update ML service tsconfig-paths version
echo "2. Updating ML service tsconfig-paths version..."
sed -i '' 's/"tsconfig-paths": "\^4.2.1"/"tsconfig-paths": "\^4.1.0"/' ml-service/package.json

# Create .nvmrc file
echo "3. Creating .nvmrc file..."
echo "18.17.0" > .nvmrc

# Commit and push changes
echo "4. Committing and pushing changes..."
git add .
git commit -m "🔧 Fix deployment issues - Update package versions"
git push origin main

echo "✅ Deployment issues fixed!"
echo ""
echo "📋 Next steps:"
echo "1. Redeploy on Render"
echo "2. Check build logs"
echo "3. Verify deployment success"
echo ""
echo "🔗 Render Dashboard: https://dashboard.render.com"
