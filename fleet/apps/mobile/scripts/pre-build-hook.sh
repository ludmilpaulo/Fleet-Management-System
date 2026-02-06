#!/bin/bash

# Pre-build Hook Script
# Automatically increments version numbers before EAS build
# This hook is called automatically by EAS Build before building
# EAS may pass --platform flag, which we ignore

set -e

# EAS runs from the mobile app directory (fleet/apps/mobile)
# Check if we're already in the mobile directory or need to navigate
if [ -f "app.json" ]; then
  MOBILE_DIR="$(pwd)"
elif [ -f "fleet/apps/mobile/app.json" ]; then
  cd fleet/apps/mobile
  MOBILE_DIR="$(pwd)"
else
  echo "❌ Error: Could not find app.json"
  exit 1
fi

# Only increment if building for production
if [ "$EAS_BUILD_PROFILE" != "production" ]; then
  echo "ℹ️  Skipping version increment (not a production build)"
  exit 0
fi

# Run the Node.js version increment script
cd "$MOBILE_DIR"
node scripts/pre-build-hook.js
