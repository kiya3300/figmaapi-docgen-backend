#!/bin/bash

BASE_URL="http://localhost:3001"

echo "🧪 Testing Fixed Endpoints"
echo "=========================="

# 1. Test registration
echo "1. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}')

echo "Register Response: $REGISTER_RESPONSE"

# 2. Test login
echo "2. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo "Token extracted: ${TOKEN:0:20}..."
    
    # 3. Test protected endpoints
    echo "3. Testing protected endpoints with token..."
    
    # Test profile endpoint
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
      -H "Authorization: Bearer $TOKEN")
    echo "Profile Response: $PROFILE_RESPONSE"
    
    # Test projects endpoint
    PROJECTS_RESPONSE=$(curl -s -X GET "$BASE_URL/projects" \
      -H "Authorization: Bearer $TOKEN")
    echo "Projects Response: $PROJECTS_RESPONSE"
    
else
    echo "❌ Failed to extract token from login response"
fi

echo "✅ Testing complete!" 