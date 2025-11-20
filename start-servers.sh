#!/bin/bash

# Script to start all servers in separate terminal windows
# Usage: ./start-servers.sh

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/fleet/apps/backend"
WEB_DIR="$SCRIPT_DIR/fleet/apps/web"
MOBILE_DIR="$SCRIPT_DIR/fleet/apps/mobile"

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Start Backend Server
    osascript -e "tell application \"Terminal\" to do script \"cd '$BACKEND_DIR' && python3 manage.py runserver 0.0.0.0:8000\""
    
    # Wait a bit
    sleep 2
    
    # Start Web Server
    osascript -e "tell application \"Terminal\" to do script \"cd '$WEB_DIR' && npm run dev\""
    
    # Wait a bit
    sleep 2
    
    # Start Mobile Server
    osascript -e "tell application \"Terminal\" to do script \"cd '$MOBILE_DIR' && npm start\""
    
    echo "✅ All servers starting in separate Terminal windows!"
    echo ""
    echo "You should see:"
    echo "  - Backend server on http://localhost:8000"
    echo "  - Web server on http://localhost:3000"
    echo "  - Mobile/Expo server starting..."
else
    echo "This script is for macOS. For other systems, run servers manually:"
    echo ""
    echo "Backend:"
    echo "  cd $BACKEND_DIR"
    echo "  python3 manage.py runserver 0.0.0.0:8000"
    echo ""
    echo "Web:"
    echo "  cd $WEB_DIR"
    echo "  npm run dev"
    echo ""
    echo "Mobile:"
    echo "  cd $MOBILE_DIR"
    echo "  npm start"
fi

