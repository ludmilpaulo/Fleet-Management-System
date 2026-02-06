#!/bin/bash

# Production Submit Script
# Submits builds directly to production track on App Store and Google Play

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$MOBILE_DIR"

echo "📤 Starting production submission process..."
echo ""

# Get platform from argument or default to both
PLATFORM="${1:-all}"

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo "🍎 Submitting iOS build to App Store (Production)..."
  eas submit --platform ios --profile production --non-interactive
  echo ""
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo "🤖 Submitting Android build to Google Play (Production Track)..."
  eas submit --platform android --profile production --non-interactive
  echo ""
fi

echo "✅ Submission completed!"
echo ""
echo "📱 Your app is now being processed for production release:"
echo "   - iOS: Check App Store Connect for review status"
echo "   - Android: Check Google Play Console for release status"
echo ""
