# Troubleshooting Guide

## Issue Fixed: Missing tailwindcss-animate Package

### Problem
```
Module not found: Can't resolve 'tailwindcss-animate'
```

### Solution
```bash
cd fleet/apps/web
npm install tailwindcss-animate
```

### Status: ✅ Fixed
The package has been installed and the frontend should now work correctly.

## Server Status

### Backend (Port 8000)
- Status: ✅ Running
- Process: PID 23648
- URL: http://localhost:8000
- Admin: http://localhost:8000/admin/
- API: http://localhost:8000/api/

### Frontend 
- Status: ✅ Running
- Port: 3001 (or 3000)
- URL: http://localhost:3001 (or 3000)
- First instance on port 3000 (PID: 8160)
- Second instance on port 3001

### Login
- URL: http://localhost:3001/auth/signin (or 3000)
- Username: ludmil
- Password: Maitland@2025

## Common Issues

### 1. Port Already in Use

**Symptom**: Next.js says "Port 3000 is in use"

**Solution**: 
- Close the existing server
- Or let Next.js use port 3001 (which it already did)
- Access: http://localhost:3001

**Kill process**:
```bash
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <pid> /F
```

### 2. Missing Dependencies

**Symptom**: "Module not found" errors

**Solution**:
```bash
cd fleet/apps/backend
pip install -r requirements.txt

cd fleet/apps/web
npm install
```

### 3. Database Issues

**Symptom**: Migration errors or database locked

**Solution**:
```bash
cd fleet/apps/backend
python manage.py makemigrations
python manage.py migrate
```

### 4. CORS Errors

**Symptom**: Frontend can't connect to backend

**Solution**: Check `backend/settings.py` includes:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",  # Add this if using port 3001
    "http://127.0.0.1:3000",
    "https://fleet-management-system-sooty.vercel.app",
]
```

### 5. Authentication Token Issues

**Symptom**: 401 Unauthorized errors

**Solution**: 
- Check token is being sent with "Token" prefix (not "Bearer")
- Token should be in Authorization header: `Token <token>`
- Generate new token if needed

### 6. Environment Variables

**Frontend**: Check for `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend**: Settings in `backend/settings.py`

## Testing Checklist

- [x] Backend running on port 8000
- [x] Frontend running on port 3001
- [x] Login API working
- [x] Missing package installed
- [ ] Frontend login page loads
- [ ] Can successfully login
- [ ] Dashboard loads after login
- [ ] API calls work with token

## Restarting Servers

### Backend
```bash
cd fleet/apps/backend
python manage.py runserver
```

### Frontend
```bash
cd fleet/apps/web
npm run dev
```

## Stopping Servers

### Find Processes
```bash
# Backend (port 8000)
netstat -ano | findstr :8000

# Frontend (port 3000 or 3001)
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Kill Processes
```bash
taskkill /PID <process_id> /F
```

## Current Configuration

- Backend: Python Django
- Frontend: Next.js 15 with Turbopack
- Database: SQLite
- Authentication: Token-based
- Ports: 8000 (backend), 3000/3001 (frontend)

## Next Steps After Fix

1. Wait for frontend to recompile (should happen automatically)
2. Visit http://localhost:3001
3. Navigate to /auth/signin
4. Login with ludmil / Maitland@2025
5. Test platform admin features

