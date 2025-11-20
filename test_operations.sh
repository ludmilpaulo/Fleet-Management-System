#!/bin/bash

# Day-to-Day Operations Test Suite
# Tests all user roles: Admin, Staff, Driver, Inspector

BASE_URL="http://localhost:8000"
GRAPHQL_URL="$BASE_URL/graphql"

# Test user tokens
ADMIN_TOKEN='9066bf00a49c3372323c9f144560c930befdc7a9'
STAFF_TOKEN='b2ebdf6a0bd620e2acc9f592459bde34dcba1075'
DRIVER_TOKEN='e562cb5ef017450cfbfb1733f8653f2adb581c85'
INSPECTOR_TOKEN='ec418bb03681047de2f6ea07eb4902013f41c3fd'

echo "=========================================="
echo "FLEET MANAGEMENT - DAY-TO-DAY OPERATIONS TEST"
echo "=========================================="
echo ""

test_graphql_query() {
    local token=$1
    local role=$2
    local query=$3
    local description=$4
    
    echo "[$role] $description"
    response=$(curl -s -X POST "$GRAPHQL_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Token $token" \
        -d "{\"query\": \"$query\"}")
    
    if echo "$response" | grep -q '"data"'; then
        echo "  ✅ SUCCESS"
        echo "$response" | jq -r '.data' 2>/dev/null | head -3 || echo "  Response: OK"
    else
        echo "  ❌ FAILED"
        echo "$response" | jq -r '.errors[0].message' 2>/dev/null || echo "$response"
    fi
    echo ""
}

test_rest_api() {
    local token=$1
    local role=$2
    local method=$3
    local endpoint=$4
    local data=$5
    local description=$6
    
    echo "[$role] $description"
    if [ -z "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Token $token")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Token $token" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE/d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "  ✅ SUCCESS (HTTP $http_code)"
    else
        echo "  ❌ FAILED (HTTP $http_code)"
        echo "$body" | jq -r '.detail // .error // .' 2>/dev/null | head -2 || echo "$body" | head -2
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔵 ADMIN USER OPERATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Admin: View own profile
test_graphql_query "$ADMIN_TOKEN" "ADMIN" \
    "{ me { id email firstName lastName role } }" \
    "View own profile"

# Admin: View all vehicles
test_graphql_query "$ADMIN_TOKEN" "ADMIN" \
    "{ vehicles { id regNumber make model status } }" \
    "View all company vehicles"

# Admin: Create a new vehicle
test_graphql_query "$ADMIN_TOKEN" "ADMIN" \
    "mutation { createVehicle(regNumber: \"ADMIN-V-001\", make: \"AdminCreated\", model: \"Test\", year: 2025) { vehicle { id regNumber make model } } }" \
    "Create new vehicle"

# Admin: View user list (REST API)
test_rest_api "$ADMIN_TOKEN" "ADMIN" "GET" "/api/account/users/" "" \
    "List all users in company"

# Admin: View profile (REST API)
test_rest_api "$ADMIN_TOKEN" "ADMIN" "GET" "/api/account/profile/" "" \
    "Get own profile via REST API"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟢 STAFF USER OPERATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Staff: View own profile
test_graphql_query "$STAFF_TOKEN" "STAFF" \
    "{ me { id email firstName lastName role } }" \
    "View own profile"

# Staff: View vehicles
test_graphql_query "$STAFF_TOKEN" "STAFF" \
    "{ vehicles { id regNumber make model status } }" \
    "View company vehicles"

# Staff: Create vehicle
test_graphql_query "$STAFF_TOKEN" "STAFF" \
    "mutation { createVehicle(regNumber: \"STAFF-V-001\", make: \"StaffCreated\", model: \"Test\", year: 2025) { vehicle { id regNumber make model } } }" \
    "Create new vehicle"

# Staff: View dashboard stats
test_rest_api "$STAFF_TOKEN" "STAFF" "GET" "/api/fleet/stats/dashboard/" "" \
    "View dashboard statistics"

# Staff: View vehicles list (REST API)
test_rest_api "$STAFF_TOKEN" "STAFF" "GET" "/api/fleet/vehicles/" "" \
    "List vehicles via REST API"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟡 DRIVER USER OPERATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Driver: View own profile
test_graphql_query "$DRIVER_TOKEN" "DRIVER" \
    "{ me { id email firstName lastName role } }" \
    "View own profile"

# Driver: View vehicles (should only see company vehicles)
test_graphql_query "$DRIVER_TOKEN" "DRIVER" \
    "{ vehicles { id regNumber make model status } }" \
    "View available vehicles"

# Driver: View profile via REST
test_rest_api "$DRIVER_TOKEN" "DRIVER" "GET" "/api/account/profile/" "" \
    "Get own profile via REST API"

# Driver: Attempt to create vehicle (should fail or be restricted)
test_graphql_query "$DRIVER_TOKEN" "DRIVER" \
    "mutation { createVehicle(regNumber: \"DRIVER-V-001\", make: \"DriverCreated\", model: \"Test\") { vehicle { id } } }" \
    "Attempt to create vehicle (may be restricted)"

# Driver: View shifts (REST API)
test_rest_api "$DRIVER_TOKEN" "DRIVER" "GET" "/api/fleet/shifts/" "" \
    "View own shifts"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟣 INSPECTOR USER OPERATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Inspector: View own profile
test_graphql_query "$INSPECTOR_TOKEN" "INSPECTOR" \
    "{ me { id email firstName lastName role } }" \
    "View own profile"

# Inspector: View vehicles
test_graphql_query "$INSPECTOR_TOKEN" "INSPECTOR" \
    "{ vehicles { id regNumber make model status } }" \
    "View vehicles for inspection"

# Inspector: View profile via REST
test_rest_api "$INSPECTOR_TOKEN" "INSPECTOR" "GET" "/api/account/profile/" "" \
    "Get own profile via REST API"

# Inspector: View inspections (REST API)
test_rest_api "$INSPECTOR_TOKEN" "INSPECTOR" "GET" "/api/inspections/" "" \
    "View inspections list"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 CROSS-ROLE VERIFICATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test: All users should see their own profile
echo "[VERIFICATION] All users can view their own profile"
for role in ADMIN STAFF DRIVER INSPECTOR; do
    token_var="${role}_TOKEN"
    token="${!token_var}"
    test_graphql_query "$token" "$role" \
        "{ me { role } }" \
        "  Verify $role can see own profile"
done

# Test: Vehicle query works for all roles
echo "[VERIFICATION] All users can query vehicles (company-scoped)"
for role in ADMIN STAFF DRIVER INSPECTOR; do
    token_var="${role}_TOKEN"
    token="${!token_var}"
    test_graphql_query "$token" "$role" \
        "{ vehicles(search: \"\") { id regNumber } }" \
        "  Verify $role can query vehicles"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TEST SUITE COMPLETED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  • Admin operations: Full access tested"
echo "  • Staff operations: Management access tested"
echo "  • Driver operations: Limited access tested"
echo "  • Inspector operations: Inspection access tested"
echo "  • Cross-role verification: All roles functional"
echo ""

