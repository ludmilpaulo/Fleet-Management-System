# Fleet Management Mobile App

A comprehensive mobile application for fleet management built with Expo React Native, TypeScript, and NativeWind.

## Features

### Core Functionality
- **Dashboard**: Overview of fleet status, active shifts, and key metrics
- **Inspections**: Guided vehicle inspections with photo capture
- **Camera**: Advanced camera functionality for inspections and documentation
- **Key Tracking**: BLE-based key tracking and management
- **Location**: GPS tracking and location services
- **Notifications**: Push notifications and alerts
- **Settings**: User preferences and app configuration

### Key Features
- **Offline-First**: Work without internet connection
- **Multi-Company Support**: Switch between different companies
- **Role-Based Access**: Different interfaces for different user roles
- **Real-Time Updates**: Live data synchronization
- **Photo Management**: Advanced photo capture and organization
- **BLE Integration**: Bluetooth Low Energy for key tracking
- **Location Services**: GPS tracking and geofencing
- **Push Notifications**: Real-time alerts and updates

## Technology Stack

- **Framework**: Expo React Native
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Camera**: Expo Camera
- **Location**: Expo Location
- **Notifications**: Expo Notifications
- **BLE**: React Native BLE PLX
- **Image Processing**: Expo Image Manipulator
- **File System**: Expo File System

## Installation

1. **Prerequisites**
   ```bash
   npm install -g @expo/cli
   npm install -g expo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Expo Dependencies**
   ```bash
   npx expo install expo-camera expo-location expo-image-manipulator expo-file-system react-native-ble-plx
   ```

## Development

### Start Development Server
```bash
 npm start
```

### Run on iOS Simulator
```bash
 npm run ios
```

### Run on Android Emulator
```bash
 npm run android
```

### Run on Physical Device
```bash
 npm run start
# Scan QR code with Expo Go app
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── dashboard/     # Dashboard screens
│   ├── inspections/   # Inspection screens
│   ├── camera/        # Camera screens
│   ├── ble/           # BLE key tracking
│   ├── location/      # Location tracking
│   ├── notifications/ # Notifications
│   └── settings/      # Settings
├── store/             # Redux store and slices
├── services/          # API services
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── constants/        # App constants
```

## Key Dependencies

### Core Dependencies
- `expo`: Expo SDK
- `react-native`: React Native framework
- `typescript`: TypeScript support
- `nativewind`: Tailwind CSS for React Native

### Navigation
- `@react-navigation/native`: Navigation library
- `@react-navigation/bottom-tabs`: Bottom tab navigation
- `@react-navigation/stack`: Stack navigation

### State Management
- `@reduxjs/toolkit`: Redux Toolkit
- `react-redux`: React Redux bindings

### Storage
- `@react-native-async-storage/async-storage`: Async storage

### Camera & Media
- `expo-camera`: Camera functionality
- `expo-image-manipulator`: Image processing
- `expo-file-system`: File system access

### Location & BLE
- `expo-location`: Location services
- `react-native-ble-plx`: Bluetooth Low Energy

### Notifications
- `expo-notifications`: Push notifications

### UI Components
- `expo-linear-gradient`: Gradient backgrounds
- `@expo/vector-icons`: Icon library

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=https://your-api-url.com
COMPANY_ID=your-company-id
```

### App Configuration
Update `app.json` for app-specific settings:
```json
{
  "expo": {
    "name": "Fleet Management",
    "slug": "fleet-management",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#667eea"
    }
  }
}
```

## Features Overview

### Dashboard
- Fleet overview with key metrics
- Active shifts and vehicles
- Quick actions and shortcuts
- Real-time status updates

### Inspections
- Guided inspection workflows
- Photo capture and organization
- Inspection templates
- Offline inspection support

### Camera
- Advanced camera controls
- Photo editing and manipulation
- Batch photo processing
- Automatic upload when online

### Key Tracking
- BLE device scanning
- Key location tracking
- Connection management
- Signal strength monitoring

### Location
- GPS tracking
- Location history
- Geofencing support
- Address resolution

### Notifications
- Push notification support
- Notification history
- Priority-based alerts
- Read/unread status

### Settings
- User preferences
- App configuration
- Company switching
- Data management

## API Integration

The app integrates with the Django REST Framework backend:

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage

### Data Synchronization
- Real-time data updates
- Offline data caching
- Conflict resolution
- Background sync

### File Upload
- Photo upload to S3-compatible storage
- Progress tracking
- Retry mechanisms
- Compression and optimization

## Offline Support

### Offline-First Architecture
- Local data storage
- Offline inspection support
- Queue-based uploads
- Conflict resolution

### Data Caching
- Inspection data caching
- Photo local storage
- Settings persistence
- User session management

## Security

### Data Protection
- Encrypted local storage
- Secure API communication
- Token-based authentication
- Role-based access control

### Privacy
- Location data privacy
- Photo metadata handling
- User data protection
- GDPR compliance

## Performance

### Optimization
- Image compression
- Lazy loading
- Memory management
- Battery optimization

### Monitoring
- Performance metrics
- Error tracking
- Usage analytics
- Crash reporting

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Building for Production

### iOS Build
```bash
expo build:ios
```

### Android Build
```bash
expo build:android
```

### App Store Deployment
```bash
expo submit:ios
expo submit:android
```

## Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Check device settings
   - Restart the app
   - Reinstall if necessary

2. **Location Services Not Working**
   - Enable location services
   - Check app permissions
   - Verify GPS settings

3. **BLE Connection Issues**
   - Enable Bluetooth
   - Check device compatibility
   - Restart Bluetooth service

4. **Push Notifications Not Received**
   - Check notification permissions
   - Verify device settings
   - Test with different devices

### Debug Mode
```bash
expo start --dev-client
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@fleetmanagement.com
- Documentation: https://docs.fleetmanagement.com
- Issues: https://github.com/your-repo/issues