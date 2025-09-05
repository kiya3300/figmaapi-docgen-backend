#!/bin/bash

echo "🔧 Fixing syntax errors in projects.controller.ts..."

# Fix the missing comma after @Request() req
sed -i 's/@Request() req$/@Request() req,/' src/modules/projects/projects.controller.ts

echo "✅ Syntax errors fixed!"
echo ""

# Commit and push
git add .
git commit -m "Fix syntax errors in projects controller"
git push origin main

echo "🚀 Changes pushed to GitHub!"
echo "Render will automatically redeploy..."
