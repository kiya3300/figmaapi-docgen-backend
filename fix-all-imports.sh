#!/bin/bash

echo "🔧 Fixing all import paths..."
echo "============================="

# Update all @/ imports to relative paths
find src -name "*.ts" -exec sed -i 's|@/shared/|../../shared/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/modules/|../modules/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;

echo "✅ All import paths fixed!"
echo ""

# Commit and push
git add .
git commit -m "Fix all import paths for deployment"
git push origin main

echo "🚀 Changes pushed to GitHub!"
echo "Render will automatically redeploy..."
