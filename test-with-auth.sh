#!/bin/bash

BASE_URL="http://localhost:3001"

echo "🔐 Testing with Authentication"
echo "=============================="

# 1. Register a user
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}')

echo "Register Status: $(echo "$REGISTER_RESPONSE" | tail -c 4)"
echo "Register Response: $(echo "$REGISTER_RESPONSE" | head -c 200)..."

# 2. Login to get token
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

echo "Login Status: $(echo "$LOGIN_RESPONSE" | tail -c 4)"
echo "Login Response: $(echo "$LOGIN_RESPONSE" | head -c 200)..."

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo "Token extracted: ${TOKEN:0:20}..."
    
    # 3. Test protected endpoints with token
    echo "3. Testing protected endpoints with token..."
    
    # Test profile endpoint
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
      -H "Authorization: Bearer $TOKEN")
    echo "Profile Status: $(echo "$PROFILE_RESPONSE" | tail -c 4)"
    echo "Profile Response: $(echo "$PROFILE_RESPONSE" | head -c 200)..."
    
    # Test projects endpoint
    PROJECTS_RESPONSE=$(curl -s -X GET "$BASE_URL/projects" \
      -H "Authorization: Bearer $TOKEN")
    echo "Projects Status: $(echo "$PROJECTS_RESPONSE" | tail -c 4)"
    echo "Projects Response: $(echo "$PROJECTS_RESPONSE" | head -c 200)..."
    
    # Test create project
    CREATE_PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name":"Test Project","description":"Test Description"}')
    echo "Create Project Status: $(echo "$CREATE_PROJECT_RESPONSE" | tail -c 4)"
    echo "Create Project Response: $(echo "$CREATE_PROJECT_RESPONSE" | head -c 200)..."
    
    # Test Figma connection
    FIGMA_CONNECTION_RESPONSE=$(curl -s -X GET "$BASE_URL/figma/connection" \
      -H "Authorization: Bearer $TOKEN")
    echo "Figma Connection Status: $(echo "$FIGMA_CONNECTION_RESPONSE" | tail -c 4)"
    echo "Figma Connection Response: $(echo "$FIGMA_CONNECTION_RESPONSE" | head -c 200)..."
    
    # Test cache endpoints (should work without auth)
    CACHE_RESPONSE=$(curl -s -X GET "$BASE_URL/cache/stats")
    echo "Cache Status: $(echo "$CACHE_RESPONSE" | tail -c 4)"
    echo "Cache Response: $(echo "$CACHE_RESPONSE" | head -c 200)..."
    
else
    echo "❌ Failed to extract token from login response"
fi

echo "✅ Testing complete!" 