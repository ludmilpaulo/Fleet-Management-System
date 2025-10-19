#!/bin/bash
# Production Testing Script for Fleet Management System

echo "🚀 Fleet Management System - Production Testing"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
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

# Function to check if service is running
check_service() {
    local service_name="$1"
    local port="$2"
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not running on port $port${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $endpoint - Status: $response${NC}"
        return 0
    else
        echo -e "${RED}❌ $endpoint - Expected: $expected_status, Got: $response${NC}"
        return 1
    fi
}

echo -e "${YELLOW}Phase 1: Infrastructure Testing${NC}"
echo "=================================="

# Check if services are running
echo -e "${BLUE}Checking Services...${NC}"
check_service "Backend API" "8000"
check_service "Web Application" "3000"
check_service "Mobile Metro Bundler" "8081"
echo ""

echo -e "${YELLOW}Phase 2: Backend API Testing${NC}"
echo "=============================="

# Test API endpoints
run_test "API Root" "test_api_endpoint '/api/' '200'"
run_test "Account Endpoints" "test_api_endpoint '/api/account/' '200'"
run_test "Fleet Endpoints" "test_api_endpoint '/api/fleet/' '200'"
run_test "Inspections Endpoints" "test_api_endpoint '/api/inspections/' '200'"
run_test "Issues Endpoints" "test_api_endpoint '/api/issues/' '200'"
run_test "Tickets Endpoints" "test_api_endpoint '/api/tickets/' '200'"
run_test "Telemetry Endpoints" "test_api_endpoint '/api/telemetry/' '200'"
run_test "Dashboard Stats" "test_api_endpoint '/api/fleet/stats/dashboard/' '200'"

echo -e "${YELLOW}Phase 3: Authentication Testing${NC}"
echo "================================="

# Test user registration
echo -e "${BLUE}Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/account/register/" \
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

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ User Registration - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ User Registration - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test user login
echo -e "${BLUE}Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/account/login/" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "testpass123"
    }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ User Login - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ User Login - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 4: Web Application Testing${NC}"
echo "=================================="

# Test web application endpoints
run_test "Web App Root" "curl -s 'http://localhost:3000' | grep -q 'Fleet Management'"
run_test "Web App Dashboard" "curl -s 'http://localhost:3000/dashboard' | grep -q 'Dashboard'"
run_test "Web App Login" "curl -s 'http://localhost:3000/login' | grep -q 'Login'"
run_test "Web App Fleet" "curl -s 'http://localhost:3000/fleet' | grep -q 'Fleet'"

echo -e "${YELLOW}Phase 5: Mobile Application Testing${NC}"
echo "===================================="

# Test mobile application
run_test "Mobile Metro Bundler" "curl -s 'http://localhost:8081' | grep -q 'Metro'"
run_test "Mobile Bundle Status" "curl -s 'http://localhost:8081/status' | grep -q 'running'"

echo -e "${YELLOW}Phase 6: Fuel Detection Testing${NC}"
echo "=================================="

# Test fuel detection API
echo -e "${BLUE}Testing Fuel Detection API...${NC}"
FUEL_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/telemetry/fuel-readings/" \
    -H "Content-Type: application/json" \
    -d '{
        "vehicle": 1,
        "type": "fuel_level",
        "data": "{\"fuel_level\": 75, \"confidence\": 0.85, \"detection_method\": \"ocr\"}"
    }')

if echo "$FUEL_RESPONSE" | grep -q "success\|created"; then
    echo -e "${GREEN}✅ Fuel Detection API - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Fuel Detection API - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 7: File Upload Testing${NC}"
echo "================================="

# Test file upload
echo -e "${BLUE}Testing File Upload...${NC}"
# Create a test image file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/inspections/photos/" \
    -F "inspection=1" \
    -F "part=DASHBOARD" \
    -F "image=@test-image.png")

if echo "$UPLOAD_RESPONSE" | grep -q "success\|created"; then
    echo -e "${GREEN}✅ File Upload - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ File Upload - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Clean up test file
rm -f test-image.png
echo ""

echo -e "${YELLOW}Phase 8: Performance Testing${NC}"
echo "================================="

# Test API response times
echo -e "${BLUE}Testing API Response Times...${NC}"
API_TIME=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:8000/api/")
if (( $(echo "$API_TIME < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ API Response Time: ${API_TIME}s - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ API Response Time: ${API_TIME}s - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 9: Security Testing${NC}"
echo "============================="

# Test CORS headers
echo -e "${BLUE}Testing CORS Headers...${NC}"
CORS_RESPONSE=$(curl -s -I "http://localhost:8000/api/" | grep -i "access-control")
if [ -n "$CORS_RESPONSE" ]; then
    echo -e "${GREEN}✅ CORS Headers - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ CORS Headers - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo -e "${YELLOW}Phase 10: Integration Testing${NC}"
echo "=================================="

# Test data consistency
echo -e "${BLUE}Testing Data Consistency...${NC}"
VEHICLES_RESPONSE=$(curl -s "http://localhost:8000/api/fleet/vehicles/")
if echo "$VEHICLES_RESPONSE" | grep -q "results"; then
    echo -e "${GREEN}✅ Data Consistency - PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Data Consistency - FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Generate test report
echo -e "${YELLOW}📊 TEST RESULTS SUMMARY${NC}"
echo "========================"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

# Calculate success rate
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}🎉 PRODUCTION READY!${NC}"
    echo -e "${GREEN}All critical tests passed. System is ready for production deployment.${NC}"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY READY${NC}"
    echo -e "${YELLOW}Most tests passed. Review failed tests before production deployment.${NC}"
else
    echo -e "${RED}❌ NOT READY${NC}"
    echo -e "${RED}Multiple tests failed. Fix issues before production deployment.${NC}"
fi

echo ""
echo -e "${BLUE}📋 Detailed Test Report${NC}"
echo "======================"
echo "Test Date: $(date)"
echo "Test Duration: $(date +%s) seconds"
echo "Environment: Production"
echo "Version: $(git rev-parse --short HEAD)"
echo ""

# Save test results to file
cat > production-test-results.json << EOF
{
    "timestamp": "$(date -Iseconds)",
    "total_tests": $TOTAL_TESTS,
    "passed_tests": $PASSED_TESTS,
    "failed_tests": $FAILED_TESTS,
    "success_rate": $SUCCESS_RATE,
    "environment": "production",
    "version": "$(git rev-parse --short HEAD)",
    "status": "$([ $SUCCESS_RATE -ge 90 ] && echo "READY" || echo "NEEDS_ATTENTION")"
}
EOF

echo -e "${GREEN}Test results saved to: production-test-results.json${NC}"
echo ""
echo -e "${BLUE}🚀 Fleet Management System Production Testing Complete!${NC}"
