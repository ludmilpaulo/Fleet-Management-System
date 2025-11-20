# Fleet Management System - Asset Generation Guide

This guide provides instructions for generating all required logo, icon, and splash screen assets for both web and mobile applications.

## Brand Colors

- **Primary Blue**: `#2563eb` / `#3b82f6`
- **Primary Purple**: `#9333ea` / `#a855f7`
- **Primary Pink**: `#ec4899` / `#f472b6`
- **Background Dark**: `#030712`
- **White**: `#ffffff`

## SVG Source Files

All SVG source files have been created:
- `fleet/apps/web/public/logo.svg` - Main logo for web
- `fleet/apps/web/public/favicon.svg` - Favicon source
- `fleet/apps/mobile/assets/logo-icon.svg` - Mobile app icon source
- `fleet/apps/mobile/assets/splash-screen.svg` - Mobile splash screen source

## Web Assets Required

### Favicon
Generate from `favicon.svg`:
- `favicon.ico` (16x16, 32x32, 48x48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)

### Logo
Generate from `logo.svg`:
- `logo.png` (various sizes: 200x200, 400x400, 800x800)
- `logo-dark.png` (dark mode variant)

## Mobile Assets Required

### iOS App Icon
From `logo-icon.svg`, generate:
- `icon.png` (1024x1024) - Base icon
- iOS specific sizes will be generated automatically by Expo

### Android App Icon
From `logo-icon.svg`, generate:
- `adaptive-icon.png` (1024x1024) - Adaptive icon foreground
- `icon.png` (1024x1024) - Legacy icon

### Splash Screen
From `splash-screen.svg`, generate:
- `splash-icon.png` (1242x2208 for iOS, various Android sizes)

## Quick Generation (Using Online Tools)

1. **Visit**: https://realfavicongenerator.net/
   - Upload `favicon.svg`
   - Configure for all platforms
   - Download and place in `fleet/apps/web/public/`

2. **Visit**: https://www.appicon.co/ or use ImageMagick/Inkscape
   - Upload `logo-icon.svg`
   - Generate all iOS and Android sizes
   - Export to `fleet/apps/mobile/assets/`

3. **For Splash Screen**:
   - Convert `splash-screen.svg` to PNG at required sizes
   - iOS: 1242x2208, 2688x1242, 2048x2732
   - Android: 1920x1920 (centered)

## Using ImageMagick (Command Line)

### Convert SVG to PNG

```bash
# Install ImageMagick if needed
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick
# Windows: Download from imagemagick.org

# Favicon sizes
convert -background none -resize 16x16 favicon.svg favicon-16x16.png
convert -background none -resize 32x32 favicon.svg favicon-32x32.png

# App icon (1024x1024)
convert -background none -resize 1024x1024 logo-icon.svg icon.png

# Splash screen
convert -background "#030712" -resize 1242x2208 splash-screen.svg splash-icon.png
```

## Using Inkscape (Recommended)

```bash
# Install Inkscape
# macOS: brew install inkscape
# Linux: sudo apt-get install inkscape

# Export PNG from SVG
inkscape --export-filename=icon.png --export-width=1024 --export-height=1024 logo-icon.svg
inkscape --export-filename=favicon-32x32.png --export-width=32 --export-height=32 favicon.svg
```

## Using Node.js Script (Automated)

Create `generate-assets.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// This would use sharp or svg2img to convert SVGs
// npm install sharp svg2img
```

## Expo Asset Generation

For mobile app, Expo can auto-generate assets:

```bash
cd fleet/apps/mobile
npx expo-optimize
```

Or use `expo-assets`:
```bash
npx @expo/configure-assets
```

## Verification

After generating assets, verify:
1. ✅ All file sizes are correct
2. ✅ Icons display correctly on devices
3. ✅ Splash screens show proper logo positioning
4. ✅ Favicons appear in browser tabs
5. ✅ No compression artifacts

## Notes

- Keep SVG sources for future edits
- Use PNG format for all generated assets (except .ico for favicon)
- Maintain aspect ratios
- Test on actual devices, not just simulators
- Consider dark mode variants where applicable

