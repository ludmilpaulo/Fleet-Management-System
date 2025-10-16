# 🧪 Live API Testing Script - Fleet Management System

## 🎯 Testing Overview
This document outlines comprehensive testing of the Fleet Management System with the live API at `https://www.fleetia.online/`

## 📋 Pre-Testing Setup

### 1. Environment Check
```bash
# Verify API configuration
echo "Testing API connection to: https://www.fleetia.online/api"

# Check if web app builds successfully
cd fleet/apps/web
yarn build

# Start development server for testing
yarn dev
```

### 2. Test Credentials Setup
```javascript
// Test user credentials (replace with actual test account)
const testCredentials = {
  username: "test@fleetia.online",
  password: "testpassword123",
  company_slug: "test-company"
};
```

## 🔐 Authentication Testing

### Test 1: API Connectivity
```bash
curl -X GET https://www.fleetia.online/api/ \
  -H "Content-Type: application/json" \
  -v
```

**Expected Result:** HTTP 200 or 404 (API endpoint exists)

### Test 2: User Registration
```bash
curl -X POST https://www.fleetia.online/api/accounts/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser@example.com",
    "email": "testuser@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "driver",
    "company_slug": "test-company"
  }' \
  -v
```

**Expected Result:** HTTP 201 Created or 400 Bad Request (if user exists)

### Test 3: User Login
```bash
curl -X POST https://www.fleetia.online/api/accounts/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser@example.com",
    "password": "testpass123"
  }' \
  -v
```

**Expected Result:** HTTP 200 OK with token

### Test 4: Get User Profile
```bash
# Use token from login response
curl -X GET https://www.fleetia.online/api/accounts/auth/me/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Result:** HTTP 200 OK with user data

## 🚗 Vehicle Management Testing

### Test 5: List Vehicles
```bash
curl -X GET https://www.fleetia.online/api/fleet/vehicles/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Result:** HTTP 200 OK with vehicles list

### Test 6: Create Vehicle
```bash
curl -X POST https://www.fleetia.online/api/fleet/vehicles/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reg_number": "TEST123",
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "color": "White"
  }' \
  -v
```

**Expected Result:** HTTP 201 Created with vehicle data

### Test 7: Get Vehicle Details
```bash
curl -X GET https://www.fleetia.online/api/fleet/vehicles/1/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Result:** HTTP 200 OK with vehicle details

## 🔍 Inspection System Testing

### Test 8: Start Shift
```bash
curl -X POST https://www.fleetia.online/api/inspections/shifts/start/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "gps": {
      "lat": -33.9249,
      "lng": 18.4241
    }
  }' \
  -v
```

**Expected Result:** HTTP 201 Created with shift data

### Test 9: Create Inspection
```bash
curl -X POST https://www.fleetia.online/api/inspections/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": 1,
    "type": "START"
  }' \
  -v
```

**Expected Result:** HTTP 201 Created with inspection data

### Test 10: Complete Inspection with Fuel & Odometer
```bash
curl -X POST https://www.fleetia.online/api/inspections/1/complete/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PASS",
    "fuel_level": 75,
    "odometer_km": 125000,
    "fuel_level_photo": "org/1/photos/fuel_uuid",
    "odometer_photo": "org/1/photos/odometer_uuid"
  }' \
  -v
```

**Expected Result:** HTTP 200 OK with completion confirmation

## 📸 Photo Upload Testing

### Test 11: Sign Upload Request
```bash
curl -X POST https://www.fleetia.online/api/uploads/sign/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "image/jpeg"
  }' \
  -v
```

**Expected Result:** HTTP 200 OK with S3 presigned URL

### Test 12: Confirm Photo Upload
```bash
curl -X POST https://www.fleetia.online/api/uploads/confirm/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "inspection_id": 1,
    "file_key": "org/1/photos/test_photo",
    "part": "FUEL_GAUGE",
    "angle": "STRAIGHT",
    "width": 1280,
    "height": 720,
    "taken_at": "2025-01-26T10:15:00Z"
  }' \
  -v
```

**Expected Result:** HTTP 200 OK with photo confirmation

## 🎫 Ticket & Issue Management Testing

### Test 13: List Tickets
```bash
curl -X GET https://www.fleetia.online/api/tickets/tickets/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Result:** HTTP 200 OK with tickets list

### Test 14: Create Issue
```bash
curl -X POST https://www.fleetia.online/api/issues/issues/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "title": "Test Issue",
    "description": "Testing issue creation",
    "priority": "MEDIUM"
  }' \
  -v
```

**Expected Result:** HTTP 201 Created with issue data

## 🌐 Web Application Testing

### Test 15: Frontend Build Test
```bash
cd fleet/apps/web
yarn build
```

**Expected Result:** Build completes successfully without errors

### Test 16: Development Server Test
```bash
cd fleet/apps/web
yarn dev
```

**Expected Result:** Server starts on http://localhost:3000

### Test 17: Help System Test
1. Navigate to http://localhost:3000/help
2. Test search functionality
3. Test category filtering
4. Test expand/collapse help items
5. Test contact information display

**Expected Result:** Help system loads and functions correctly

### Test 18: Inspection Form Test
1. Navigate to http://localhost:3000/inspections
2. Enter vehicle ID
3. Click "Start Shift"
4. Click "Create START Inspection"
5. Test fuel level input
6. Test photo upload functionality
7. Test odometer input
8. Test form submission

**Expected Result:** Inspection form works end-to-end

### Test 19: Mobile Help Test
1. Navigate to http://localhost:3000/mobile-help
2. Test mobile-optimized interface
3. Test touch interactions
4. Test step-by-step process

**Expected Result:** Mobile help functions correctly

## 📱 Mobile Application Testing

### Test 20: Mobile Build Test
```bash
cd fleet/apps/mobile
npm install
npx expo start
```

**Expected Result:** Expo development server starts successfully

### Test 21: Mobile API Integration Test
1. Open mobile app in Expo Go
2. Test login functionality
3. Test vehicle listing
4. Test inspection creation
5. Test photo capture
6. Test data submission

**Expected Result:** Mobile app connects to API successfully

## 🔧 Error Handling Testing

### Test 22: Invalid Credentials
```bash
curl -X POST https://www.fleetia.online/api/accounts/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "invalid@example.com",
    "password": "wrongpassword"
  }' \
  -v
```

**Expected Result:** HTTP 401 Unauthorized

### Test 23: Invalid Token
```bash
curl -X GET https://www.fleetia.online/api/fleet/vehicles/ \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Result:** HTTP 401 Unauthorized

### Test 24: Network Timeout Test
```bash
# Test with very short timeout
curl -X GET https://www.fleetia.online/api/fleet/vehicles/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --max-time 1 \
  -v
```

**Expected Result:** Connection timeout handled gracefully

## 📊 Performance Testing

### Test 25: Response Time Test
```bash
# Measure API response times
time curl -X GET https://www.fleetia.online/api/fleet/vehicles/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -s -o /dev/null
```

**Expected Result:** Response time < 2 seconds

### Test 26: Concurrent Requests Test
```bash
# Test multiple simultaneous requests
for i in {1..5}; do
  curl -X GET https://www.fleetia.online/api/fleet/vehicles/ \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -s &
done
wait
```

**Expected Result:** All requests complete successfully

## 🎯 Integration Testing Checklist

### Authentication Flow
- [ ] User registration works
- [ ] User login works
- [ ] Token-based authentication works
- [ ] User profile retrieval works
- [ ] Logout functionality works

### Vehicle Management
- [ ] List vehicles works
- [ ] Create vehicle works
- [ ] Get vehicle details works
- [ ] Update vehicle works
- [ ] Delete vehicle works

### Inspection System
- [ ] Start shift works
- [ ] End shift works
- [ ] Create inspection works
- [ ] Complete inspection with fuel/odometer works
- [ ] Photo upload process works

### Help System
- [ ] Help page loads correctly
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Mobile help interface works
- [ ] Contact information displays correctly

### Error Handling
- [ ] Invalid credentials handled
- [ ] Network errors handled
- [ ] Timeout errors handled
- [ ] Validation errors displayed

### Performance
- [ ] API response times acceptable
- [ ] Concurrent requests handled
- [ ] Large data sets handled
- [ ] Photo uploads perform well

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

**Issue:** API returns 404 Not Found
**Solution:** Check API endpoint URLs and ensure server is running

**Issue:** Authentication fails
**Solution:** Verify credentials and token format

**Issue:** Photo upload fails
**Solution:** Check S3 configuration and file permissions

**Issue:** CORS errors in browser
**Solution:** Verify CORS configuration on backend

**Issue:** Slow response times
**Solution:** Check network connection and server load

## 📝 Test Results Template

```
API Testing Results - [DATE]
=============================

Authentication Tests:
- Registration: [PASS/FAIL]
- Login: [PASS/FAIL]
- Profile: [PASS/FAIL]

Vehicle Management Tests:
- List: [PASS/FAIL]
- Create: [PASS/FAIL]
- Details: [PASS/FAIL]

Inspection System Tests:
- Start Shift: [PASS/FAIL]
- Create Inspection: [PASS/FAIL]
- Complete with Photos: [PASS/FAIL]

Help System Tests:
- Web Help: [PASS/FAIL]
- Mobile Help: [PASS/FAIL]
- Search: [PASS/FAIL]

Performance Tests:
- Response Time: [SECONDS]
- Concurrent Requests: [PASS/FAIL]

Overall Status: [PASS/FAIL]
Issues Found: [LIST]
```

This comprehensive testing script ensures all functionality works correctly with the live API at https://www.fleetia.online/
