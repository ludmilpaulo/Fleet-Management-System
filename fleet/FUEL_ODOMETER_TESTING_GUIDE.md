# 🚗 Fuel Level & Odometer Photo Submission Testing Guide

## 📋 Overview
This guide covers comprehensive testing of the enhanced vehicle inspection system that includes fuel level and odometer readings with mandatory photo capture.

## 🎯 Core Features to Test

### 1. Photo Submission Requirements
- **Fuel Level Photo**: Clear image of fuel gauge showing percentage
- **Odometer Photo**: Clear image of odometer display showing kilometers
- **File Validation**: Proper image format acceptance/rejection
- **Upload Process**: S3 presigned URL workflow

### 2. Data Validation
- **Fuel Level**: 0-100% range validation
- **Odometer**: Positive number validation
- **Required Fields**: Both readings and photos mandatory

## 🧪 Testing Scenarios

### Desktop Web Application Testing

#### Scenario 1: Complete Inspection Flow
```
1. Navigate to /inspections
2. Enter Vehicle ID
3. Click "Start Shift"
4. Click "Create START Inspection"
5. Verify inspection form loads
6. Enter fuel level (e.g., 75%)
7. Upload fuel gauge photo
8. Enter odometer reading (e.g., 125000 KM)
9. Upload odometer photo
10. Set status to "PASS"
11. Click "Complete Inspection"
12. Verify success message
```

#### Scenario 2: Validation Testing
```
1. Try submitting without fuel level → Should show error
2. Try submitting without odometer → Should show error
3. Try submitting without photos → Should disable submit button
4. Try fuel level > 100 → Should show validation error
5. Try negative odometer → Should show validation error
6. Try uploading non-image file → Should reject
```

#### Scenario 3: Photo Upload Testing
```
1. Upload large image (>10MB) → Test performance
2. Upload small image (<100KB) → Verify quality
3. Upload different formats (JPG, PNG, WebP) → Test compatibility
4. Test photo preview functionality
5. Test photo removal functionality
6. Test retake photo functionality
```

### Mobile Application Testing

#### Scenario 4: Mobile-Optimized Flow
```
1. Open app on mobile device
2. Navigate to inspections
3. Start shift with vehicle ID
4. Create inspection
5. Verify mobile form loads (3-step process)
6. Complete Step 1: Fuel level and photo
7. Complete Step 2: Odometer and photo
8. Complete Step 3: Review and submit
9. Verify mobile-specific UI elements
10. Test touch interactions
```

#### Scenario 5: Mobile Camera Testing
```
1. Test camera capture functionality
2. Test photo gallery selection
3. Test photo preview on mobile
4. Test photo quality on different screen sizes
5. Test landscape/portrait orientation
6. Test camera permissions
```

## 🔧 Technical Testing

### API Endpoints Testing

#### Upload Flow Testing
```bash
# Test upload signing
curl -X POST http://localhost:8000/uploads/sign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"contentType": "image/jpeg"}'

# Test photo confirmation
curl -X POST http://localhost:8000/uploads/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "inspection_id": 123,
    "file_key": "org/1/photos/uuid",
    "part": "FUEL_GAUGE",
    "angle": "STRAIGHT",
    "width": 1280,
    "height": 720,
    "taken_at": "2025-01-26T10:15:00Z"
  }'

# Test inspection completion with photos
curl -X POST http://localhost:8000/inspections/123/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "PASS",
    "fuel_level": 75,
    "odometer_km": 125000,
    "fuel_level_photo": "org/1/photos/fuel_uuid",
    "odometer_photo": "org/1/photos/odometer_uuid"
  }'
```

### Database Verification
```sql
-- Verify inspection record
SELECT id, status, fuel_level, odometer_km, fuel_level_photo, odometer_photo 
FROM inspections 
WHERE id = 123;

-- Verify photo records
SELECT id, inspection_id, part, file_key, width, height 
FROM photos 
WHERE inspection_id = 123;
```

## 📱 Device-Specific Testing

### iOS Testing
```
Devices: iPhone 12, iPhone 13, iPhone 14, iPad
Browsers: Safari, Chrome
OS Versions: iOS 15, iOS 16, iOS 17
Camera: Test both front and back cameras
Storage: Test with low storage scenarios
```

### Android Testing
```
Devices: Samsung Galaxy S21, Google Pixel 6, OnePlus 9
Browsers: Chrome, Firefox, Samsung Internet
OS Versions: Android 11, Android 12, Android 13
Camera: Test different camera apps
Permissions: Test camera/storage permissions
```

### Desktop Testing
```
Browsers: Chrome, Firefox, Safari, Edge
OS: Windows 10/11, macOS, Linux
Screen Sizes: 1920x1080, 1366x768, 2560x1440
File Upload: Test drag-and-drop functionality
```

## 🚨 Error Handling Testing

### Network Issues
```
1. Test with slow internet connection
2. Test with intermittent connectivity
3. Test upload timeout scenarios
4. Test retry mechanisms
5. Test offline functionality
```

### File System Issues
```
1. Test with full storage
2. Test with corrupted files
3. Test with unsupported formats
4. Test with very large files
5. Test with empty files
```

### Permission Issues
```
1. Test without camera permission
2. Test without storage permission
3. Test with restricted permissions
4. Test permission denial scenarios
5. Test permission recovery
```

## 📊 Performance Testing

### Upload Performance
```
1. Test upload speed with different file sizes
2. Test concurrent uploads
3. Test upload progress indicators
4. Test upload cancellation
5. Test upload resumption
```

### UI Performance
```
1. Test form loading time
2. Test photo preview performance
3. Test form validation speed
4. Test submission response time
5. Test navigation smoothness
```

## 🔍 Visual Testing

### Photo Quality Verification
```
1. Verify fuel gauge is clearly visible
2. Verify odometer numbers are readable
3. Verify photo orientation is correct
4. Verify photo compression doesn't affect readability
5. Verify photo metadata is preserved
```

### UI/UX Testing
```
1. Verify form layout on different screen sizes
2. Verify button accessibility
3. Verify error message clarity
4. Verify loading states
5. Verify success feedback
```

## 📋 Test Checklist

### Pre-Testing Setup
- [ ] Backend API is running
- [ ] Database is accessible
- [ ] S3/MinIO storage is configured
- [ ] Test vehicles are created
- [ ] Test user accounts are available
- [ ] Camera permissions are granted

### Core Functionality
- [ ] Fuel level input validation
- [ ] Odometer input validation
- [ ] Photo upload functionality
- [ ] Photo preview functionality
- [ ] Form submission process
- [ ] Success confirmation

### Edge Cases
- [ ] Invalid input handling
- [ ] Missing photo handling
- [ ] Network error handling
- [ ] Permission error handling
- [ ] Storage error handling

### Cross-Platform
- [ ] Desktop browser compatibility
- [ ] Mobile browser compatibility
- [ ] iOS device testing
- [ ] Android device testing
- [ ] Different screen sizes

### Performance
- [ ] Upload speed testing
- [ ] Form responsiveness
- [ ] Memory usage monitoring
- [ ] Battery usage (mobile)
- [ ] Network usage monitoring

## 🐛 Common Issues & Solutions

### Issue: Photos not uploading
**Solution**: Check S3 credentials, network connectivity, file size limits

### Issue: Form validation not working
**Solution**: Verify input type attributes, JavaScript validation logic

### Issue: Mobile camera not opening
**Solution**: Check camera permissions, browser compatibility

### Issue: Photos appearing blurry
**Solution**: Verify camera settings, compression settings

### Issue: Form submission failing
**Solution**: Check API endpoints, authentication, data format

## 📈 Success Metrics

### Functional Metrics
- [ ] 100% of inspections include fuel level photo
- [ ] 100% of inspections include odometer photo
- [ ] 0% validation errors on valid inputs
- [ ] 100% successful uploads for valid images

### Performance Metrics
- [ ] Photo upload < 30 seconds for 5MB image
- [ ] Form submission < 5 seconds
- [ ] Mobile form loads < 3 seconds
- [ ] Desktop form loads < 2 seconds

### User Experience Metrics
- [ ] Intuitive form flow
- [ ] Clear error messages
- [ ] Responsive design
- [ ] Accessible interface

## 🎯 Testing Priority

### High Priority (Must Test)
1. Photo upload functionality
2. Data validation
3. Form submission
4. Mobile compatibility

### Medium Priority (Should Test)
1. Performance optimization
2. Error handling
3. Cross-browser compatibility
4. Edge cases

### Low Priority (Nice to Test)
1. Advanced camera features
2. Photo editing capabilities
3. Batch upload functionality
4. Analytics integration

---

## 📞 Support & Escalation

If issues are found during testing:
1. Document the exact steps to reproduce
2. Capture screenshots/videos
3. Note device/browser information
4. Check browser console for errors
5. Verify network requests in dev tools
6. Escalate to development team with full context

This testing guide ensures comprehensive validation of the fuel level and odometer photo submission functionality across all platforms and scenarios.
