# Fleet Management System - Live Testing Guide

## 🚀 **SYSTEM STATUS**
- ✅ **Mobile App**: Metro bundler running on http://localhost:8081
- ❌ **Backend API**: Not running (Python/Django dependencies needed)
- ❌ **Web App**: Not running (Node.js dependencies needed)

## 📱 **MOBILE APP TESTING**

### **Current Status**
- Metro bundler is running successfully
- Bundle compilation is working
- Ready for device/emulator testing

### **Manual Testing Steps**

#### **1. Authentication Testing**
1. **Open Expo Go app** on your Android device/emulator
2. **Scan QR code** from Metro bundler terminal
3. **Test Login Flow**:
   - Enter username: `testuser`
   - Enter password: `testpass123`
   - Tap "Sign In"
   - Verify successful login

4. **Test Registration Flow**:
   - Tap "Don't have an account? Register"
   - Fill in registration form:
     - First Name: `Test`
     - Last Name: `User`
     - Username: `testuser_new`
     - Email: `test@example.com`
     - Password: `testpass123`
     - Confirm Password: `testpass123`
     - Role: `Driver`
   - Tap "Register"
   - Verify account creation and auto-login

5. **Test Biometric Authentication**:
   - Tap "Use Biometrics / Face ID" button
   - Follow device prompts for fingerprint/face recognition
   - Verify successful authentication

#### **2. Dashboard Testing**
1. **Verify Dashboard Loads**:
   - Check if dashboard displays after login
   - Verify user information is shown
   - Check for fleet statistics cards

2. **Test Dashboard Features**:
   - Pull down to refresh dashboard
   - Verify statistics update
   - Check quick action buttons
   - Test navigation between tabs

#### **3. Fuel Detection Testing**
1. **Access Camera**:
   - Navigate to camera screen
   - Tap camera icon or fuel detection button

2. **Test Fuel Detection**:
   - Point camera at a fuel gauge (real or mock)
   - Tap capture button
   - Wait for fuel analysis
   - Verify fuel level detection results
   - Check confidence percentage
   - Verify detected text display

3. **Test Fuel Detection Results**:
   - Verify fuel level percentage is shown
   - Check fuel status (Full/Good/Low/Critical/Empty)
   - Test "Retake" functionality
   - Test "Confirm" to save reading

#### **4. Camera Testing**
1. **Basic Camera Functions**:
   - Test front/back camera toggle
   - Test flash on/off/auto modes
   - Test zoom in/out controls
   - Test photo capture

2. **Photo Upload Testing**:
   - Capture a photo
   - Verify photo preview
   - Test "Use Photo" functionality
   - Test "Retake" functionality

#### **5. Navigation Testing**
1. **Tab Navigation**:
   - Test switching between tabs
   - Verify each tab loads correctly
   - Check for proper navigation state

2. **Screen Navigation**:
   - Test deep linking between screens
   - Verify back navigation works
   - Check for proper screen transitions

## 🌐 **WEB APP TESTING** (When Backend is Running)

### **Setup Required**
```bash
cd fleet/apps/backend
py -m pip install -r requirements.txt
py manage.py runserver 8000

cd fleet/apps/web
npm install
npm run dev
```

### **Manual Testing Steps**

#### **1. Authentication Testing**
1. **Open Web App**: Navigate to http://localhost:3000
2. **Test Login**:
   - Enter credentials
   - Verify successful login
   - Check for proper redirect to dashboard

3. **Test Registration**:
   - Click "Register" link
   - Fill registration form
   - Verify account creation

#### **2. Dashboard Testing**
1. **Verify Dashboard**:
   - Check fleet statistics display
   - Verify charts and graphs load
   - Test real-time data updates

2. **Test Fleet Management**:
   - View vehicle list
   - Test vehicle details
   - Test vehicle status updates

#### **3. Inspection Testing**
1. **Create Inspection**:
   - Start new inspection
   - Fill inspection form
   - Upload photos
   - Complete inspection

2. **View Inspections**:
   - Check inspection history
   - Filter inspections
   - View inspection details

## 🔧 **BACKEND API TESTING** (When Running)

### **API Endpoints to Test**
```bash
# Test basic endpoints
curl http://localhost:8000/api/
curl http://localhost:8000/api/account/
curl http://localhost:8000/api/fleet/
curl http://localhost:8000/api/inspections/
curl http://localhost:8000/api/issues/
curl http://localhost:8000/api/tickets/
curl http://localhost:8000/api/telemetry/

# Test authentication
curl -X POST http://localhost:8000/api/account/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Test fuel reading upload
curl -X POST http://localhost:8000/api/telemetry/fuel-readings/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "vehicle=1" \
  -F "type=fuel_level" \
  -F "image=@test-image.jpg" \
  -F "data={\"fuel_level\":75,\"confidence\":0.85}"
```

## 📊 **TEST RESULTS SUMMARY**

### **Mobile App Status**
- ✅ Metro bundler running
- ✅ Bundle compilation working
- ✅ Ready for device testing
- ⏳ Manual testing required

### **Web App Status**
- ❌ Backend not running (Python dependencies needed)
- ❌ Web app not running (Node.js dependencies needed)
- ⏳ Setup required before testing

### **Backend API Status**
- ❌ Django server not running
- ❌ Python dependencies not installed
- ⏳ Setup required before testing

## 🎯 **NEXT STEPS**

1. **For Mobile Testing**:
   - Use Expo Go app to scan QR code
   - Test all authentication features
   - Test fuel detection functionality
   - Test camera and photo upload

2. **For Web Testing**:
   - Install Python dependencies for backend
   - Install Node.js dependencies for web app
   - Start both servers
   - Test web application features

3. **For Full System Testing**:
   - Ensure all three components are running
   - Test end-to-end workflows
   - Test data synchronization between mobile and web
   - Test API integration

## 📝 **TESTING CHECKLIST**

### **Mobile App**
- [ ] Authentication (login/register)
- [ ] Biometric authentication
- [ ] Dashboard display
- [ ] Fuel detection
- [ ] Camera functionality
- [ ] Photo upload
- [ ] Navigation
- [ ] Error handling

### **Web App**
- [ ] Authentication
- [ ] Dashboard
- [ ] Fleet management
- [ ] Inspections
- [ ] Issues tracking
- [ ] Tickets management
- [ ] Data visualization

### **Backend API**
- [ ] Authentication endpoints
- [ ] Fleet management endpoints
- [ ] Inspection endpoints
- [ ] Issue tracking endpoints
- [ ] Ticket management endpoints
- [ ] Telemetry endpoints
- [ ] File upload endpoints

## 🚨 **KNOWN ISSUES**

1. **Backend Dependencies**: Python/Django not properly installed
2. **Web Dependencies**: Node.js packages may need installation
3. **Database**: May need to run migrations
4. **Environment**: May need environment variables setup

## 📞 **SUPPORT**

If you encounter issues during testing:
1. Check console logs for error messages
2. Verify all dependencies are installed
3. Ensure all services are running
4. Check network connectivity
5. Review this testing guide for proper setup steps
