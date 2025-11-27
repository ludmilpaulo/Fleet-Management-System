# Expo Go Limitations

## ⚠️ Push Notifications in Expo Go

**Important**: As of Expo SDK 53, push notifications (remote notifications) are **not supported in Expo Go**.

### What This Means

1. **Local Notifications**: ✅ **WORK** - These will function normally in Expo Go
   - Daily shift reminders
   - Shift assignment notifications
   - All scheduled local notifications

2. **Push Notifications**: ❌ **DON'T WORK** in Expo Go
   - Remote push notifications from backend
   - Push notifications sent via Expo Push Notification service

### Current Implementation

The app is designed to work with **local notifications only** for Expo Go compatibility:

```typescript
// notificationService.ts handles this gracefully
async getPushToken(): Promise<string | null> {
  try {
    // In Expo Go, this will fail and return null
    // Local notifications will still work
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    // Expected in Expo Go - local notifications still work
    console.warn('Push token not available (Expo Go limitation), using local notifications only');
    return null;
  }
}
```

### What Works in Expo Go ✅

- ✅ Local notifications for shift reminders
- ✅ Daily shift reminders at 6 AM
- ✅ 1-hour-before shift reminders
- ✅ Shift assignment notifications (local)
- ✅ All app functionality
- ✅ Location tracking
- ✅ Camera functionality
- ✅ All CRUD operations

### What Requires Development Build 🏗️

To use **push notifications** (remote notifications from backend), you need a **development build**:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS**:
   ```bash
   eas build:configure
   ```

3. **Create Development Build**:
   ```bash
   eas build --profile development --platform android
   # or
   eas build --profile development --platform ios
   ```

4. **Install on Device**:
   - Download and install the development build
   - Push notifications will then work

### Testing Without Development Build

For testing in Expo Go:
- All local notifications work perfectly
- The app polls for new shifts and creates local notifications
- Shift reminders are scheduled locally
- No backend push notification integration needed for basic functionality

### Warning Message

The warning you see is **informational only** and does not break functionality:
```
WARN expo-notifications functionality is not fully supported in Expo Go:
We recommend you instead use a development build to avoid limitations.
```

This is expected and the app will:
1. Try to get push token (fails in Expo Go)
2. Fall back to local notifications (works perfectly)
3. Continue functioning normally

### Recommendation

For **production** or **full push notification support**:
- Create a development build for testing
- Use EAS Build for production builds
- Configure push notification certificates (iOS) and Firebase (Android)

For **development and testing**:
- Expo Go is sufficient
- Local notifications work perfectly
- All core features are functional

### Current Status

✅ **App is fully functional in Expo Go**
- All features work
- Local notifications work
- No critical limitations

The warning is just informing you that push notifications won't work until you use a development build.

