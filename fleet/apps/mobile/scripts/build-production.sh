#!/bin/bash

# Production Build Script
# Automatically increments versions and builds for production distribution

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$MOBILE_DIR"

echo "🚀 Starting production build process..."
echo ""

# Step 1: Increment versions
echo "📦 Step 1: Incrementing version numbers..."
cd "$MOBILE_DIR"
node scripts/increment-version.js
if [ $? -ne 0 ]; then
  echo "❌ Failed to increment versions"
  exit 1
fi
echo ""

# Step 2: Get platform from argument or default to both
PLATFORM="${1:-all}"

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo "🍎 Step 2: Building for iOS (App Store)..."
  eas build --platform ios --profile production --non-interactive
  echo ""
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo "🤖 Step 3: Building for Android (Google Play)..."
  eas build --platform android --profile production --non-interactive
  echo ""
fi

echo "✅ Production build completed!"
echo ""
echo "📱 Next steps:"
echo "   1. Review the builds in Expo dashboard"
echo "   2. Submit to stores using:"
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo "      eas submit --platform ios --profile production"
fi
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo "      eas submit --platform android --profile production"
fi
echo ""
