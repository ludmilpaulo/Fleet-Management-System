# CORS Fix for Vercel Deployment

## Issue
The sign-in page at `https://fleet-management-system-sooty.vercel.app/auth/signin` was showing "Verifying identity..." in a stuck state due to CORS policy blocking the frontend from accessing the backend API.

## Root Cause
The backend CORS settings only allowed requests from `https://fleet-management-system.vercel.app`, but not from the new deployment URL `https://fleet-management-system-sooty.vercel.app`.

## Fix Applied
Updated `fleet/apps/backend/backend/settings.py` to include the new Vercel deployment URL:

### CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.110:3000",
    "https://fleet-management-system.vercel.app",
    "https://fleet-management-system-sooty.vercel.app",  # ADDED
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "https://www.fleetia.online",
    "https://fleet-management-system.vercel.app",
    "https://fleet-management-system-sooty.vercel.app",  # ADDED
]
```

## Changes Committed
- Commit: `Add new Vercel deployment URL to CORS allowed origins`
- Status: Committed locally, ready to push

## Next Steps Required

### 1. Push the Changes
```bash
git push origin main
```

### 2. Deploy Backend Update
The backend settings need to be deployed to production. Based on the deployment configuration:

**Option A: If using PythonAnywhere (taki.pythonanywhere.com):**
- Pull the latest changes from the repository
- Restart the web application through PythonAnywhere's dashboard
- OR ssh into the server and run: `touch /var/www/your_app_wsgi.py` to trigger a reload

**Option B: If using another hosting service:**
- Deploy the updated backend code
- Restart the Django application

### 3. Verify the Fix
After deploying:
1. Go to `https://fleet-management-system-sooty.vercel.app/auth/signin`
2. Try logging in with test credentials (admin/admin123)
3. The "Verifying identity..." state should be resolved

## Testing
- Backend API: `https://www.fleetia.online/api/account/login/`
- Frontend: `https://fleet-management-system-sooty.vercel.app`
- Test credentials:
  - Admin: admin / admin123
  - Staff: staff1 / staff123

## Summary
The backend CORS configuration was blocking requests from the new Vercel deployment. By adding the deployment URL to the allowed origins, the frontend can now successfully authenticate with the backend API.

