# Mobile App Build and Deployment Guide

## Production Configuration

### Production URLs
All production URLs are configured to use:
- **API Base URL**: `https://taki.pythonanywhere.com/api`
- **Web App**: `https://www.fleetia.online`

### Configuration Files
- ✅ `app.json` - Updated with production settings, bundle identifiers, and permissions
- ✅ `eas.json` - EAS Build configuration for iOS and Android
- ✅ All API services use production URL when `__DEV__` is false

## Pre-Build Checklist

### 1. Environment Variables
Ensure production environment variables are set:
```bash
EXPO_PUBLIC_API_URL=https://taki.pythonanywhere.com/api
```

### 2. Dependencies
All dependencies are installed:
```bash
cd fleet/apps/mobile
npm install
# or
yarn install
```

### 3. Code Verification
- ✅ No TypeScript errors
- ✅ No linter errors
- ✅ All production URLs configured
- ✅ All API integrations verified

## Build Commands

### Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Configure EAS Project
```bash
eas build:configure
```

### Build for iOS (Production)
```bash
# Build for App Store
eas build --platform ios --profile production

# Build for TestFlight (internal testing)
eas build --platform ios --profile preview
```

### Build for Android (Production)
```bash
# Build APK for Google Play
eas build --platform android --profile production

# Build APK for internal testing
eas build --platform android --profile preview
```

### Build for Both Platforms
```bash
eas build --platform all --profile production
```

## Store Deployment

### iOS App Store

#### Prerequisites
1. Apple Developer Account ($99/year)
2. App Store Connect access
3. App Store Connect app created

#### Steps
1. **Update eas.json** with your Apple credentials:
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "your-app-store-connect-app-id",
         "appleTeamId": "your-apple-team-id"
       }
     }
   }
   ```

2. **Build and Submit**:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios --profile production
   ```

3. **Or Build and Submit in one command**:
   ```bash
   eas build --platform ios --profile production --auto-submit
   ```

#### App Store Connect Setup
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app:
   - Bundle ID: `com.fleetia.mobile`
   - App Name: `FleetIA`
   - Primary Language: English
   - SKU: `fleetia-mobile-001`
3. Fill in app information:
   - Description
   - Screenshots
   - App Icon
   - Privacy Policy URL
   - Support URL
4. Submit for review

### Google Play Store

#### Prerequisites
1. Google Play Developer Account ($25 one-time)
2. Google Play Console access
3. Service account JSON key

#### Steps
1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a service account
   - Download JSON key file
   - Save as `google-service-account.json` in mobile app root
   - Grant "Release Manager" role in Google Play Console

2. **Update eas.json**:
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./google-service-account.json",
         "track": "production"
       }
     }
   }
   ```

3. **Build and Submit**:
   ```bash
   eas build --platform android --profile production
   eas submit --platform android --profile production
   ```

4. **Or Build and Submit in one command**:
   ```bash
   eas build --platform android --profile production --auto-submit
   ```

#### Google Play Console Setup
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app:
   - App Name: `FleetIA`
   - Default Language: English
   - App or Game: App
   - Free or Paid: Free
3. Fill in store listing:
   - Short description
   - Full description
   - Screenshots
   - App Icon
   - Feature Graphic
   - Privacy Policy URL
4. Complete content rating questionnaire
5. Set up pricing and distribution
6. Submit for review

## Testing Before Deployment

### Local Testing
```bash
# Start development server
npm start

# Test on iOS simulator
npm run ios

# Test on Android emulator
npm run android
```

### Production Build Testing
1. Build preview version:
   ```bash
   eas build --platform ios --profile preview
   eas build --platform android --profile preview
   ```

2. Install on physical devices
3. Test all features:
   - ✅ Authentication (Login/Logout)
   - ✅ Dashboard (all roles)
   - ✅ Vehicles (list, details, report issue)
   - ✅ Inspections (start, complete)
   - ✅ Shifts (start, end)
   - ✅ Reports (view, filter)
   - ✅ Profile (view, edit)
   - ✅ Notifications
   - ✅ Location tracking
   - ✅ Camera/Photo uploads

## API Integration Verification

### Verified Endpoints
- ✅ Authentication: `/account/login/`, `/account/register/`, `/account/profile/`
- ✅ Vehicles: `/fleet/vehicles/`
- ✅ Shifts: `/fleet/shifts/`, `/fleet/shifts/start/`, `/fleet/shifts/{id}/end/`
- ✅ Inspections: `/inspections/inspections/`
- ✅ Issues: `/issues/issues/`
- ✅ Reports: `/fleet/stats/dashboard/`
- ✅ Notifications: `/telemetry/notifications/`

### Production API Base URL
All services use: `https://taki.pythonanywhere.com/api`

## Version Management

### Update Version
1. Update `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.0",  // Update this
       "ios": {
         "buildNumber": "1"  // Increment for each build
       },
       "android": {
         "versionCode": 1  // Increment for each build
       }
     }
   }
   ```

2. Commit changes:
   ```bash
   git add app.json
   git commit -m "chore: bump version to 1.0.1"
   git push
   ```

3. Build new version:
   ```bash
   eas build --platform all --profile production
   ```

## Troubleshooting

### Build Failures
- Check EAS build logs: `eas build:list`
- Verify all dependencies are compatible
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify app.json configuration

### Submission Failures
- Verify store credentials in eas.json
- Check app store listing completeness
- Ensure all required screenshots are uploaded
- Verify privacy policy URL is accessible

## Support

For issues or questions:
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/
- EAS Support: support@expo.dev

