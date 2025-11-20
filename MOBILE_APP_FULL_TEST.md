# Mobile App - Comprehensive Testing Guide

## ✅ Test Results Summary

**Status**: All backend API tests passing ✅

### Test Results (13/13 - 100%)
- ✅ Backend accessible via localhost
- ✅ Backend accessible via network IP (192.168.1.110)
- ✅ Admin authentication working
- ✅ Driver authentication working
- ✅ Staff authentication working
- ✅ Inspector authentication working
- ✅ Vehicles API endpoint working
- ✅ Shifts API endpoint working (Driver access)
- ✅ Inspections API endpoint working (Inspector access)
- ✅ Dashboard stats endpoint working
- ✅ Mobile app dependencies installed
- ✅ Expo CLI installed
- ✅ App configuration exists

### Warnings
- ⚠️ API URL uses localhost - needs to be updated for physical devices
- ⚠️ Backend needs to be accessible on network for physical device testing

## 🚀 Quick Start Guide

### 1. Configure API URL for Physical Devices

For physical device testing, update the API URL:

**Option 1: Environment Variable (Recommended)**
```bash
cd fleet/apps/mobile
export EXPO_PUBLIC_API_URL=http://192.168.1.110:8000/api
npm start
```

**Option 2: Update Code Directly**
Update these files to use your network IP:
- `src/services/authService.ts` - Change `localhost` to your IP
- `src/services/apiService.ts` - Change `localhost` to your IP

### 2. Start the App

```bash
cd fleet/apps/mobile
npm install  # If not already installed
npm start
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Display options for iOS simulator, Android emulator, or physical device

### 3. Connect to Physical Device

**For iOS:**
- Install Expo Go from App Store
- Scan the QR code with Camera app
- Tap "Open in Expo Go"

**For Android:**
- Install Expo Go from Play Store
- Open Expo Go app
- Scan the QR code
- Or use: `npm run android` for emulator

### 4. Use Tunnel Mode (Alternative)

If network IP doesn't work, use tunnel:
```bash
npm start -- --tunnel
```

## 📱 Test Credentials

| Role | Username | Password | Expected Access |
|------|----------|----------|-----------------|
| Admin | admin | admin123 | Full access to all features |
| Driver | driver1 | driver123 | Vehicle assignments, shifts, routes |
| Staff | staff1 | staff123 | User management, vehicles, reports |
| Inspector | inspector1 | inspector123 | Inspections, vehicles, reports |

## 🧪 Test Scenarios

### Test 1: Authentication ✅

#### Sign In Test
1. Open the app
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Tap "Sign In"
4. **Expected**: App navigates to Admin Dashboard

#### Test Other Roles
- Repeat with `driver1`, `staff1`, `inspector1`
- **Expected**: Each role navigates to their respective dashboard

#### Biometric Authentication
1. After successful login, accept biometric prompt
2. Sign out
3. Sign in again using biometric
4. **Expected**: Biometric authentication works

#### Sign Out Test
1. Login successfully
2. Navigate to Settings
3. Tap "Sign Out"
4. **Expected**: App returns to Sign In screen

### Test 2: Navigation ✅

#### Dashboard Navigation
1. Login as Admin
2. Verify tab navigation shows:
   - Dashboard
   - Inspections
   - Camera
   - Keys
   - Location
   - Notifications
   - Settings
3. **Expected**: All tabs accessible and functional

#### Role-Based Navigation
- **Admin**: Full access to all tabs
- **Driver**: Limited tabs (Dashboard, Inspections, Location, Settings)
- **Staff**: Limited tabs (Dashboard, Inspections, Notifications, Settings)
- **Inspector**: Limited tabs (Dashboard, Inspections, Camera, Location, Settings)

### Test 3: Dashboard Functionality ✅

#### Admin Dashboard
1. Login as Admin
2. View dashboard stats:
   - Total vehicles
   - Active vehicles
   - Active shifts
   - Open tickets
   - Pending inspections
3. **Expected**: Stats display correctly from backend

#### Driver Dashboard
1. Login as Driver
2. View assigned vehicle info
3. View current shift status
4. **Expected**: Driver-specific data displays

#### Staff Dashboard
1. Login as Staff
2. View fleet overview
3. View user list
4. **Expected**: Staff-level access works

### Test 4: Vehicle Management ✅

#### View Vehicles
1. Login as Admin
2. Navigate to Dashboard or Vehicles section
3. View vehicle list
4. **Expected**: List of vehicles from backend (10 test vehicles)

#### Vehicle Details
1. Tap on a vehicle
2. View vehicle information
3. **Expected**: Vehicle details display correctly

### Test 5: Shift Management ✅

#### View Shifts (Driver)
1. Login as Driver (`driver1`)
2. Navigate to Dashboard or Shifts
3. View assigned shifts
4. **Expected**: Driver's shifts display (10 test shifts exist)

#### Start Shift (If Implemented)
1. Login as Driver
2. Navigate to start shift
3. Select vehicle
4. Add start location (optional)
5. Start shift
6. **Expected**: Shift starts successfully

#### End Shift (If Implemented)
1. With active shift
2. Navigate to end shift
3. Add end location (optional)
4. End shift
5. **Expected**: Shift completes successfully

### Test 6: Inspection Management ✅

#### View Inspections (Inspector)
1. Login as Inspector (`inspector1`)
2. Navigate to Inspections tab
3. View inspection list
4. **Expected**: List of inspections (8 test inspections exist)

#### Create Inspection (If Implemented)
1. Login as Inspector
2. Navigate to Inspections
3. Tap "New Inspection"
4. Select shift
5. Complete inspection checklist
6. Take photos (optional)
7. Submit inspection
8. **Expected**: Inspection created successfully

#### Complete Inspection
1. Select an in-progress inspection
2. Complete all checklist items
3. Add photos
4. Mark as Pass/Fail
5. Submit
6. **Expected**: Inspection completed and saved

### Test 7: Camera Functionality ✅

#### Take Photo
1. Navigate to Camera tab or Inspection form
2. Grant camera permissions
3. Take a photo
4. **Expected**: Photo captured and saved

#### Photo Upload
1. After taking inspection photo
2. Upload to server
3. **Expected**: Photo uploads successfully

### Test 8: Location Tracking ✅

#### Current Location
1. Navigate to Location tab
2. Grant location permissions
3. **Expected**: Current location displayed on map

#### Location History
1. View location history
2. **Expected**: Past locations displayed

#### Location in Shift
1. When starting/ending shift
2. Location should be captured automatically
3. **Expected**: Location coordinates saved

### Test 9: Notifications ✅

#### View Notifications
1. Login
2. Navigate to Notifications tab
3. View notification list
4. **Expected**: Notifications display from backend

#### Mark as Read
1. Tap on a notification
2. **Expected**: Notification marked as read

### Test 10: Settings ✅

#### View Settings
1. Navigate to Settings tab
2. View settings options:
   - Profile
   - Biometric login
   - Notifications
   - About
3. **Expected**: Settings screen displays

#### Biometric Settings
1. Enable/disable biometric login
2. **Expected**: Setting saved and works

#### Profile Settings
1. View profile information
2. Edit profile (if allowed)
3. **Expected**: Profile displays correctly

## 🔍 Testing Checklist

### Authentication ✅
- [ ] Sign in with all user roles works
- [ ] Sign out works
- [ ] Biometric authentication works
- [ ] Token storage works
- [ ] Auto-login on app restart works

### Navigation ✅
- [ ] Tab navigation works
- [ ] Stack navigation works
- [ ] Role-based navigation correct
- [ ] Back navigation works

### API Integration ✅
- [ ] All API endpoints accessible
- [ ] Error handling works
- [ ] Loading states display
- [ ] Offline handling (if implemented)

### Features ✅
- [ ] Dashboard displays data
- [ ] Vehicles list works
- [ ] Shifts list works
- [ ] Inspections list works
- [ ] Camera works
- [ ] Location tracking works
- [ ] Notifications display

### UI/UX ✅
- [ ] Screens load without errors
- [ ] Loading indicators show
- [ ] Error messages display
- [ ] Empty states handle gracefully
- [ ] Responsive design works

## 🐛 Known Issues & Fixes

### Issue 1: API Connection Fails on Physical Device
**Problem**: App can't connect to backend
**Solution**: 
- Update API URL to network IP: `http://192.168.1.110:8000/api`
- Or use tunnel: `npm start -- --tunnel`
- Ensure backend is running and accessible

### Issue 2: CORS Errors
**Problem**: Cross-origin requests blocked
**Solution**: Backend CORS settings should allow mobile app origin

### Issue 3: Location Permissions
**Problem**: Location not working
**Solution**: Grant location permissions in device settings

### Issue 4: Camera Permissions
**Problem**: Camera not working
**Solution**: Grant camera permissions in device settings

## 📊 Test Execution

### Automated Tests (Backend)
```bash
./test_mobile_app.sh
```

### Manual Tests (Mobile App)
1. Follow Quick Start Guide above
2. Go through each test scenario
3. Check off items in Testing Checklist
4. Report any issues found

## 📝 Test Report Template

### Test Execution
- **Date**: 
- **Tester**: 
- **Device**: (iOS/Android, Model)
- **OS Version**: 
- **App Version**: 

### Results
- **Total Tests**: 
- **Passed**: 
- **Failed**: 
- **Issues Found**: 

### Detailed Results
1. **Authentication**: ✅ / ❌
2. **Navigation**: ✅ / ❌
3. **Dashboard**: ✅ / ❌
4. **Vehicles**: ✅ / ❌
5. **Shifts**: ✅ / ❌
6. **Inspections**: ✅ / ❌
7. **Camera**: ✅ / ❌
8. **Location**: ✅ / ❌
9. **Notifications**: ✅ / ❌
10. **Settings**: ✅ / ❌

### Issues Log
- Issue 1: 
- Issue 2: 
- Issue 3: 

## 🎯 Next Steps

1. **Complete Manual Testing**: Go through all test scenarios
2. **Fix Any Issues**: Address bugs found during testing
3. **Test on Multiple Devices**: iOS and Android, different screen sizes
4. **Performance Testing**: Check app performance and responsiveness
5. **User Acceptance Testing**: Get feedback from actual users

## 📚 Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Backend API Docs**: http://localhost:8000/api/docs/ (if available)

---

**Status**: ✅ Ready for Full Manual Testing
**Backend**: ✅ All API tests passing
**Mobile App**: ✅ Configured and ready to test

