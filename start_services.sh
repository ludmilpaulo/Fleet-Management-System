#!/bin/bash
# Start services for testing

echo "Starting Backend API Server..."
cd fleet/apps/backend

# Check if already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Backend already running on port 8000"
else
    python3 manage.py runserver 8000 > /tmp/backend_server.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    echo "Waiting for backend to be ready..."
    
    for i in {1..30}; do
        if curl -s http://localhost:8000/api/account/login/ > /dev/null 2>&1; then
            echo "Backend is ready!"
            break
        fi
        sleep 1
    done
fi

echo ""
echo "Services Status:"
echo "  Backend API: http://localhost:8000"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "  Web App: http://localhost:3000 (already running)"
else
    echo "  Web App: Not running (start with: cd fleet/apps/web && npm run dev)"
fi

