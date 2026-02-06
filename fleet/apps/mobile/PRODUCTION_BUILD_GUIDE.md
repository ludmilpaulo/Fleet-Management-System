# Production Build & Submission Guide

This guide explains how to build and submit the mobile app to production stores with automatic version incrementing.

## 🎯 Key Features

- ✅ **Automatic Version Incrementing**: App version and build numbers are automatically incremented before each production build
- ✅ **Direct to Production**: Builds are configured to go straight to production/distribution track
- ✅ **One-Command Build & Submit**: Simple commands to build and submit to stores

## 📱 Version Management

### Version Components

- **App Version** (`expo.version`): User-facing version (e.g., "1.0.0")
  - Format: `MAJOR.MINOR.PATCH`
  - Auto-increments patch version (1.0.0 → 1.0.1 → 1.0.2)
  - When patch reaches 10, increments minor (1.0.9 → 1.1.0)
  - When minor reaches 10, increments major (1.9.9 → 2.0.0)

- **iOS Build Number** (`expo.ios.buildNumber`): Internal build number for App Store
  - Increments with each build (1 → 2 → 3)
  - Required by Apple for each submission

- **Android Version Code** (`expo.android.versionCode`): Internal version code for Google Play
  - Increments with each build (1 → 2 → 3)
  - Must always increase for each release

## 🚀 Building for Production

### Prerequisites

1. **EAS CLI installed**:
   ```bash
   npm install -g eas-cli
   ```

2. **Logged into Expo**:
   ```bash
   eas login
   ```

3. **EAS Project configured**:
   ```bash
   eas build:configure
   ```

### Build Commands

#### Option 1: Using npm scripts (Recommended)

**Build for iOS:**
```bash
npm run build:ios
```

**Build for Android:**
```bash
npm run build:android
```

**Build for both platforms:**
```bash
npm run build:production
```

#### Option 2: Using scripts directly

**Build for iOS:**
```bash
bash scripts/build-production.sh ios
```

**Build for Android:**
```bash
bash scripts/build-production.sh android
```

**Build for both:**
```bash
bash scripts/build-production.sh all
```

#### Option 3: Manual EAS build (with auto-increment)

The `prebuildCommand` in `eas.json` automatically increments versions:
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### What Happens During Build

1. ✅ Version numbers are automatically incremented
2. ✅ Build is created for production distribution
3. ✅ Build is configured for store submission
4. ✅ Version changes are saved to `app.json`

## 📤 Submitting to Stores

### Prerequisites

#### iOS (App Store)
- Apple Developer Account
- App Store Connect API Key (recommended) or Apple ID credentials
- Update `eas.json` submit.production.ios with your credentials

#### Android (Google Play)
- Google Play Console account
- Service Account JSON key file
- Update `eas.json` submit.production.android with key path

### Submit Commands

#### Option 1: Using npm scripts (Recommended)

**Submit iOS:**
```bash
npm run submit:ios
```

**Submit Android:**
```bash
npm run submit:android
```

**Submit both:**
```bash
npm run submit:production
```

#### Option 2: Build and Submit in One Command

**iOS:**
```bash
npm run build-and-submit:ios
```

**Android:**
```bash
npm run build-and-submit:android
```

**Both:**
```bash
npm run build-and-submit:all
```

#### Option 3: Manual EAS submit

```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### Store Distribution Settings

#### iOS App Store
- **Distribution**: `store` (App Store)
- **Track**: Production (goes straight to App Store, not TestFlight)
- **Release Status**: Automatic (releases immediately after approval)

#### Google Play Store
- **Distribution**: `store` (Google Play)
- **Track**: `production` (goes straight to production track)
- **Release Status**: `completed` (releases immediately after review)

## 🔧 Configuration Files

### `app.json`
Contains version information:
```json
{
  "expo": {
    "version": "1.0.0",  // App version (auto-incremented)
    "ios": {
      "buildNumber": "1"  // iOS build number (auto-incremented)
    },
    "android": {
      "versionCode": 1   // Android version code (auto-incremented)
    }
  }
}
```

### `eas.json`
Contains build and submit profiles:
```json
{
  "build": {
    "production": {
      "distribution": "store",  // Goes to store
      "android": {
        "track": "production"   // Production track
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "production",
        "releaseStatus": "completed"  // Auto-release after approval
      }
    }
  }
}
```

## 📋 Manual Version Increment

If you need to manually increment versions without building:

```bash
npm run increment-version
```

Or directly:
```bash
node scripts/increment-version.js
```

## 🔍 Verifying Versions

Check current versions:
```bash
cat app.json | grep -A 5 '"version"'
```

## ⚠️ Important Notes

1. **Version Incrementing**: Versions are automatically incremented before each production build. Don't manually increment if using the build scripts.

2. **Production Track**: All production builds go directly to the production track, not internal testing or beta tracks.

3. **Android Release Status**: Set to `completed` which means the app will automatically release after Google's review (if you have automatic release enabled in Play Console).

4. **iOS Release**: After Apple's review, you may need to manually release in App Store Connect, or set up automatic release in App Store Connect settings.

5. **Version Conflicts**: If you get version conflicts, ensure you're using the latest `app.json` with incremented versions.

## 🐛 Troubleshooting

### Version Already Exists Error

If you get an error that the version already exists:
1. Check current version in `app.json`
2. Manually increment if needed: `npm run increment-version`
3. Rebuild

### Build Fails

1. Check EAS build logs: `eas build:list`
2. Verify credentials in `eas.json`
3. Ensure you're logged in: `eas whoami`

### Submit Fails

1. Verify store credentials in `eas.json`
2. Check that the build completed successfully
3. Ensure the app exists in App Store Connect / Google Play Console

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)
- [Google Play Console Guide](https://support.google.com/googleplay/android-developer/)
