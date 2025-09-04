#!/bin/bash

echo "�� Deploying FigmaAPI-DocGen to Render..."
echo "=========================================="

# Clean up old test files
echo "1. Cleaning up old test files..."
rm -f test-with-auth-final.sh
rm -f final-endpoint-test.sh
rm -f test-all-endpoints.sh
rm -f test-with-auth.sh
rm -f comprehensive-endpoint-test.sh
rm -f test-fixed-endpoints.sh
rm -f test-endpoints.sh

echo "✅ Test files cleaned up!"

# Build the application
echo "2. Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Generate Prisma client
echo "3. Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated!"
else
    echo "❌ Prisma generation failed!"
    exit 1
fi

# Build ML service
echo "4. Building ML service..."
cd ml-service
npm run build
cd ..

if [ $? -eq 0 ]; then
    echo "✅ ML service built successfully!"
else
    echo "❌ ML service build failed!"
    exit 1
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Render"
echo "3. Configure environment variables in Render dashboard"
echo "4. Deploy both services (main backend + ML service)"
echo ""
echo "🔗 Render Dashboard: https://dashboard.render.com"
echo "📚 Documentation: https://render.com/docs" 