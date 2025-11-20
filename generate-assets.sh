#!/bin/bash

# Fleet Management System - Asset Generation Script
# This script generates PNG assets from SVG sources

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$SCRIPT_DIR/fleet/apps/web/public"
MOBILE_DIR="$SCRIPT_DIR/fleet/apps/mobile/assets"

echo "🚀 Generating Fleet Management System Assets..."

# Check for ImageMagick or Inkscape
if command -v convert &> /dev/null; then
    CONVERT_CMD="convert"
    echo "✓ Found ImageMagick"
elif command -v inkscape &> /dev/null; then
    CONVERT_CMD="inkscape"
    echo "✓ Found Inkscape"
else
    echo "❌ Error: Neither ImageMagick nor Inkscape found."
    echo "Please install one:"
    echo "  macOS: brew install imagemagick (or brew install inkscape)"
    echo "  Linux: sudo apt-get install imagemagick (or sudo apt-get install inkscape)"
    exit 1
fi

# Function to convert SVG to PNG using ImageMagick
convert_imagemagick() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"
    local bg="$5"
    
    if [ -n "$bg" ]; then
        convert -background "$bg" -resize "${width}x${height}" "$input" "$output"
    else
        convert -background none -resize "${width}x${height}" "$input" "$output"
    }
}

# Function to convert SVG to PNG using Inkscape
convert_inkscape() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"
    
    inkscape --export-filename="$output" --export-width="$width" --export-height="$height" "$input" 2>/dev/null || \
    inkscape "$input" --export-png="$output" -w "$width" -h "$height" 2>/dev/null
}

# Choose conversion method
if [ "$CONVERT_CMD" = "convert" ]; then
    CONVERT_FN="convert_imagemagick"
else
    CONVERT_FN="convert_inkscape"
fi

echo ""
echo "📱 Generating Mobile App Assets..."

# Mobile App Icon (1024x1024)
if [ -f "$MOBILE_DIR/logo-icon.svg" ]; then
    echo "  → Generating app icon (1024x1024)..."
    $CONVERT_FN "$MOBILE_DIR/logo-icon.svg" "$MOBILE_DIR/icon.png" 1024 1024 "#ffffff"
    echo "    ✓ Created icon.png"
    
    # Adaptive icon (same for now)
    cp "$MOBILE_DIR/icon.png" "$MOBILE_DIR/adaptive-icon.png"
    echo "    ✓ Created adaptive-icon.png"
else
    echo "    ⚠ logo-icon.svg not found"
fi

# Splash Screen
if [ -f "$MOBILE_DIR/splash-screen.svg" ]; then
    echo "  → Generating splash screen (1242x2208)..."
    $CONVERT_FN "$MOBILE_DIR/splash-screen.svg" "$MOBILE_DIR/splash-icon.png" 1242 2208 "#030712"
    echo "    ✓ Created splash-icon.png"
else
    echo "    ⚠ splash-screen.svg not found"
fi

# Mobile Favicon
if [ -f "$MOBILE_DIR/logo-icon.svg" ]; then
    echo "  → Generating mobile favicon (180x180)..."
    $CONVERT_FN "$MOBILE_DIR/logo-icon.svg" "$MOBILE_DIR/favicon.png" 180 180 "#ffffff"
    echo "    ✓ Created favicon.png"
fi

echo ""
echo "🌐 Generating Web Assets..."

# Web Favicon
if [ -f "$WEB_DIR/favicon.svg" ]; then
    echo "  → Generating favicon (16x16, 32x32)..."
    $CONVERT_FN "$WEB_DIR/favicon.svg" "$WEB_DIR/favicon-16x16.png" 16 16 "transparent"
    $CONVERT_FN "$WEB_DIR/favicon.svg" "$WEB_DIR/favicon-32x32.png" 32 32 "transparent"
    echo "    ✓ Created favicon-16x16.png and favicon-32x32.png"
    
    # Apple Touch Icon
    $CONVERT_FN "$WEB_DIR/favicon.svg" "$WEB_DIR/apple-touch-icon.png" 180 180 "#ffffff"
    echo "    ✓ Created apple-touch-icon.png"
else
    echo "    ⚠ favicon.svg not found"
fi

# Web Logo
if [ -f "$WEB_DIR/logo.svg" ]; then
    echo "  → Generating web logo (200x200, 400x400, 800x800)..."
    $CONVERT_FN "$WEB_DIR/logo.svg" "$WEB_DIR/logo-200.png" 200 200 "transparent"
    $CONVERT_FN "$WEB_DIR/logo.svg" "$WEB_DIR/logo-400.png" 400 400 "transparent"
    $CONVERT_FN "$WEB_DIR/logo.svg" "$WEB_DIR/logo-800.png" 800 800 "transparent"
    echo "    ✓ Created logo variants"
    
    # Main logo
    cp "$WEB_DIR/logo-400.png" "$WEB_DIR/logo.png"
    echo "    ✓ Created logo.png"
else
    echo "    ⚠ logo.svg not found"
fi

echo ""
echo "✅ Asset generation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review generated PNG files"
echo "   2. For favicon.ico, use: https://realfavicongenerator.net/"
echo "   3. Test icons on actual devices"
echo "   4. Update app.json and HTML metadata if needed"

