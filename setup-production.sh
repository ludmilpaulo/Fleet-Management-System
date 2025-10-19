#!/bin/bash
# Fleet Management System - Production Setup Script

echo "🚀 Fleet Management System - Production Setup"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_dependencies() {
    local service="$1"
    local path="$2"
    
    echo -e "${BLUE}Installing dependencies for $service...${NC}"
    
    if [ -d "$path" ]; then
        cd "$path"
        
        if [ -f "requirements.txt" ]; then
            echo "Installing Python dependencies..."
            pip install -r requirements.txt
        fi
        
        if [ -f "package.json" ]; then
            echo "Installing Node.js dependencies..."
            npm install
        fi
        
        cd - > /dev/null
        echo -e "${GREEN}✅ Dependencies installed for $service${NC}"
    else
        echo -e "${RED}❌ Directory not found: $path${NC}"
    fi
    echo ""
}

# Function to start service
start_service() {
    local service="$1"
    local path="$2"
    local command="$3"
    local port="$4"
    
    echo -e "${BLUE}Starting $service...${NC}"
    
    if [ -d "$path" ]; then
        cd "$path"
        
        # Check if service is already running
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  $service is already running on port $port${NC}"
        else
            echo "Starting $service with command: $command"
            eval "$command" &
            sleep 5
            
            # Check if service started successfully
            if curl -s "http://localhost:$port" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $service started successfully on port $port${NC}"
            else
                echo -e "${RED}❌ Failed to start $service${NC}"
            fi
        fi
        
        cd - > /dev/null
    else
        echo -e "${RED}❌ Directory not found: $path${NC}"
    fi
    echo ""
}

# Function to setup database
setup_database() {
    echo -e "${BLUE}Setting up database...${NC}"
    
    cd fleet/apps/backend
    
    # Run migrations
    echo "Running database migrations..."
    python manage.py migrate
    
    # Create superuser
    echo "Creating superuser..."
    echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell
    
    # Collect static files
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
    
    cd - > /dev/null
    
    echo -e "${GREEN}✅ Database setup complete${NC}"
    echo ""
}

# Function to build mobile app
build_mobile_app() {
    echo -e "${BLUE}Building mobile application...${NC}"
    
    cd fleet/apps/mobile
    
    # Install dependencies
    npm install
    
    # Build for Android
    echo "Building Android app..."
    npx expo build:android --type app-bundle --release-channel production
    
    # Build for iOS
    echo "Building iOS app..."
    npx expo build:ios --type archive --release-channel production
    
    cd - > /dev/null
    
    echo -e "${GREEN}✅ Mobile app build complete${NC}"
    echo ""
}

# Function to setup environment variables
setup_environment() {
    echo -e "${BLUE}Setting up environment variables...${NC}"
    
    # Backend environment
    cat > fleet/apps/backend/.env << EOF
DEBUG=False
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MIXPANEL_TOKEN=c1cb0b3411115435a0d45662ad7a97e4
EOF

    # Web environment
    cat > fleet/apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MIXPANEL_TOKEN=c1cb0b3411115435a0d45662ad7a97e4
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
EOF

    # Mobile environment
    cat > fleet/apps/mobile/.env << EOF
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_MIXPANEL_TOKEN=c1cb0b3411115435a0d45662ad7a97e4
EOF

    echo -e "${GREEN}✅ Environment variables set up${NC}"
    echo ""
}

# Function to run production tests
run_production_tests() {
    echo -e "${BLUE}Running production tests...${NC}"
    
    if [ -f "test-production.sh" ]; then
        chmod +x test-production.sh
        ./test-production.sh
    else
        echo -e "${RED}❌ Production test script not found${NC}"
    fi
    echo ""
}

# Main setup process
echo -e "${YELLOW}Phase 1: Environment Setup${NC}"
echo "=========================="

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if command_exists python; then
    echo -e "${GREEN}✅ Python is installed${NC}"
else
    echo -e "${RED}❌ Python is not installed${NC}"
    exit 1
fi

if command_exists npm; then
    echo -e "${GREEN}✅ Node.js is installed${NC}"
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if command_exists git; then
    echo -e "${GREEN}✅ Git is installed${NC}"
else
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

echo ""

echo -e "${YELLOW}Phase 2: Dependencies Installation${NC}"
echo "=================================="

# Install dependencies for each service
install_dependencies "Backend" "fleet/apps/backend"
install_dependencies "Web App" "fleet/apps/web"
install_dependencies "Mobile App" "fleet/apps/mobile"

echo -e "${YELLOW}Phase 3: Environment Configuration${NC}"
echo "=================================="

# Setup environment variables
setup_environment

echo -e "${YELLOW}Phase 4: Database Setup${NC}"
echo "======================="

# Setup database
setup_database

echo -e "${YELLOW}Phase 5: Service Startup${NC}"
echo "======================="

# Start services
start_service "Backend API" "fleet/apps/backend" "python manage.py runserver 8000" "8000"
start_service "Web Application" "fleet/apps/web" "npm run dev" "3000"
start_service "Mobile Metro Bundler" "fleet/apps/mobile" "npx expo start" "8081"

echo -e "${YELLOW}Phase 6: Mobile App Build${NC}"
echo "======================="

# Build mobile app
build_mobile_app

echo -e "${YELLOW}Phase 7: Production Testing${NC}"
echo "========================="

# Run production tests
run_production_tests

echo -e "${YELLOW}Phase 8: Deployment Status${NC}"
echo "========================="

# Check service status
echo -e "${BLUE}Checking service status...${NC}"

if curl -s "http://localhost:8000/api/" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API: Running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend API: Not running${NC}"
fi

if curl -s "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web Application: Running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Web Application: Not running${NC}"
fi

if curl -s "http://localhost:8081" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Mobile Metro Bundler: Running on http://localhost:8081${NC}"
else
    echo -e "${RED}❌ Mobile Metro Bundler: Not running${NC}"
fi

echo ""

echo -e "${YELLOW}📊 PRODUCTION SETUP SUMMARY${NC}"
echo "============================="
echo "Setup Date: $(date)"
echo "Environment: Production"
echo "Version: $(git rev-parse --short HEAD)"
echo ""

echo -e "${GREEN}🎉 Production Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Access URLs:${NC}"
echo "Backend API: http://localhost:8000/api/"
echo "Web Application: http://localhost:3000"
echo "Mobile App: Scan QR code from Metro bundler"
echo "Admin Panel: http://localhost:8000/admin/"
echo ""
echo -e "${BLUE}🔑 Default Credentials:${NC}"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo -e "${BLUE}📱 Mobile App Testing:${NC}"
echo "1. Install Expo Go on your device"
echo "2. Scan QR code from Metro bundler terminal"
echo "3. Test all features including fuel detection"
echo ""
echo -e "${BLUE}🌐 Web App Testing:${NC}"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test authentication and dashboard features"
echo "3. Test fleet management functionality"
echo ""
echo -e "${BLUE}🔧 Backend API Testing:${NC}"
echo "1. Test API endpoints at http://localhost:8000/api/"
echo "2. Use admin panel at http://localhost:8000/admin/"
echo "3. Test authentication and data operations"
echo ""
echo -e "${GREEN}🚀 Fleet Management System is ready for production testing!${NC}"
