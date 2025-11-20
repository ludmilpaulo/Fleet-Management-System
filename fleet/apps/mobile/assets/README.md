# Mobile App Assets

This directory contains all visual assets for the Fleet Management mobile application.

## Assets Overview

### ✅ Required Assets (All Generated)

1. **`icon.png`** (1024x1024)
   - Main app icon for iOS and Android
   - Used as the app icon on device home screens
   - Format: PNG with transparency
   - Background: White

2. **`adaptive-icon.png`** (1024x1024)
   - Android adaptive icon (foreground)
   - Used for modern Android devices (API 26+)
   - Format: PNG with transparency
   - Background: Set in app.json (#030712)

3. **`splash-icon.png`** (1242x2208)
   - Splash screen image
   - Shown when app is launching
   - Format: PNG
   - Background: Dark (#030712)
   - Contains logo centered on gradient background

4. **`favicon.png`** (180x180)
   - Web favicon (when app is used as PWA)
   - Also used for web app previews
   - Format: PNG
   - Background: White

### SVG Source Files

- **`logo-icon.svg`** - Source for icon.png and adaptive-icon.png
- **`splash-screen.svg`** - Source for splash-icon.png

## Configuration

All assets are configured in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#030712"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#030712"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Regenerating Assets

To regenerate all assets from SVG sources:

```bash
# From project root
node generate-assets.js

# Or using bash script (requires ImageMagick/Inkscape)
./generate-assets.sh
```

## Asset Specifications

### Icon Requirements
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Transparent (for icon.png) or white (for adaptive-icon.png foreground)
- **Content**: Centered logo with safe area padding (10% margin)

### Splash Screen Requirements
- **Size**: 1242x2208 pixels (iOS standard)
- **Format**: PNG
- **Background**: #030712 (dark)
- **Content**: Logo centered, with app name below

### Favicon Requirements
- **Size**: 180x180 pixels (for Apple Touch Icon)
- **Format**: PNG
- **Background**: White or transparent

## Testing

After updating assets:
1. Rebuild the app: `npx expo prebuild`
2. Test on physical devices (simulators may cache old assets)
3. Verify icons appear correctly on home screens
4. Check splash screen displays properly on app launch

## Notes

- Assets should be optimized for file size while maintaining quality
- All assets use the brand gradient (blue → purple → pink)
- Keep SVG sources for easy future updates
- Test on both iOS and Android to ensure compatibility

