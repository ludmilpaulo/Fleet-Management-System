#!/bin/bash

# Comprehensive test script for Fleet Management System
# Tests both web app APIs and verifies functionality

API_BASE_URL="http://localhost:8000/api"
WEB_BASE_URL="http://localhost:3000"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

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
        # Try to extract token from different possible formats
        token=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        if [ -z "$token" ]; then
            token=$(echo "$body" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
        fi
        if [ -z "$token" ]; then
            # Check if user object exists (session-based auth)
            user_id=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
            if [ ! -z "$user_id" ]; then
                # Return username for cookie-based auth
                echo "COOKIE_AUTH_${username}"
            fi
        else
            echo "$token"
        fi
    else
        echo ""
    fi
}

echo "============================================================"
echo "Fleet Management System - Comprehensive Test Suite"
echo "============================================================"

# Test 1: Check if servers are running
echo -e "\n🔍 Checking if servers are running..."
# Test with a simple GET request first
if curl -s -f "${API_BASE_URL}/account/users/" -o /dev/null -w "%{http_code}" 2>/dev/null | grep -q "401\|403\|200"; then
    test_result 0 "Backend server is running" "API accessible at ${API_BASE_URL}"
else
    # If that fails, try login endpoint which is public
    if curl -s -f "${API_BASE_URL}/account/login/" -o /dev/null -w "%{http_code}" 2>/dev/null | grep -q "200\|400\|405"; then
        test_result 0 "Backend server is running" "API accessible at ${API_BASE_URL}"
    else
        test_result 1 "Backend server is running" "Cannot connect to ${API_BASE_URL}"
        echo "   Please make sure the Django server is running on port 8000"
    fi
fi

if curl -s -f "${WEB_BASE_URL}" > /dev/null 2>&1; then
    test_result 0 "Web app server is running" "Web app accessible at ${WEB_BASE_URL}"
else
    test_result 1 "Web app server is running" "Cannot connect to ${WEB_BASE_URL}"
    echo "   Please make sure the Next.js server is running on port 3000"
fi

# Test 2: Authentication
echo -e "\n🔐 Testing Authentication..."

ADMIN_TOKEN=$(get_token "admin" "admin123")
if [ ! -z "$ADMIN_TOKEN" ]; then
    test_result 0 "Admin login" "Token obtained"
else
    test_result 1 "Admin login" "Failed to get token"
fi

DRIVER_TOKEN=$(get_token "driver1" "driver123")
if [ ! -z "$DRIVER_TOKEN" ]; then
    test_result 0 "Driver login" "Token obtained"
else
    test_result 1 "Driver login" "Failed to get token"
fi

STAFF_TOKEN=$(get_token "staff1" "staff123")
if [ ! -z "$STAFF_TOKEN" ]; then
    test_result 0 "Staff login" "Token obtained"
else
    test_result 1 "Staff login" "Failed to get token"
fi

INSPECTOR_TOKEN=$(get_token "inspector1" "inspector123")
if [ ! -z "$INSPECTOR_TOKEN" ]; then
    test_result 0 "Inspector login" "Token obtained"
else
    test_result 1 "Inspector login" "Failed to get token"
fi

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "\n${RED}⚠️  Warning: Cannot continue with API tests without admin token${NC}"
    exit 1
fi

# Test 3: User Management
echo -e "\n👥 Testing User Management..."

if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
    # Cookie-based auth - login first to get cookies
    cookie_jar=$(mktemp)
    curl -s -c "$cookie_jar" -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > /dev/null
    
    response=$(curl -s -w "\n%{http_code}" -b "$cookie_jar" \
        "${API_BASE_URL}/account/users/")
    AUTH_HEADER=""
else
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
        "${API_BASE_URL}/account/users/")
    AUTH_HEADER="Authorization: Token ${ADMIN_TOKEN}"
fi

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    user_count=$(echo "$response" | sed '$d' | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
    test_result 0 "List users" "Found users"
else
    test_result 1 "List users" "HTTP $http_code"
fi

# Test 4: Vehicle Management
echo -e "\n🚗 Testing Vehicle Management..."

if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
    cookie_jar=$(mktemp)
    curl -s -c "$cookie_jar" -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > /dev/null
    response=$(curl -s -w "\n%{http_code}" -b "$cookie_jar" \
        "${API_BASE_URL}/fleet/vehicles/")
    AUTH_FLAG="-b $cookie_jar"
else
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
        "${API_BASE_URL}/fleet/vehicles/")
    AUTH_FLAG="-H \"Authorization: Token ${ADMIN_TOKEN}\""
fi

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    vehicle_count=$(echo "$response" | sed '$d' | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
    test_result 0 "List vehicles" "Found vehicles"
    
    # Try to create a vehicle (using short timestamp to fit 16 char limit)
    timestamp=$(date +%s | tail -c 6)
    vehicle_data='{"reg_number":"TST-'"${timestamp}"'","make":"Toyota","model":"Hiace","year":2024,"color":"White","status":"ACTIVE","mileage":0,"fuel_type":"PETROL","transmission":"MANUAL"}'
    if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
        create_response=$(curl -s -w "\n%{http_code}" -X POST -b "$cookie_jar" \
            -H "Content-Type: application/json" \
            -d "$vehicle_data" \
            "${API_BASE_URL}/fleet/vehicles/")
    else
        create_response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Token ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$vehicle_data" \
            "${API_BASE_URL}/fleet/vehicles/")
    fi
    create_http_code=$(echo "$create_response" | tail -n1)
    if [ "$create_http_code" = "201" ] || [ "$create_http_code" = "200" ]; then
        test_result 0 "Create vehicle" "Vehicle created successfully"
    else
        error_msg=$(echo "$create_response" | sed '$d' | head -c 100)
        test_result 1 "Create vehicle" "HTTP $create_http_code: $error_msg"
    fi
else
    test_result 1 "List vehicles" "HTTP $http_code"
fi

# Test 5: Shift Management
echo -e "\n⏰ Testing Shift Management..."

if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
    cookie_jar=$(mktemp)
    curl -s -c "$cookie_jar" -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > /dev/null
    response=$(curl -s -w "\n%{http_code}" -b "$cookie_jar" \
        "${API_BASE_URL}/fleet/shifts/")
else
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
        "${API_BASE_URL}/fleet/shifts/")
fi

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "List shifts" "Found shifts"
else
    test_result 1 "List shifts" "HTTP $http_code"
fi

# Test 6: Ticket Management
echo -e "\n🎫 Testing Ticket Management..."

if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
    cookie_jar=$(mktemp)
    curl -s -c "$cookie_jar" -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > /dev/null
    response=$(curl -s -w "\n%{http_code}" -b "$cookie_jar" \
        "${API_BASE_URL}/tickets/tickets/")
else
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
        "${API_BASE_URL}/tickets/tickets/")
fi

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "List tickets" "Found tickets"
else
    test_result 1 "List tickets" "HTTP $http_code"
fi

# Test 7: Inspection Management
echo -e "\n🔍 Testing Inspection Management..."

if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
    cookie_jar=$(mktemp)
    curl -s -c "$cookie_jar" -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > /dev/null
    response=$(curl -s -w "\n%{http_code}" -b "$cookie_jar" \
        "${API_BASE_URL}/inspections/inspections/")
else
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
        "${API_BASE_URL}/inspections/inspections/")
fi

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "List inspections" "Found inspections"
else
    test_result 1 "List inspections" "HTTP $http_code"
fi

# Test 8: Dashboard Stats
echo -e "\n📊 Testing Dashboard Stats..."

if [[ "$ADMIN_TOKEN" == COOKIE_AUTH_* ]]; then
    cookie_jar=$(mktemp)
    curl -s -c "$cookie_jar" -X POST "${API_BASE_URL}/account/login/" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > /dev/null
    response=$(curl -s -w "\n%{http_code}" -b "$cookie_jar" \
        "${API_BASE_URL}/fleet/stats/dashboard/")
else
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Token ${ADMIN_TOKEN}" \
        "${API_BASE_URL}/fleet/stats/dashboard/")
fi

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "Get dashboard stats" "Stats retrieved"
else
    test_result 1 "Get dashboard stats" "HTTP $http_code"
fi

# Test 9: Web App Pages
echo -e "\n🌐 Testing Web App Pages..."

response=$(curl -s -w "\n%{http_code}" "${WEB_BASE_URL}/auth/signin")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "Sign in page" "Page loads"
else
    test_result 1 "Sign in page" "HTTP $http_code"
fi

response=$(curl -s -w "\n%{http_code}" "${WEB_BASE_URL}/auth/signup")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    test_result 0 "Sign up page" "Page loads"
else
    test_result 1 "Sign up page" "HTTP $http_code"
fi

# Summary
echo -e "\n============================================================"
echo "Test Summary"
echo "============================================================"
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "Success Rate: ${SUCCESS_RATE}%"
fi

echo -e "\n${YELLOW}📝 Test Credentials:${NC}"
echo "  Admin: admin / admin123"
echo "  Driver: driver1 / driver123"
echo "  Staff: staff1 / staff123"
echo "  Inspector: inspector1 / inspector123"

echo -e "\n${YELLOW}🌐 Test URLs:${NC}"
echo "  Web App: ${WEB_BASE_URL}"
echo "  API: ${API_BASE_URL}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi

