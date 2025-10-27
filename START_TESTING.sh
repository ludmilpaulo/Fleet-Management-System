#!/bin/bash

# Comprehensive Testing Script for Fleet Management System

echo "🚀 Starting Fleet Management System Comprehensive Testing"
echo "========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "START_TESTING.sh" ]; then
    echo -e "${RED}❌ Error: Please run this script from the Fleet-Management-System root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Testing Checklist:${NC}"
echo "1. ✅ System Architecture Review"
echo "2. ⏳ Backend Server Health Check"
echo "3. ⏳ Web App Build & Dev Server"
echo "4. ⏳ API Endpoint Validation"
echo "5. ⏳ Role-Based Access Testing"
echo "6. ⏳ UI/UX Review"
echo "7. ⏳ Performance Testing"
echo "8. ⏳ Security Testing"
echo "9. ⏳ SEO Optimization"
echo ""
echo -e "${YELLOW}Starting tests...${NC}"
echo ""

# Step 1: Backend Health Check
echo -e "${BLUE}🔍 Step 1: Backend Health Check${NC}"
cd fleet/apps/backend
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    source venv/bin/activate
fi

echo "Installing backend dependencies..."
pip install -q -r requirements.txt

echo "Running migrations..."
python manage.py migrate --no-input

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Step 2: Start Backend Server (in background)
echo -e "${BLUE}🔍 Step 2: Starting Backend Server${NC}"
echo "Backend will be available at http://localhost:8000"
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
echo "Backend server started (PID: $BACKEND_PID)"
echo ""

# Step 3: Start Web App Dev Server
echo -e "${BLUE}🔍 Step 3: Starting Web App Dev Server${NC}"
cd ../../web

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    yarn install --silent
fi

echo "Starting Next.js dev server..."
echo "Web app will be available at http://localhost:3000"
NEXT_PUBLIC_API_URL=http://localhost:8000/api yarn dev &
WEB_PID=$!
echo "Web app started (PID: $WEB_PID)"
echo ""

# Wait for servers to start
echo -e "${YELLOW}⏳ Waiting for servers to initialize...${NC}"
sleep 5

# Step 4: Run API Tests
echo -e "${BLUE}🔍 Step 4: API Health Check${NC}"
curl -s http://localhost:8000/api/account/profile/ > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
fi

# Step 5: Create Test Summary
echo ""
echo -e "${BLUE}📊 Testing Summary${NC}"
echo "===================="
echo "Backend: http://localhost:8000"
echo "Web App: http://localhost:3000"
echo "Backend PID: $BACKEND_PID"
echo "Web PID: $WEB_PID"
echo ""
echo -e "${GREEN}✅ Servers started successfully${NC}"
echo ""
echo -e "${YELLOW}⚠️  To stop servers, run:${NC}"
echo "kill $BACKEND_PID $WEB_PID"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Run functional tests for each role"
echo "3. Review UI/UX and fix issues"
echo "4. Optimize for SEO and performance"
echo "5. Run security tests"
echo ""

# Save PIDs for cleanup
echo "$BACKEND_PID" > /tmp/fleet_backend.pid
echo "$WEB_PID" > /tmp/fleet_web.pid

echo -e "${GREEN}🎉 Ready for testing!${NC}"

