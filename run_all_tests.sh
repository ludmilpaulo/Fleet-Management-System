#!/bin/bash
# Comprehensive Test Runner for Day-to-Day Operations
# Tests Web, Mobile, and Backend operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
BACKEND_DIR="fleet/apps/backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="test_results_${TIMESTAMP}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FLEET MANAGEMENT SYSTEM TEST SUITE${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Configuration:"
echo "  API URL: $API_URL"
echo "  Web URL: $WEB_URL"
echo "  Results: $RESULTS_DIR"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to check if service is running
check_service() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Checking $name...${NC}"
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is not running at $url${NC}"
        return 1
    fi
}

# Check services
echo -e "${BLUE}Checking Services...${NC}"
BACKEND_OK=false
WEB_OK=false

if check_service "$API_URL/api/account/login/" "Backend API"; then
    BACKEND_OK=true
fi

if check_service "$WEB_URL" "Web Application"; then
    WEB_OK=true
fi

echo ""

# Run Backend API Tests
if [ "$BACKEND_OK" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  RUNNING BACKEND API TESTS${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    cd "$BACKEND_DIR"
    python3 ../../test_day_to_day_operations.py --api-url "$API_URL" 2>&1 | tee "../../$RESULTS_DIR/backend_tests.log"
    cd - > /dev/null
    
    # Move result files (from project root)
    mv test_results_*.json "$RESULTS_DIR/" 2>/dev/null || true
    echo ""
else
    echo -e "${RED}Skipping backend tests - API not available${NC}"
    echo ""
fi

# Run Mobile Tests
if [ "$BACKEND_OK" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  RUNNING MOBILE APPLICATION TESTS${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    API_URL="$API_URL" node test_mobile_operations.js 2>&1 | tee "$RESULTS_DIR/mobile_tests.log"
    
    # Move result files
    mv mobile_test_results_*.json "$RESULTS_DIR/" 2>/dev/null || true
    echo ""
else
    echo -e "${RED}Skipping mobile tests - API not available${NC}"
    echo ""
fi

# Run Web Tests
if [ "$WEB_OK" = true ] && [ "$BACKEND_OK" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  RUNNING WEB APPLICATION TESTS${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Check if Playwright is installed
    if command -v npx &> /dev/null; then
        WEB_URL="$WEB_URL" API_URL="$API_URL" node test_web_operations.js 2>&1 | tee "$RESULTS_DIR/web_tests.log"
        
        # Move result files
        mv web_test_results_*.json "$RESULTS_DIR/" 2>/dev/null || true
    else
        echo -e "${YELLOW}Playwright not found. Installing...${NC}"
        npm install playwright 2>&1 | tee "$RESULTS_DIR/playwright_install.log"
        
        WEB_URL="$WEB_URL" API_URL="$API_URL" node test_web_operations.js 2>&1 | tee "$RESULTS_DIR/web_tests.log"
        
        # Move result files
        mv web_test_results_*.json "$RESULTS_DIR/" 2>/dev/null || true
    fi
    echo ""
else
    echo -e "${RED}Skipping web tests - Web app or API not available${NC}"
    echo ""
fi

# Generate Summary Report
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

SUMMARY_FILE="$RESULTS_DIR/summary.txt"
{
    echo "Fleet Management System - Test Summary"
    echo "Generated: $(date)"
    echo ""
    echo "Configuration:"
    echo "  API URL: $API_URL"
    echo "  Web URL: $WEB_URL"
    echo ""
    echo "Test Results:"
    
    # Count results from JSON files
    if [ -f "$RESULTS_DIR/backend_tests.log" ]; then
        echo ""
        echo "Backend Tests:"
        grep -E "(Total Tests|Passed|Failed|Success Rate)" "$RESULTS_DIR/backend_tests.log" || echo "  No summary found"
    fi
    
    if [ -f "$RESULTS_DIR/mobile_tests.log" ]; then
        echo ""
        echo "Mobile Tests:"
        grep -E "(Total Tests|Passed|Failed|Success Rate)" "$RESULTS_DIR/mobile_tests.log" || echo "  No summary found"
    fi
    
    if [ -f "$RESULTS_DIR/web_tests.log" ]; then
        echo ""
        echo "Web Tests:"
        grep -E "(Total Tests|Passed|Failed|Success Rate)" "$RESULTS_DIR/web_tests.log" || echo "  No summary found"
    fi
    
} > "$SUMMARY_FILE"

cat "$SUMMARY_FILE"
echo ""
echo -e "${GREEN}All test results saved to: $RESULTS_DIR${NC}"
echo ""

