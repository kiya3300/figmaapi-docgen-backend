#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_ENDPOINTS=()

echo -e "${BLUE}🧪 COMPREHENSIVE ENDPOINT TESTING - FINAL CHECK${NC}"
echo "====================================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local auth_header=$5
    local expected_status=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "Endpoint: $method $endpoint"
    
    local curl_cmd="curl -s -w '\n%{http_code}'"
    
    if [ ! -z "$auth_header" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth_header'"
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(eval "$curl_cmd '$BASE_URL$endpoint'")
    elif [ "$method" = "POST" ]; then
        response=$(eval "$curl_cmd -X POST '$BASE_URL$endpoint' -H 'Content-Type: application/json' -d '$data'")
    elif [ "$method" = "PUT" ]; then
        response=$(eval "$curl_cmd -X PUT '$BASE_URL$endpoint' -H 'Content-Type: application/json' -d '$data'")
    elif [ "$method" = "DELETE" ]; then
        response=$(eval "$curl_cmd -X DELETE '$BASE_URL$endpoint'")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | head -n -1)
    
    # Determine if test passed based on expected behavior
    if [ -z "$expected_status" ]; then
        expected_status="200"
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED (Status: $status_code)${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED (Status: $status_code, Expected: $expected_status)${NC}"
        echo "Response: $response_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_ENDPOINTS+=("$method $endpoint - $description (Status: $status_code, Expected: $expected_status)")
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

# 1. Health & Root Endpoints (No Auth Required)
echo -e "${BLUE}🏥 Health & Root Endpoints${NC}"
test_endpoint "GET" "/health" "" "Health Check"
test_endpoint "GET" "/" "" "Root Endpoint"

# 2. Authentication Endpoints (No Auth Required)
echo -e "${BLUE}�� Authentication Endpoints${NC}"
test_endpoint "POST" "/auth/register" "$TEST_USER" "User Registration"
test_endpoint "POST" "/auth/login" "$TEST_LOGIN" "User Login"
test_endpoint "POST" "/auth/forgot-password" '{"email":"test@example.com"}' "Forgot Password"
test_endpoint "POST" "/auth/reset-password" '{"token":"test-token","password":"newpassword123","confirmPassword":"newpassword123"}' "Reset Password"
test_endpoint "POST" "/auth/refresh-token" '{"refresh_token":"test-refresh-token"}' "Refresh Token"

# 3. Protected Endpoints (Need Auth)
echo -e "${BLUE}🔒 Protected Endpoints (Without Auth - Should Return 401)${NC}"
test_endpoint "POST" "/auth/logout" "" "User Logout" "" "401"
test_endpoint "PUT" "/auth/change-password" '{"currentPassword":"password123","newPassword":"newpassword123","confirmPassword":"newpassword123"}' "Change Password" "" "401"
test_endpoint "GET" "/auth/profile" "" "Get Profile" "" "401"
test_endpoint "PUT" "/auth/profile" '{"name":"Updated Name","email":"updated@example.com"}' "Update Profile" "" "401"

# 4. Users Endpoints (Protected)
echo -e "${BLUE}👥 Users Endpoints (Protected)${NC}"
test_endpoint "GET" "/users/profile" "" "Get User Profile" "" "401"
test_endpoint "PUT" "/users/profile" '{"name":"Updated Name","email":"updated@example.com"}' "Update User Profile" "" "401"
test_endpoint "GET" "/users/team" "" "Get Team Members" "" "401"
test_endpoint "POST" "/users/team" '{"email":"team@example.com","role":"member"}' "Invite Team Member" "" "401"
test_endpoint "DELETE" "/users/team/test-id" "" "Remove Team Member" "" "401"

# 5. Projects Endpoints (Protected)
echo -e "${BLUE}📁 Projects Endpoints (Protected)${NC}"
test_endpoint "GET" "/projects" "" "List Projects" "" "401"
test_endpoint "POST" "/projects" "$TEST_PROJECT" "Create Project" "" "401"
test_endpoint "GET" "/projects/test-id" "" "Get Project" "" "401"
test_endpoint "PUT" "/projects/test-id" "$TEST_PROJECT" "Update Project" "" "401"
test_endpoint "DELETE" "/projects/test-id" "" "Delete Project" "" "401"
test_endpoint "GET" "/projects/test-id/files" "" "Get Project Files" "" "401"
test_endpoint "POST" "/projects/test-id/files" '{"fileId":"test-file","fileName":"test.fig"}' "Add Project File" "" "401"
test_endpoint "DELETE" "/projects/test-id/files/test-file" "" "Remove Project File" "" "401"
test_endpoint "GET" "/projects/test-id/members" "" "Get Project Members" "" "401"
test_endpoint "POST" "/projects/test-id/members" '{"userId":"test-user","role":"member"}' "Add Project Member" "" "401"
test_endpoint "DELETE" "/projects/test-id/members/test-user" "" "Remove Project Member" "" "401"

# 6. Figma Endpoints (Protected)
echo -e "${BLUE}🎨 Figma Endpoints (Protected)${NC}"
test_endpoint "POST" "/figma/connect" "$TEST_FIGMA" "Connect Figma Account" "" "401"
test_endpoint "GET" "/figma/connection" "" "Get Primary Connection" "" "401"
test_endpoint "DELETE" "/figma/connection" "" "Disconnect Primary Account" "" "401"
test_endpoint "GET" "/figma/connections" "" "List Figma Connections" "" "401"
test_endpoint "GET" "/figma/connections/test-id" "" "Get Figma Connection" "" "401"
test_endpoint "DELETE" "/figma/connections/test-id" "" "Disconnect Figma Account" "" "401"
test_endpoint "GET" "/figma/files" "" "List Figma Files" "" "401"
test_endpoint "GET" "/figma/files/test-file" "" "Get Figma File" "" "401"
test_endpoint "POST" "/figma/analyze" '{"fileId":"test-file"}' "Analyze Figma File" "" "401"
test_endpoint "GET" "/figma/components" "" "Get Figma Components" "" "401"
test_endpoint "GET" "/figma/components/test-file" "" "Get File Components" "" "401"
test_endpoint "GET" "/figma/components/test-component" "" "Get Component Details" "" "401"
test_endpoint "POST" "/figma/webhook" '{"event":"file_update","fileId":"test-file"}' "Figma Webhook" "" "401"
test_endpoint "GET" "/figma/analysis/test-id/status" "" "Get Analysis Status" "" "401"

# 7. Documentation Endpoints (Protected)
echo -e "${BLUE}📚 Documentation Endpoints (Protected)${NC}"
test_endpoint "POST" "/docs/generate" "$TEST_DOCS" "Generate Documentation" "" "401"
test_endpoint "GET" "/docs" "" "List Documentation" "" "401"
test_endpoint "GET" "/docs/test-id" "" "Get Documentation" "" "401"
test_endpoint "PUT" "/docs/test-id" "$TEST_DOCS" "Update Documentation" "" "401"
test_endpoint "DELETE" "/docs/test-id" "" "Delete Documentation" "" "401"
test_endpoint "GET" "/docs/test-id/export" "" "Export Documentation" "" "401"
test_endpoint "POST" "/docs/test-id/version" '{"version":"2.0.0"}' "Create Documentation Version" "" "401"
test_endpoint "GET" "/docs/test-id/versions" "" "List Documentation Versions" "" "401"
test_endpoint "GET" "/docs/test-id/versions/test-version" "" "Get Documentation Version" "" "401"

# 8. Admin Endpoints (Protected)
echo -e "${BLUE}👨‍💼 Admin Endpoints (Protected)${NC}"
test_endpoint "GET" "/admin/users" "" "List All Users" "" "401"
test_endpoint "GET" "/admin/users/test-id" "" "Get User Details" "" "401"
test_endpoint "POST" "/admin/users/test-id/ban" '{"reason":"Violation"}' "Ban User" "" "401"
test_endpoint "POST" "/admin/users/test-id/unban" "" "Unban User" "" "401"
test_endpoint "GET" "/admin/metrics" "" "Get System Metrics" "" "401"
test_endpoint "GET" "/admin/analytics" "" "Get Usage Analytics" "" "401"
test_endpoint "GET" "/admin/analytics/users" "" "Get User Analytics" "" "401"
test_endpoint "GET" "/admin/analytics/projects" "" "Get Project Analytics" "" "401"
test_endpoint "GET" "/admin/analytics/documentation" "" "Get Documentation Analytics" "" "401"
test_endpoint "GET" "/admin/health" "" "Get System Health" "" "401"

# 9. API Client Endpoints (Protected)
echo -e "${BLUE}🔧 API Client Endpoints (Protected)${NC}"
test_endpoint "POST" "/api-client/test" '{"url":"https://api.example.com","method":"GET"}' "Test API Endpoint" "" "401"
test_endpoint "GET" "/api-client/history" "" "Get Request History" "" "401"
test_endpoint "POST" "/api-client/environments" '{"name":"Production","baseUrl":"https://api.example.com"}' "Create Environment" "" "401"
test_endpoint "GET" "/api-client/environments" "" "List Environments" "" "401"
test_endpoint "PUT" "/api-client/environments/test-id" '{"name":"Updated Environment"}' "Update Environment" "" "401"
test_endpoint "DELETE" "/api-client/environments/test-id" "" "Delete Environment" "" "401"
test_endpoint "GET" "/api-client/keys" "" "List API Keys" "" "401"
test_endpoint "POST" "/api-client/keys" '{"name":"Test Key","permissions":["read","write"]}' "Create API Key" "" "401"
test_endpoint "DELETE" "/api-client/keys/test-id" "" "Delete API Key" "" "401"

# 10. Cache Endpoints (No Auth Required)
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
    echo -e "${YELLOW}⚠️  Some tests failed. Here are the details:${NC}"
    echo ""
    for endpoint in "${FAILED_ENDPOINTS[@]}"; do
        echo -e "${RED}  • $endpoint${NC}"
    done
    echo ""
    echo -e "${YELLOW}💡 Note: Protected endpoints returning 401 is EXPECTED without authentication${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Swagger Documentation: $BASE_URL/api-docs${NC}"
echo -e "${BLUE}📋 OpenAPI JSON: $BASE_URL/api-json${NC}" 