# iOS Production Configuration

## ✅ Configuration Complete

The iOS app is now configured to **go straight to production** when built for App Store distribution.

## 🔧 Changes Made

### 1. **app.json** - iOS Production Settings
- Added `bundleIdentifier`: `com.fleetia.mobile`
- Added `buildNumber`: `1` (increment for each App Store submission)
- Added required iOS permissions descriptions:
  - Location access (for vehicle tracking)
  - Camera access (for inspections)
  - Photo library access (for inspection photos)
  - Bluetooth access (for BLE key tracking)

### 2. **API Services** - Production URL Detection
All API services now automatically detect production builds and use the production API:

**Updated Files:**
- `src/services/apiService.ts`
- `src/api/client.ts`
- `src/services/api.ts`
- `src/services/authService.ts`

**Logic:**
- **Environment Variable** (`EXPO_PUBLIC_API_URL`) takes highest priority
- **Production Builds** (`__DEV__ === false`): Uses `https://taki.pythonanywhere.com/api`
- **Development Builds** (`__DEV__ === true`): Uses `http://192.168.1.110:8000/api`

### 3. **EAS Build Configuration** (`eas.json`)
Production build already configured with:
```json
{
  "production": {
    "env": {
      "EXPO_PUBLIC_API_URL": "https://taki.pythonanywhere.com/api"
    }
  }
}
```

## 🚀 Building for iOS Production

### Using EAS Build (Recommended)

1. **Build for production:**
   ```bash
   cd fleet/apps/mobile
   eas build --platform ios --profile production
   ```

2. **Submit to App Store:**
   ```bash
   eas submit --platform ios --profile production
   ```

### Manual Build

1. **Update version/build number in app.json:**
   ```json
   {
     "version": "1.0.1",
     "ios": {
       "buildNumber": "2"
     }
   }
   ```

2. **Build with EAS:**
   ```bash
   eas build --platform ios --profile production
   ```

## 📱 Production API

**Production API URL:** `https://taki.pythonanywhere.com/api`

The app will automatically use this URL when:
- Built with `eas build --profile production`
- Running in App Store build
- `__DEV__` is `false` (production mode)

## 🔍 Verification

### Check API URL in Production Build

1. **Build the app:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Check logs** - The app logs the API URL on startup:
   ```
   [API Service] Base URL: https://taki.pythonanywhere.com/api
   ```

3. **Test API connection** - The app should connect to production API automatically

## 📝 Notes

- **Development**: When running `expo start` or `npm start`, the app uses `http://192.168.1.110:8000/api` (development)
- **Production**: When built with EAS or running App Store build, the app uses `https://taki.pythonanywhere.com/api` (production)
- **Override**: Set `EXPO_PUBLIC_API_URL` environment variable to override the default behavior

## ✅ Status

- ✅ iOS production configuration complete
- ✅ API services detect production builds
- ✅ Production API URL configured
- ✅ EAS build profile configured
- ✅ App Store submission ready

**iOS production builds will now automatically use the production API URL.**
