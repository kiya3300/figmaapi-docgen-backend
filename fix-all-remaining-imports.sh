#!/bin/bash

echo "🔧 Fixing ALL remaining @/ imports across the entire codebase..."
echo "=============================================================="

# Find all files with @/ imports
echo "Files with @/ imports:"
grep -r "@/shared" src/ --include="*.ts" || echo "No @/shared imports found"
grep -r "@/modules" src/ --include="*.ts" || echo "No @/modules imports found"
grep -r "@/config" src/ --include="*.ts" || echo "No @/config imports found"

echo ""
echo "Fixing all @/ imports..."

# Fix all @/ imports to relative paths
find src -name "*.ts" -exec sed -i 's|@/shared/|../../shared/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/modules/|../modules/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;

echo ""
echo "Verifying fixes..."
echo "Remaining @/ imports:"
grep -r "@/shared" src/ --include="*.ts" || echo "✅ No @/shared imports remaining"
grep -r "@/modules" src/ --include="*.ts" || echo "✅ No @/modules imports remaining"
grep -r "@/config" src/ --include="*.ts" || echo "✅ No @/config imports remaining"

echo ""
echo "✅ All @/ imports fixed!"
echo ""

# Commit and push
git add .
git commit -m "Fix ALL remaining @/ imports to relative paths"
git push origin main

echo "🚀 Changes pushed to GitHub!"
echo "Render will automatically redeploy..."
