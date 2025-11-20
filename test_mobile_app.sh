#!/bin/bash

# Comprehensive Mobile App Testing Script
# Tests mobile app connectivity and API endpoints

API_BASE_URL="http://localhost:8000/api"
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
MOBILE_API_URL="http://${LOCAL_IP}:8000/api"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        if [ ! -z "$3" ]; then
            echo "   $3"
        fi
        ((FAILED++))
    fi
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

echo "============================================================"
echo "Fleet Management System - Mobile App Testing"
echo "============================================================"

# Get authentication token
get_token() {
    local username=$1
    local password=$2
    response=$(curl -s -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"${username}\",\"password\":\"${password}\"}" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        token=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo "$token"
    else
        echo ""
    fi
}

# Test 1: Check if backend is accessible from network
echo -e "\n🌐 Testing Network Configuration..."

info "Your local IP address: ${LOCAL_IP}"

# Test localhost access
if curl -s -f "${API_BASE_URL}/account/login/" -o /dev/null -w "%{http_code}" 2>/dev/null | grep -q "200\|400\|405"; then
    test_result 0 "Backend accessible via localhost" "API is running"
else
    test_result 1 "Backend accessible via localhost" "Cannot connect - start backend server"
fi

# Test network IP access
if curl -s -f "${MOBILE_API_URL}/account/login/" -o /dev/null -w "%{http_code}" 2>/dev/null | grep -q "200\|400\|405"; then
    test_result 0 "Backend accessible via network IP" "Mobile devices can connect"
else
    warning "Backend not accessible via network IP: ${MOBILE_API_URL}"
    info "For physical device testing, ensure backend is accessible on network"
    info "Or use Expo tunnel: expo start --tunnel"
fi

# Test 2: Authentication Endpoints
echo -e "\n🔐 Testing Authentication Endpoints..."

ADMIN_TOKEN=$(get_token "admin" "admin123")
if [ ! -z "$ADMIN_TOKEN" ]; then
    test_result 0 "Admin authentication" "Token obtained"
else
    test_result 1 "Admin authentication" "Failed to get token"
fi

DRIVER_TOKEN=$(get_token "driver1" "driver123")
if [ ! -z "$DRIVER_TOKEN" ]; then
    test_result 0 "Driver authentication" "Token obtained"
else
    test_result 1 "Driver authentication" "Failed to get token"
fi

STAFF_TOKEN=$(get_token "staff1" "staff123")
if [ ! -z "$STAFF_TOKEN" ]; then
    test_result 0 "Staff authentication" "Token obtained"
else
    test_result 1 "Staff authentication" "Failed to get token"
fi

INSPECTOR_TOKEN=$(get_token "inspector1" "inspector123")
if [ ! -z "$INSPECTOR_TOKEN" ]; then
    test_result 0 "Inspector authentication" "Token obtained"
else
    test_result 1 "Inspector authentication" "Failed to get token"
fi

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "\n${RED}⚠️  Cannot continue API tests without admin token${NC}"
    exit 1
fi

# Test 3: Mobile App API Endpoints
echo -e "\n📱 Testing Mobile App API Endpoints..."

# Vehicles
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
    "${API_BASE_URL}/fleet/vehicles/")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    vehicle_count=$(echo "$response" | sed '$d' | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
    test_result 0 "Get vehicles" "Found ${vehicle_count} vehicles"
else
    test_result 1 "Get vehicles" "HTTP $http_code"
fi

# Shifts
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${DRIVER_TOKEN}" \
    "${API_BASE_URL}/fleet/shifts/")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "Get shifts (Driver)" "Shifts endpoint accessible"
else
    test_result 1 "Get shifts (Driver)" "HTTP $http_code"
fi

# Inspections
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${INSPECTOR_TOKEN}" \
    "${API_BASE_URL}/inspections/inspections/")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "Get inspections (Inspector)" "Inspections endpoint accessible"
else
    test_result 1 "Get inspections (Inspector)" "HTTP $http_code"
fi

# Dashboard Stats
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
    "${API_BASE_URL}/fleet/stats/dashboard/")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "Get dashboard stats" "Stats endpoint accessible"
else
    test_result 1 "Get dashboard stats" "HTTP $http_code"
fi

# Test 4: Mobile App Configuration
echo -e "\n⚙️  Checking Mobile App Configuration..."

if [ -f "fleet/apps/mobile/package.json" ]; then
    test_result 0 "Mobile app package.json exists"
    
    # Check if node_modules exists
    if [ -d "fleet/apps/mobile/node_modules" ]; then
        test_result 0 "Dependencies installed" "node_modules exists"
    else
        warning "Dependencies not installed - run: cd fleet/apps/mobile && npm install"
    fi
else
    test_result 1 "Mobile app package.json exists" "File not found"
fi

# Check API configuration
if grep -q "localhost" "fleet/apps/mobile/src/services/authService.ts" 2>/dev/null; then
    warning "API URL uses localhost - will not work on physical devices"
    info "Update API URL to: http://${LOCAL_IP}:8000/api for physical device testing"
    info "Or use environment variable: EXPO_PUBLIC_API_URL"
fi

# Test 5: Expo Setup
echo -e "\n📦 Checking Expo Setup..."

if command -v expo &> /dev/null; then
    test_result 0 "Expo CLI installed" "$(expo --version 2>/dev/null | head -1)"
else
    warning "Expo CLI not installed - run: npm install -g expo-cli"
fi

if [ -f "fleet/apps/mobile/app.json" ]; then
    test_result 0 "Expo app.json exists"
else
    test_result 1 "Expo app.json exists" "File not found"
fi

# Summary
echo -e "\n============================================================"
echo "Test Summary"
echo "============================================================"
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi

if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "Success Rate: ${SUCCESS_RATE}%"
fi

echo -e "\n${YELLOW}📝 Mobile App Testing Credentials:${NC}"
echo "  Admin: admin / admin123"
echo "  Driver: driver1 / driver123"
echo "  Staff: staff1 / staff123"
echo "  Inspector: inspector1 / inspector123"

echo -e "\n${YELLOW}🌐 API URLs:${NC}"
echo "  Localhost: ${API_BASE_URL}"
echo "  Network: ${MOBILE_API_URL}"

echo -e "\n${YELLOW}🚀 To Test Mobile App:${NC}"
echo "  1. cd fleet/apps/mobile"
echo "  2. npm install (if not done)"
echo "  3. Update API URL in src/services/authService.ts to: ${MOBILE_API_URL}"
echo "  4. Or set environment variable: export EXPO_PUBLIC_API_URL=${MOBILE_API_URL}"
echo "  5. npm start"
echo "  6. Scan QR code with Expo Go app (iOS/Android)"
echo "  7. Test login with credentials above"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All critical tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi

