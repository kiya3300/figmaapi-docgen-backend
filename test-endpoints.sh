#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}🧪 FIGMAAPI-DOCGEN BACKEND ENDPOINT TESTING${NC}"
echo "=================================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✅ PASSED (Status: $status_code)${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED (Status: $status_code)${NC}"
        echo "Response: $response_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Test data
TEST_USER='{"email":"test@example.com","password":"password123","name":"Test User"}'
TEST_LOGIN='{"email":"test@example.com","password":"password123"}'
TEST_PROJECT='{"name":"Test Project","description":"Test Description","figmaFileId":"test123"}'
TEST_FIGMA='{"accessToken":"test-token","teamId":"test-team"}'
TEST_DOCS='{"title":"Test Docs","projectId":"test-project","content":{"test":"data"}}'

echo -e "${BLUE}📋 TESTING ALL ENDPOINTS${NC}"
echo "================================"
echo ""

# 1. Health & Root Endpoints
echo -e "${BLUE}🏥 Health & Root Endpoints${NC}"
test_endpoint "GET" "/health" "" "Health Check"
test_endpoint "GET" "/" "" "Root Endpoint"

# 2. Authentication Endpoints
echo -e "${BLUE}�� Authentication Endpoints${NC}"
test_endpoint "POST" "/auth/register" "$TEST_USER" "User Registration"
test_endpoint "POST" "/auth/login" "$TEST_LOGIN" "User Login"
test_endpoint "POST" "/auth/logout" "" "User Logout"
test_endpoint "POST" "/auth/forgot-password" '{"email":"test@example.com"}' "Forgot Password"
test_endpoint "POST" "/auth/reset-password" '{"token":"test-token","password":"newpassword123"}' "Reset Password"
test_endpoint "PUT" "/auth/change-password" '{"currentPassword":"password123","newPassword":"newpassword123"}' "Change Password"
test_endpoint "POST" "/auth/refresh-token" '{"refreshToken":"test-refresh-token"}' "Refresh Token"
test_endpoint "GET" "/auth/profile" "" "Get Profile"
test_endpoint "PUT" "/auth/profile" '{"name":"Updated Name","email":"updated@example.com"}' "Update Profile"

# 3. Users Endpoints
echo -e "${BLUE}👥 Users Endpoints${NC}"
test_endpoint "GET" "/users/profile" "" "Get User Profile"
test_endpoint "PUT" "/users/profile" '{"name":"Updated Name","email":"updated@example.com"}' "Update User Profile"
test_endpoint "GET" "/users/team" "" "Get Team Members"
test_endpoint "POST" "/users/team" '{"email":"team@example.com","role":"member"}' "Invite Team Member"
test_endpoint "DELETE" "/users/team/test-id" "" "Remove Team Member"

# 4. Projects Endpoints
echo -e "${BLUE}📁 Projects Endpoints${NC}"
test_endpoint "GET" "/projects" "" "List Projects"
test_endpoint "POST" "/projects" "$TEST_PROJECT" "Create Project"
test_endpoint "GET" "/projects/test-id" "" "Get Project"
test_endpoint "PUT" "/projects/test-id" "$TEST_PROJECT" "Update Project"
test_endpoint "DELETE" "/projects/test-id" "" "Delete Project"
test_endpoint "GET" "/projects/test-id/files" "" "Get Project Files"
test_endpoint "POST" "/projects/test-id/files" '{"fileId":"test-file","fileName":"test.fig"}' "Add Project File"
test_endpoint "DELETE" "/projects/test-id/files/test-file" "" "Remove Project File"
test_endpoint "GET" "/projects/test-id/members" "" "Get Project Members"
test_endpoint "POST" "/projects/test-id/members" '{"userId":"test-user","role":"member"}' "Add Project Member"
test_endpoint "DELETE" "/projects/test-id/members/test-user" "" "Remove Project Member"

# 5. Figma Endpoints
echo -e "${BLUE}🎨 Figma Endpoints${NC}"
test_endpoint "POST" "/figma/connect" "$TEST_FIGMA" "Connect Figma Account"
test_endpoint "GET" "/figma/connections" "" "List Figma Connections"
test_endpoint "GET" "/figma/connections/test-id" "" "Get Figma Connection"
test_endpoint "DELETE" "/figma/connections/test-id" "" "Disconnect Figma Account"
test_endpoint "GET" "/figma/files" "" "List Figma Files"
test_endpoint "GET" "/figma/files/test-file" "" "Get Figma File"
test_endpoint "POST" "/figma/analyze" '{"fileId":"test-file"}' "Analyze Figma File"
test_endpoint "GET" "/figma/components" "" "Get Figma Components"
test_endpoint "GET" "/figma/components/test-file" "" "Get File Components"
test_endpoint "POST" "/figma/webhook" '{"event":"file_update","fileId":"test-file"}' "Figma Webhook"

# 6. Documentation Endpoints
echo -e "${BLUE}📚 Documentation Endpoints${NC}"
test_endpoint "POST" "/docs/generate" "$TEST_DOCS" "Generate Documentation"
test_endpoint "GET" "/docs" "" "List Documentation"
test_endpoint "GET" "/docs/test-id" "" "Get Documentation"
test_endpoint "PUT" "/docs/test-id" "$TEST_DOCS" "Update Documentation"
test_endpoint "DELETE" "/docs/test-id" "" "Delete Documentation"
test_endpoint "GET" "/docs/test-id/export" "" "Export Documentation"
test_endpoint "POST" "/docs/test-id/version" '{"version":"2.0.0"}' "Create Documentation Version"
test_endpoint "GET" "/docs/test-id/versions" "" "List Documentation Versions"
test_endpoint "GET" "/docs/test-id/versions/test-version" "" "Get Documentation Version"

# 7. Admin Endpoints
echo -e "${BLUE}👨‍💼 Admin Endpoints${NC}"
test_endpoint "GET" "/admin/users" "" "List All Users"
test_endpoint "GET" "/admin/users/test-id" "" "Get User Details"
test_endpoint "POST" "/admin/users/test-id/ban" '{"reason":"Violation"}' "Ban User"
test_endpoint "POST" "/admin/users/test-id/unban" "" "Unban User"
test_endpoint "GET" "/admin/metrics" "" "Get System Metrics"
test_endpoint "GET" "/admin/analytics" "" "Get Usage Analytics"
test_endpoint "GET" "/admin/analytics/users" "" "Get User Analytics"
test_endpoint "GET" "/admin/analytics/projects" "" "Get Project Analytics"
test_endpoint "GET" "/admin/analytics/documentation" "" "Get Documentation Analytics"
test_endpoint "GET" "/admin/health" "" "Get System Health"

# 8. API Client Endpoints
echo -e "${BLUE}🔧 API Client Endpoints${NC}"
test_endpoint "POST" "/api-client/test" '{"url":"https://api.example.com","method":"GET"}' "Test API Endpoint"
test_endpoint "GET" "/api-client/history" "" "Get Request History"
test_endpoint "POST" "/api-client/environments" '{"name":"Production","baseUrl":"https://api.example.com"}' "Create Environment"
test_endpoint "GET" "/api-client/environments" "" "List Environments"
test_endpoint "PUT" "/api-client/environments/test-id" '{"name":"Updated Environment"}' "Update Environment"
test_endpoint "DELETE" "/api-client/environments/test-id" "" "Delete Environment"
test_endpoint "GET" "/api-client/keys" "" "List API Keys"
test_endpoint "POST" "/api-client/keys" '{"name":"Test Key","permissions":["read","write"]}' "Create API Key"
test_endpoint "DELETE" "/api-client/keys/test-id" "" "Delete API Key"

# 9. Cache Endpoints
echo -e "${BLUE}💾 Cache Endpoints${NC}"
test_endpoint "GET" "/cache/stats" "" "Get Cache Statistics"
test_endpoint "GET" "/cache/entries" "" "List Cache Entries"
test_endpoint "POST" "/cache/refresh" '{"key":"test-key"}' "Refresh Cache Entry"
test_endpoint "DELETE" "/cache/clear" "" "Clear All Cache"
test_endpoint "DELETE" "/cache/entries/test-key" "" "Clear Specific Cache Entry"
test_endpoint "GET" "/cache/health" "" "Get Cache Health"
test_endpoint "POST" "/cache/config" '{"ttl":3600,"maxSize":104857600}' "Update Cache Configuration"
test_endpoint "GET" "/cache/analytics" "" "Get Cache Analytics"
test_endpoint "GET" "/cache/analytics/performance" "" "Get Cache Performance Analytics"
test_endpoint "GET" "/cache/analytics/size-distribution" "" "Get Cache Size Distribution"

# Summary
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "=================="
echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
echo -e "${BLUE}📋 Total: $TOTAL_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your backend is working perfectly!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the failed endpoints above.${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Swagger Documentation: $BASE_URL/api-docs${NC}"
echo -e "${BLUE}📋 OpenAPI JSON: $BASE_URL/api-json${NC}" 