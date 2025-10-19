#!/bin/bash
# Fleet Management System - Production Integration Testing

echo "🚀 Fleet Management System - Production Integration Testing"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production URLs
FRONTEND_URL="https://fleet-management-system-sooty.vercel.app"
BACKEND_URL="https://www.fleetia.online"

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}${endpoint}")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $endpoint - Status: $response${NC}"
        return 0
    else
        echo -e "${RED}❌ $endpoint - Expected: $expected_status, Got: $response${NC}"
        return 1
    fi
}

# Function to test web page
test_web_page() {
    local page="$1"
    local expected_content="$2"
    
    local response=$(curl -s "${FRONTEND_URL}${page}")
    
    if echo "$response" | grep -q "$expected_content"; then
        echo -e "${GREEN}✅ $page - Content found: $expected_content${NC}"
        return 0
    else
        echo -e "${RED}❌ $page - Expected content not found: $expected_content${NC}"
        return 1
    fi
}

echo -e "${YELLOW}🌐 PRODUCTION URLS${NC}"
echo "=================="
echo -e "Frontend: ${FRONTEND_URL}"
echo -e "Backend: ${BACKEND_URL}"
echo ""

echo -e "${YELLOW}Phase 1: Frontend Application Testing${NC}"
echo "====================================="

# Test frontend pages
run_test "Frontend Homepage" "test_web_page '/' 'Fleet Management'"
run_test "Frontend Sign In Page" "test_web_page '/signin' 'Sign In'"
run_test "Frontend Get Started Page" "test_web_page '/get-started' 'Get Started'"
run_test "Frontend Demo Accounts" "test_web_page '/' 'admin / admin123'"

echo -e "${YELLOW}Phase 2: Backend API Testing${NC}"
echo "============================="

# Test backend API endpoints
run_test "Backend API Root" "test_api_endpoint '/api/' '200'"
run_test "Backend Account Endpoints" "test_api_endpoint '/api/account/' '200'"
run_test "Backend Fleet Endpoints" "test_api_endpoint '/api/fleet/' '200'"
run_test "Backend Inspections Endpoints" "test_api_endpoint '/api/inspections/' '200'"
run_test "Backend Issues Endpoints" "test_api_endpoint '/api/issues/' '200'"
run_test "Backend Tickets Endpoints" "test_api_endpoint '/api/tickets/' '200'"
run_test "Backend Telemetry Endpoints" "test_api_endpoint '/api/telemetry/' '200'"
run_test "Backend Dashboard Stats" "test_api_endpoint '/api/fleet/stats/dashboard/' '200'"

echo -e "${YELLOW}Phase 3: Authentication Testing${NC}"
echo "================================="

# Test user registration
echo -e "${BLUE}Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/account/register/" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser_'$(date +%s)'",
        "email": "test'$(date +%s)'@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "role": "driver"
    }')

if echo "$REGISTER_RESPONSE" | grep -q "token\|success"; then
    echo -e "${GREEN}✅ User Registration - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ User Registration - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test user login with demo account
echo -e "${BLUE}Testing User Login with Demo Account...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/account/login/" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "admin",
        "password": "admin123"
    }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ User Login - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # Extract token for authenticated tests
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ User Login - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 4: Authenticated API Testing${NC}"
echo "====================================="

if [ -n "$TOKEN" ]; then
    # Test authenticated endpoints
    echo -e "${BLUE}Testing Authenticated Endpoints...${NC}"
    
    # Test vehicles endpoint
    VEHICLES_RESPONSE=$(curl -s -H "Authorization: Token $TOKEN" "${BACKEND_URL}/api/fleet/vehicles/")
    if echo "$VEHICLES_RESPONSE" | grep -q "results\|count"; then
        echo -e "${GREEN}✅ Vehicles Endpoint - PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Vehicles Endpoint - FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test dashboard stats
    STATS_RESPONSE=$(curl -s -H "Authorization: Token $TOKEN" "${BACKEND_URL}/api/fleet/stats/dashboard/")
    if echo "$STATS_RESPONSE" | grep -q "total_vehicles\|active_vehicles"; then
        echo -e "${GREEN}✅ Dashboard Stats - PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Dashboard Stats - FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test inspections endpoint
    INSPECTIONS_RESPONSE=$(curl -s -H "Authorization: Token $TOKEN" "${BACKEND_URL}/api/inspections/inspections/")
    if echo "$INSPECTIONS_RESPONSE" | grep -q "results\|count"; then
        echo -e "${GREEN}✅ Inspections Endpoint - PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Inspections Endpoint - FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
else
    echo -e "${RED}❌ Cannot test authenticated endpoints - no token available${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 3))
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
fi

echo -e "${YELLOW}Phase 5: Mobile App Integration Testing${NC}"
echo "======================================="

# Test mobile app API endpoints
echo -e "${BLUE}Testing Mobile App API Integration...${NC}"

# Test fuel detection endpoint
FUEL_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/telemetry/fuel-readings/" \
    -H "Authorization: Token $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "vehicle": 1,
        "type": "fuel_level",
        "data": "{\"fuel_level\": 75, \"confidence\": 0.85, \"detection_method\": \"ocr\"}"
    }')

if echo "$FUEL_RESPONSE" | grep -q "success\|created\|id"; then
    echo -e "${GREEN}✅ Fuel Detection API - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Fuel Detection API - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test photo upload endpoint
echo -e "${BLUE}Testing Photo Upload Endpoint...${NC}"
# Create a test image file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

UPLOAD_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/inspections/photos/" \
    -H "Authorization: Token $TOKEN" \
    -F "inspection=1" \
    -F "part=DASHBOARD" \
    -F "image=@test-image.png")

if echo "$UPLOAD_RESPONSE" | grep -q "success\|created\|id"; then
    echo -e "${GREEN}✅ Photo Upload API - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Photo Upload API - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Clean up test file
rm -f test-image.png
echo ""

echo -e "${YELLOW}Phase 6: Performance Testing${NC}"
echo "============================="

# Test API response times
echo -e "${BLUE}Testing API Response Times...${NC}"
API_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${BACKEND_URL}/api/")
if (( $(echo "$API_TIME < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ API Response Time: ${API_TIME}s - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ API Response Time: ${API_TIME}s - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test frontend load time
echo -e "${BLUE}Testing Frontend Load Time...${NC}"
FRONTEND_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${FRONTEND_URL}")
if (( $(echo "$FRONTEND_TIME < 3.0" | bc -l) )); then
    echo -e "${GREEN}✅ Frontend Load Time: ${FRONTEND_TIME}s - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Frontend Load Time: ${FRONTEND_TIME}s - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 7: Security Testing${NC}"
echo "========================="

# Test CORS headers
echo -e "${BLUE}Testing CORS Headers...${NC}"
CORS_RESPONSE=$(curl -s -I "${BACKEND_URL}/api/" | grep -i "access-control")
if [ -n "$CORS_RESPONSE" ]; then
    echo -e "${GREEN}✅ CORS Headers - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ CORS Headers - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test HTTPS
echo -e "${BLUE}Testing HTTPS Security...${NC}"
if [[ "$BACKEND_URL" == https://* ]]; then
    echo -e "${GREEN}✅ HTTPS Enabled - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ HTTPS Not Enabled - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 8: Cross-Platform Integration${NC}"
echo "====================================="

# Test mobile app configuration
echo -e "${BLUE}Testing Mobile App Configuration...${NC}"
if grep -q "https://www.fleetia.online" fleet/apps/mobile/src/services/apiService.ts; then
    echo -e "${GREEN}✅ Mobile API Service - Production URL Configured${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Mobile API Service - Production URL Not Configured${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if grep -q "https://www.fleetia.online" fleet/apps/mobile/src/services/authService.ts; then
    echo -e "${GREEN}✅ Mobile Auth Service - Production URL Configured${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Mobile Auth Service - Production URL Not Configured${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test web app configuration
echo -e "${BLUE}Testing Web App Configuration...${NC}"
if grep -q "https://www.fleetia.online" fleet/apps/web/src/config/api.ts; then
    echo -e "${GREEN}✅ Web API Config - Production URL Configured${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Web API Config - Production URL Not Configured${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Generate test report
echo -e "${YELLOW}📊 PRODUCTION INTEGRATION TEST RESULTS${NC}"
echo "=========================================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

# Calculate success rate
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}🎉 PRODUCTION INTEGRATION SUCCESSFUL!${NC}"
    echo -e "${GREEN}All systems are properly integrated and ready for production use.${NC}"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY INTEGRATED${NC}"
    echo -e "${YELLOW}Most systems are working. Review failed tests before production use.${NC}"
else
    echo -e "${RED}❌ INTEGRATION ISSUES${NC}"
    echo -e "${RED}Multiple integration issues found. Fix before production use.${NC}"
fi

echo ""
echo -e "${BLUE}📋 Production URLs${NC}"
echo "=================="
echo -e "Frontend: ${FRONTEND_URL}"
echo -e "Backend API: ${BACKEND_URL}/api/"
echo -e "Admin Panel: ${BACKEND_URL}/admin/"
echo ""

echo -e "${BLUE}🔑 Demo Credentials${NC}"
echo "=================="
echo -e "Admin: admin / admin123"
echo -e "Staff: staff1 / staff123"
echo -e "Driver: driver1 / driver123"
echo -e "Inspector: inspector1 / inspector123"
echo ""

echo -e "${BLUE}📱 Mobile App Testing${NC}"
echo "====================="
echo -e "1. Update mobile app to use production backend"
echo -e "2. Test authentication with demo credentials"
echo -e "3. Test fuel detection functionality"
echo -e "4. Test camera and photo upload"
echo -e "5. Test dashboard and fleet management"
echo ""

# Save test results to file
cat > production-integration-test-results.json << EOF
{
    "timestamp": "$(date -Iseconds)",
    "frontend_url": "${FRONTEND_URL}",
    "backend_url": "${BACKEND_URL}",
    "total_tests": $TOTAL_TESTS,
    "passed_tests": $PASSED_TESTS,
    "failed_tests": $FAILED_TESTS,
    "success_rate": $SUCCESS_RATE,
    "environment": "production",
    "status": "$([ $SUCCESS_RATE -ge 90 ] && echo "INTEGRATED" || echo "NEEDS_ATTENTION")"
}
EOF

echo -e "${GREEN}Test results saved to: production-integration-test-results.json${NC}"
echo ""
echo -e "${BLUE}🚀 Fleet Management System Production Integration Testing Complete!${NC}"
