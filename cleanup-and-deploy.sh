#!/bin/bash

echo "🧹 Cleaning up old test files..."
echo "=================================="

# Remove old test files
rm -f test-with-auth-final.sh
rm -f final-endpoint-test.sh
rm -f test-all-endpoints.sh
rm -f test-with-auth.sh
rm -f comprehensive-endpoint-test.sh
rm -f test-fixed-endpoints.sh
rm -f test-endpoints.sh

echo "✅ Old test files removed!"
echo ""

echo "🚀 Preparing for Render deployment..."
echo "====================================="

# Create deployment files
echo "1. Creating main backend deployment files..." 