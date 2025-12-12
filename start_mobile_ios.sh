#!/bin/bash
# Start Mobile App on iOS Simulator

echo "=========================================="
echo "Starting Fleet Management Mobile App"
echo "on iOS Simulator"
echo "=========================================="
echo ""

cd "$(dirname "$0")/fleet/apps/mobile"

# Check if backend is running
echo "Checking backend API..."
if curl -s http://localhost:8000/api/account/login/ > /dev/null 2>&1; then
    echo "✅ Backend API is running on port 8000"
else
    echo "⚠️  WARNING: Backend API not running on port 8000"
    echo "   Start it with: cd fleet/apps/backend && python manage.py runserver 8000"
    echo ""
fi

# Set API URL
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api" > .env
    echo "✅ Created .env with API URL: http://localhost:8000/api"
else
    echo "✅ .env file exists"
fi

# Boot iOS Simulator if not already booted
echo ""
echo "Checking iOS Simulator..."
SIMULATOR_ID=$(xcrun simctl list devices available | grep "iPhone 16 Pro" | head -1 | grep -o '[A-F0-9-]\{36\}')
if [ -n "$SIMULATOR_ID" ]; then
    echo "Found iPhone 16 Pro simulator: $SIMULATOR_ID"
    BOOTED=$(xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -i "booted")
    if [ -z "$BOOTED" ]; then
        echo "Booting simulator..."
        xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || echo "Simulator may already be booting..."
        sleep 2
    else
        echo "✅ Simulator already booted"
    fi
    open -a Simulator 2>/dev/null || echo "Opening Simulator..."
else
    echo "⚠️  Could not find iPhone 16 Pro simulator"
    echo "   Available simulators:"
    xcrun simctl list devices available | grep "iPhone" | head -5
fi

echo ""
echo "Starting Expo development server..."
echo "The app will launch in iOS Simulator automatically"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start Expo with iOS
npm run ios

