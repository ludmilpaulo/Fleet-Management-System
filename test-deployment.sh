#!/bin/bash

# Fleet Management System - Deployment Testing Script
# This script tests the backend connection and verifies deployment readiness

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          Fleet Management System - Deployment Test Suite                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="https://taki.pythonanywhere.com"

echo "Testing Backend: $BACKEND_URL"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Test 1: Backend Connectivity
echo "Test 1: Backend Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $BACKEND_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Backend is accessible (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "400" ]; then
        echo -e "${YELLOW}⚠️  WARNING${NC} - Backend responding but needs ALLOWED_HOSTS update (HTTP $HTTP_CODE)"
        echo "   Action: Update ALLOWED_HOSTS in Django settings"
    else
        echo -e "${YELLOW}⚠️  WARNING${NC} - Backend responding with HTTP $HTTP_CODE"
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Cannot connect to backend"
    echo "   Check if backend is running"
fi
echo ""

# Test 2: API Endpoint
echo "Test 2: API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $BACKEND_URL/api/ 2>/dev/null)
if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
    echo -e "${GREEN}✅ PASS${NC} - API endpoint accessible (HTTP $API_CODE)"
elif [ "$API_CODE" = "400" ]; then
    echo -e "${YELLOW}⚠️  WARNING${NC} - API endpoint needs configuration (HTTP $API_CODE)"
    echo "   Action: Update ALLOWED_HOSTS in Django settings"
else
    echo -e "${RED}❌ FAIL${NC} - API endpoint not accessible (HTTP $API_CODE)"
fi
echo ""

# Test 3: Companies Endpoint
echo "Test 3: Companies Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
COMPANIES_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $BACKEND_URL/api/companies/companies/ 2>/dev/null)
if [ "$COMPANIES_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Companies endpoint working (HTTP $COMPANIES_CODE)"
elif [ "$COMPANIES_CODE" = "400" ] || [ "$COMPANIES_CODE" = "500" ]; then
    echo -e "${YELLOW}⚠️  WARNING${NC} - Companies endpoint needs configuration (HTTP $COMPANIES_CODE)"
    echo "   Action: Update ALLOWED_HOSTS and run migrations"
else
    echo -e "${RED}❌ FAIL${NC} - Companies endpoint error (HTTP $COMPANIES_CODE)"
fi
echo ""

# Test 4: SSL Certificate
echo "Test 4: SSL Certificate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SSL_CHECK=$(echo | openssl s_client -servername taki.pythonanywhere.com -connect taki.pythonanywhere.com:443 2>/dev/null | grep "Verify return code: 0")
if [ ! -z "$SSL_CHECK" ]; then
    echo -e "${GREEN}✅ PASS${NC} - SSL certificate valid"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - SSL certificate check inconclusive"
fi
echo ""

# Test 5: Response Time
echo "Test 5: Response Time"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 $BACKEND_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Response time: ${RESPONSE_TIME}s"
    # Check if response time is acceptable (under 3 seconds)
    if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
        echo "   Performance: Good"
    else
        echo "   Performance: Could be better"
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Timeout or connection error"
fi
echo ""

# Test 6: Git Status
echo "Test 6: Git Repository Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if git status > /dev/null 2>&1; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    COMMIT=$(git rev-parse --short HEAD)
    echo -e "${GREEN}✅ PASS${NC} - Git repository healthy"
    echo "   Branch: $BRANCH"
    echo "   Commit: $COMMIT"
    
    # Check if there are uncommitted changes
    if git diff-index --quiet HEAD --; then
        echo "   Working tree: Clean"
    else
        echo -e "   ${YELLOW}⚠️  Working tree: Has uncommitted changes${NC}"
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Not a git repository"
fi
echo ""

# Test 7: Frontend Build Files
echo "Test 7: Frontend Build Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "fleet/apps/web/.next" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Frontend build exists"
    BUILD_SIZE=$(du -sh fleet/apps/web/.next 2>/dev/null | cut -f1)
    echo "   Build size: $BUILD_SIZE"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Frontend not built"
    echo "   Run: cd fleet/apps/web && yarn build"
fi
echo ""

# Test 8: Environment Variables
echo "Test 8: Environment Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "fleet/apps/web/.env.local" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Web .env.local exists"
    if grep -q "NEXT_PUBLIC_API_URL" fleet/apps/web/.env.local 2>/dev/null; then
        echo "   API URL configured"
    fi
    if grep -q "NEXT_PUBLIC_MIXPANEL_TOKEN" fleet/apps/web/.env.local 2>/dev/null; then
        echo "   Mixpanel token configured"
    fi
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Web .env.local not found"
    echo "   Environment variables should be set in Vercel"
fi
echo ""

# Test 9: Mobile Configuration
echo "Test 9: Mobile App Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "taki.pythonanywhere.com" fleet/apps/mobile/src/services/api.ts 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC} - Mobile API URL configured"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Mobile API URL not updated"
fi
echo ""

# Test 10: Documentation
echo "Test 10: Documentation Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
DOC_COUNT=0
TOTAL_DOCS=4

[ -f "DEPLOYMENT_GUIDE.md" ] && ((DOC_COUNT++))
[ -f "PRODUCTION_DEPLOYMENT_STATUS.md" ] && ((DOC_COUNT++))
[ -f "QUICK_DEPLOY.md" ] && ((DOC_COUNT++))
[ -f "README.md" ] && ((DOC_COUNT++))

if [ $DOC_COUNT -eq $TOTAL_DOCS ]; then
    echo -e "${GREEN}✅ PASS${NC} - All deployment documentation present ($DOC_COUNT/$TOTAL_DOCS)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Some documentation missing ($DOC_COUNT/$TOTAL_DOCS)"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${YELLOW}⚠️  Backend Needs Configuration${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. SSH to PythonAnywhere bash console"
    echo "2. cd /home/taki/Fleet-Management-System"
    echo "3. git pull origin main"
    echo "4. Update ALLOWED_HOSTS in backend/backend/settings.py"
    echo "5. Reload web app from PythonAnywhere dashboard"
    echo ""
    echo "See QUICK_DEPLOY.md for detailed instructions"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is Ready!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Deploy frontend to Vercel (see QUICK_DEPLOY.md)"
    echo "2. Build mobile apps with EAS"
    echo "3. Test all features in production"
else
    echo -e "${RED}❌ Backend Connection Issues${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Verify backend is running on PythonAnywhere"
    echo "2. Check PythonAnywhere logs for errors"
    echo "3. Verify database migrations are complete"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📚 Documentation:"
echo "   • QUICK_DEPLOY.md - Fast deployment (22 minutes)"
echo "   • DEPLOYMENT_GUIDE.md - Complete guide"
echo "   • PRODUCTION_DEPLOYMENT_STATUS.md - Current status"
echo ""
echo "🔗 Links:"
echo "   • GitHub: https://github.com/ludmilpaulo/Fleet-Management-System"
echo "   • Backend: https://taki.pythonanywhere.com"
echo "   • Vercel: https://vercel.com"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Test completed at $(date)"
echo ""

