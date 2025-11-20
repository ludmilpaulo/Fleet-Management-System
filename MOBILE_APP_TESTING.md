# Mobile App Testing Guide

## Prerequisites

1. **Backend Running**: Ensure Django backend is running on `http://localhost:8000` or accessible network
2. **Expo Go**: Install Expo Go app on iOS/Android device
3. **Network**: Device and computer on same network (or use tunnel)

## Setup

```bash
cd fleet/apps/mobile
npm install
npm start
```

## Testing Different User Roles

### 1. Admin Role
**Credentials**: `admin` / `admin123`

**Expected Features**:
- ✅ Admin dashboard with full statistics
- ✅ Access to all tabs (Dashboard, Vehicles, Drivers, Reports, Profile)
- ✅ Full management capabilities

### 2. Driver Role
**Credentials**: `driver1` / `driver123`

**Expected Features**:
- ✅ Driver dashboard with assigned vehicle info
- ✅ Current route information
- ✅ Fuel level and odometer
- ✅ Maintenance requests
- ✅ Shift management
- ✅ Location tracking

### 3. Staff Role
**Credentials**: `staff1` / `staff123`

**Expected Features**:
- ✅ Staff dashboard with fleet overview
- ✅ User management (limited)
- ✅ Vehicle viewing
- ✅ Maintenance management
- ✅ Reports access

### 4. Inspector Role
**Credentials**: `inspector1` / `inspector123`

**Expected Features**:
- ✅ Inspector dashboard
- ✅ Inspection management
- ✅ Vehicle viewing
- ✅ Camera for photos
- ✅ Reports

## Test Scenarios

### Authentication Flow
1. Open app
2. Sign in with test credentials
3. Verify redirect to role-specific dashboard
4. Test sign out

### Location Tracking
1. Navigate to Location screen
2. Request location permissions
3. Verify current location is displayed
4. Check address reverse geocoding
5. Verify location history

### Camera/Inspections
1. Navigate to Inspection screen
2. Start new inspection
3. Take photos of vehicle parts
4. Complete inspection checklist
5. Submit inspection

### Offline Mode
1. Turn off network
2. Verify app still functions
3. Check data caching
4. Turn network back on
5. Verify sync

### Biometric Login
1. Sign in successfully
2. Enable biometric login
3. Sign out
4. Sign in using biometric
5. Verify auto-login works

## Mobile App Structure

```
fleet/apps/mobile/
├── src/
│   ├── screens/
│   │   ├── auth/        # Sign In, Sign Up
│   │   ├── dashboard/   # Role-based dashboards
│   │   ├── inspection/  # Inspection screens
│   │   └── location/    # Location tracking
│   ├── navigation/      # Navigation setup
│   └── store/           # Redux store
└── App.tsx              # Main app entry
```

## Test Checklist

- [ ] App starts without errors
- [ ] Authentication works for all roles
- [ ] Navigation is role-appropriate
- [ ] Dashboard displays correctly
- [ ] Location tracking works
- [ ] Camera functionality works
- [ ] Data syncs with backend
- [ ] Offline mode works (if implemented)
- [ ] Biometric login works (if enabled)
- [ ] Push notifications work (if configured)

## Common Issues

1. **Connection Refused**: Check backend URL in mobile app config
2. **CORS Errors**: Ensure backend CORS settings allow mobile app origin
3. **Location Permissions**: Grant location permissions in device settings
4. **Camera Not Working**: Check device camera permissions

## Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Driver | driver1 | driver123 |
| Staff | staff1 | staff123 |
| Inspector | inspector1 | inspector123 |

