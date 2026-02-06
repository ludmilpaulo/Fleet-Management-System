# EAS Build Prebuild Fix

## Changes Made

1. **Added expo-system-ui** - Required for `userInterfaceStyle` in app.json. The prebuild was warning: "Install expo-system-ui in your project to enable this feature."

2. **Run these commands before building:**

```bash
cd fleet/apps/mobile

# Install the new dependency
npm install
# or
yarn install

# Verify with expo doctor (requires network)
EXPO_DOCTOR_WARN_ON_NETWORK_ERRORS=true npx expo-doctor

# Then build
npm run build:ios
# or
npm run build:android
```

## If Build Still Fails

1. **Check EAS build logs** - Go to [expo.dev](https://expo.dev) → Your project → Builds → Click the failed build → Expand "Prebuild" phase for detailed error

2. **Run prebuild locally** to catch issues:
   ```bash
   npx expo prebuild --clean
   ```

3. **Common fixes:**
   - Ensure `LANG=en_US.UTF-8` is set (for CocoaPods on Mac)
   - Run `npm install` or `yarn install` to ensure all deps are installed
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
