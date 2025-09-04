#!/bin/bash

echo "🔧 Fixing all remaining @/ imports to relative paths..."
echo "====================================================="

# Fix projects controller
sed -i 's|@/shared/dto/projects.dto|../../shared/dto/projects.dto|g' src/modules/projects/projects.controller.ts

# Fix all other @/ imports
find src -name "*.ts" -exec sed -i 's|@/shared/|../../shared/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/modules/|../modules/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;

echo "✅ All path aliases fixed!"
echo ""

# Commit and push
git add .
git commit -m "Fix all remaining @/ imports to relative paths"
git push origin main

echo "🚀 Changes pushed to GitHub!"
echo "Render will automatically redeploy..."
