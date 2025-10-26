# Fleet Management System - Project Review Issues

## Critical Issues Found

### 1. API Endpoint Path Mismatches

**Problem**: Multiple files use incorrect API endpoint paths

**Files affected:**
- `fleet/apps/web/src/app/login/page.tsx` (line 18, 29)
- `fleet/apps/web/src/store/authSlice.ts` (line 48, 60)

**Current (WRONG):**
```typescript
/accounts/auth/login  // Doesn't exist on backend!
/accounts/me          // Wrong path!
```

**Should be:**
```typescript
/api/account/login/   // Backend: path('api/account/', include('account.urls'))
/api/account/profile/ // Backend: path('profile/', ...)
```

**Backend URL Structure:**
```
backend/urls.py:
  path('api/account/', include('account.urls'))
  
account/urls.py:
  path('login/', views.login_view, name='login')
  path('profile/', views.UserProfileView.as_view(), name='profile')
```

**Result:** Full path = `/api/account/login/`

### 2. Authentication Token Format Inconsistency

**Problem**: Mixed usage of `Bearer` vs `Token` authentication headers

**Current state:**
- `fleet/apps/web/src/lib/auth.ts` uses: `Token ${token}` (line 97)
- `fleet/apps/web/src/lib/baseApi.ts` uses: `Bearer ${token}` (line 12)
- `fleet/apps/web/src/app/login/page.tsx` uses: `Bearer ${access}` (line 30)
- `fleet/apps/web/src/store/authSlice.ts` uses: `Bearer ${access}` (line 61)

**Backend authentication classes (settings.py line 150-152):**
```python
'DEFAULT_AUTHENTICATION_CLASSES': [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    'rest_framework.authentication.TokenAuthentication',
]
```

**Actual backend response (account/views.py line 50-56):**
```python
token, created = Token.objects.get_or_create(user=user)
return Response({
    'token': token.key,  # This is a TokenAuth token, NOT JWT!
})
```

**Correct format:** Should use `Token ${token}` everywhere since backend returns TokenAuthentication tokens, not JWT.

### 3. Configuration Issues

**Production Settings:**
- Line 26: `DEBUG = True` - **SECURITY RISK** for production
- Line 23: SECRET_KEY is hardcoded and insecure
- Lines 246-254: AWS credentials are placeholders (not real)

### 4. Response Format Mismatch

**Frontend expects (from login):**
- `{ access, refresh }` - JWT format
- `{ access }` - for profile

**Backend actually returns:**
- `{ user, token, message }` - TokenAuth format

**Files with this issue:**
- `fleet/apps/web/src/app/login/page.tsx` lines 27-28
- `fleet/apps/web/src/store/authSlice.ts` expects JWT structure

### 5. Multiple Auth Implementations

**Problem**: The project has 3 different auth implementations:

1. **`/src/app/login/page.tsx`** - Old hardcoded fetch approach
2. **`/src/app/auth/signin/page.tsx`** - Uses Redux + authAPI
3. **`/src/store/authSlice.ts`** - Old implementation with wrong paths

**Solution**: Remove duplicate implementations and use the authAPI consistently.

## Recommended Fixes

### Priority 1: Fix API Endpoints
1. Update all API calls to use correct backend paths
2. Fix authentication header format (use `Token` not `Bearer`)
3. Fix response data structure expectations

### Priority 2: Consolidate Auth
1. Remove duplicate authentication files
2. Use single authAPI throughout
3. Update Redux state to match backend response

### Priority 3: Production Hardening
1. Move DEBUG to environment variable
2. Use environment variable for SECRET_KEY
3. Set up proper AWS credentials

### Priority 4: Environment Configuration
1. Add `.env` file with proper configuration
2. Document all environment variables
3. Add `.env.example` template

## Files Requiring Updates

1. ✅ `fleet/apps/backend/backend/settings.py` - CORS fixed
2. ❌ `fleet/apps/web/src/app/login/page.tsx` - Remove or fix
3. ❌ `fleet/apps/web/src/store/authSlice.ts` - Fix endpoints
4. ❌ `fleet/apps/web/src/lib/auth.ts` - Already correct
5. ❌ `fleet/apps/web/src/lib/baseApi.ts` - Fix auth header
6. ❌ `fleet/apps/web/src/lib/api.ts` - Check for issues
7. ⚠️ Add `.env` configuration files

## Testing Checklist

- [ ] Login with admin credentials
- [ ] Login with staff credentials  
- [ ] Fetch user profile
- [ ] Logout functionality
- [ ] Token persistence across page refreshes
- [ ] CORS headers on all API requests
- [ ] Error handling for invalid credentials
- [ ] Error handling for network failures
- [ ] Redirect to login on token expiration

## Next Steps

1. Fix API endpoint paths in all files
2. Standardize authentication header format
3. Remove duplicate auth implementations
4. Test authentication flow end-to-end
5. Deploy backend CORS fix
6. Verify frontend-backend communication

