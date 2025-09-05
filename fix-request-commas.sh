#!/bin/bash

echo "🔧 Fixing missing commas after @Request() req in all files..."
echo "=========================================================="

# Find all files with @Request() req missing comma
echo "Files with @Request() req issues:"
grep -r "@Request() req$" src/ --include="*.ts" || echo "No @Request() req issues found"

echo ""
echo "Fixing @Request() req missing commas..."

# Fix @Request() req missing comma (add comma after it)
find src -name "*.ts" -exec sed -i 's/@Request() req$/@Request() req,/' {} \;

echo ""
echo "Verifying fixes..."
echo "Remaining @Request() req without comma:"
grep -r "@Request() req$" src/ --include="*.ts" || echo "✅ All @Request() req now have commas"

echo ""
echo "✅ All @Request() req commas fixed!"
echo ""

# Commit and push
git add .
git commit -m "Fix missing commas after @Request() req in all files"
git push origin main

echo "🚀 Changes pushed to GitHub!"
echo "Render will automatically redeploy..."
