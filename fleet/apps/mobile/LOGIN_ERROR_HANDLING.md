# Mobile Login Error Handling - Implementation Guide

## Overview

The mobile app now provides **specific, user-friendly error messages** for different login failure scenarios.

## Error Types Handled

### 1. **Username/Email Not Found**
- **Backend Message**: `"Username or email does not exist. Please check and try again."`
- **User Alert**: 
  - Title: "Account Not Found"
  - Message: Explains the account doesn't exist and offers to register
  - Actions: "Try Again" or "Register" buttons

### 2. **Incorrect Password**
- **Backend Message**: `"Incorrect password. Please try again or use Forgot Password."`
- **User Alert**:
  - Title: "Incorrect Password"
  - Message: Explains password is wrong and suggests contacting administrator
  - Actions: "OK" or "Forgot Password?" button

### 3. **Account Disabled**
- **Backend Message**: `"Your account has been disabled. Please contact support."`
- **User Alert**:
  - Title: "Account Disabled"
  - Message: Explains account is disabled and suggests contacting support
  - Actions: "OK" button

### 4. **Network Error**
- **Detected**: When connection fails or backend is unreachable
- **User Alert**:
  - Title: "Connection Error"
  - Message: Checklist of things to verify (internet, server running, same network)
  - Actions: "OK" button

## Implementation Details

### Backend (Django REST Framework)

**File**: `fleet/apps/backend/account/serializers.py`

The `UserLoginSerializer.validate()` method:
1. Tries to find user by **username first**, then by **email**
2. Checks password correctness
3. Verifies account is active
4. Returns specific error messages for each case

**Error Response Format**:
```json
{
  "non_field_errors": [
    "Username or email does not exist. Please check and try again."
  ]
}
```

### Mobile App - AuthService

**File**: `fleet/apps/mobile/src/services/authService.ts`

The `login()` method:
1. Parses Django REST Framework error responses
2. Detects error type by analyzing error message
3. Attaches `errorType` to Error object for UI handling
4. Handles network errors separately

**Error Detection**:
- Checks `errorData.detail` (single error)
- Checks `errorData.non_field_errors` (DRF validation errors)
- Checks for specific keywords: "does not exist", "password", "disabled"
- Categorizes as: `username_not_found`, `incorrect_password`, `account_disabled`, `network_error`

### Mobile App - UI Components

**Files**:
- `fleet/apps/mobile/src/screens/auth/AuthScreen.tsx` (Legacy auth screen)
- `fleet/apps/mobile/src/screens/auth/SignInScreen.tsx` (New sign-in screen)

Both screens:
1. Catch login errors
2. Extract `errorType` from error object
3. Display specific alerts based on error type
4. Provide actionable buttons (e.g., "Register" for not found, "Forgot Password" for wrong password)

## User Experience Flow

### Scenario 1: Username Doesn't Exist
1. User enters non-existent username
2. Backend returns: `"Username or email does not exist..."`
3. Mobile app detects: `errorType = 'username_not_found'`
4. User sees: "Account Not Found" alert with "Register" option

### Scenario 2: Wrong Password
1. User enters correct username but wrong password
2. Backend returns: `"Incorrect password..."`
3. Mobile app detects: `errorType = 'incorrect_password'`
4. User sees: "Incorrect Password" alert with "Forgot Password?" option

### Scenario 3: Account Disabled
1. User enters correct credentials but account is inactive
2. Backend returns: `"Your account has been disabled..."`
3. Mobile app detects: `errorType = 'account_disabled'`
4. User sees: "Account Disabled" alert with contact support message

### Scenario 4: Network Issue
1. Mobile app cannot reach backend server
2. Network error detected
3. Mobile app detects: `errorType = 'network_error'`
4. User sees: "Connection Error" alert with troubleshooting checklist

## Testing

### Test Cases

1. **Invalid Username**:
   ```
   Username: nonexistent_user
   Password: any
   Expected: "Account Not Found" alert
   ```

2. **Valid Username, Wrong Password**:
   ```
   Username: admin
   Password: wrongpassword
   Expected: "Incorrect Password" alert
   ```

3. **Disabled Account**:
   ```
   Username: disabled_user (if exists)
   Password: correct_password
   Expected: "Account Disabled" alert
   ```

4. **Network Error**:
   - Stop backend server
   - Try to login
   - Expected: "Connection Error" alert

5. **Valid Login**:
   ```
   Username: admin
   Password: correct_password
   Expected: Success, navigate to dashboard
   ```

## Code Locations

### Backend
- **Serializer**: `fleet/apps/backend/account/serializers.py` (line ~86-110)
- **View**: `fleet/apps/backend/account/views.py` (line ~85-105)

### Mobile App
- **Service**: `fleet/apps/mobile/src/services/authService.ts` (line ~59-147)
- **Redux**: `fleet/apps/mobile/src/store/slices/authSlice.ts` (line ~28-51)
- **UI - Legacy**: `fleet/apps/mobile/src/screens/auth/AuthScreen.tsx` (line ~70-121)
- **UI - New**: `fleet/apps/mobile/src/screens/auth/SignInScreen.tsx` (line ~59-149)

## Benefits

✅ **Better UX**: Users know exactly what went wrong
✅ **Actionable**: Alerts provide next steps (register, contact admin, etc.)
✅ **Professional**: Specific error messages build trust
✅ **Accessible**: Clear, non-technical language

## Future Enhancements

- Add "Forgot Password" screen navigation
- Add retry mechanism for network errors
- Add "Remember Me" functionality
- Add rate limiting feedback (too many attempts)

---

**Last Updated**: Login error handling with specific user feedback implemented

