# Local Testing Guide

## 🎉 Servers Are Running!

### Backend (Django) ✅
- **URL**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **Status**: Running (PID: 23648)
- **API**: http://localhost:8000/api/

### Frontend (Next.js) ✅
- **URL**: http://localhost:3000
- **Status**: Running (PID: 8160)

## Test Login API (Verified Working ✅)

The login API is working correctly:

```json
POST http://localhost:8000/api/account/login/
{
  "username": "ludmil",
  "password": "Maitland@2025"
}

Response:
{
  "user": {
    "id": 28,
    "username": "ludmil",
    "email": "ludmil@fleetia.online",
    "role": "admin",
    "company": {
      "name": "System",
      "slug": "system"
    }
  },
  "token": "8781d2089ecdfbae146e5dc57444d1cc2c08be7e",
  "message": "Login successful"
}
```

## Login Credentials

### Platform Admin
- **Username**: `ludmil`
- **Password**: `Maitland@2025`
- **Role**: Platform Super Admin
- **Company**: System

### Test Users
- **Username**: `admin` / **Password**: `admin123`
- **Username**: `staff1` / **Password**: `staff123`
- **Username**: `driver1` / **Password**: `driver123`
- **Username**: `inspector1` / **Password**: `inspector123`

## Testing Steps

### 1. Test Frontend Login
1. Open browser: http://localhost:3000/auth/signin
2. Enter credentials:
   - Username: `ludmil`
   - Password: `Maitland@2025`
3. Click "Sign In"
4. Should redirect to dashboard

### 2. Test API Directly
```bash
curl -X POST http://localhost:8000/api/account/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"ludmil\",\"password\":\"Maitland@2025\"}"
```

### 3. Test Authenticated Endpoints
```bash
# Get user profile
curl http://localhost:8000/api/account/profile/ \
  -H "Authorization: Token 8781d2089ecdfbae146e5dc57444d1cc2c08be7e"

# List companies (platform admin only)
curl http://localhost:8000/api/platform-admin/companies/ \
  -H "Authorization: Token 8781d2089ecdfbae146e5dc57444d1cc2c08be7e"
```

## API Endpoints

### Authentication
- `POST /api/account/login/` - Login
- `POST /api/account/register/` - Register
- `GET /api/account/profile/` - Get profile (authenticated)
- `PUT /api/account/profile/` - Update profile

### Platform Admin (requires super admin)
- `GET /api/platform-admin/companies/` - List all companies
- `GET /api/platform-admin/dashboard/stats/` - Platform statistics
- `GET /api/platform-admin/analytics/` - Analytics data
- `GET /api/platform-admin/users/` - List all users

### Vehicles
- `GET /api/fleet/vehicles/` - List vehicles
- `POST /api/fleet/vehicles/` - Create vehicle

### Inspections
- `GET /api/inspections/` - List inspections
- `POST /api/inspections/` - Create inspection

## Expected Behavior

### Login Flow
1. Frontend sends POST to `/api/account/login/`
2. Backend validates credentials
3. Returns user object + token
4. Frontend stores token
5. Frontend makes authenticated requests with token

### CORS Configuration
The backend allows requests from:
- http://localhost:3000 ✅
- http://127.0.0.1:3000 ✅
- https://fleet-management-system-sooty.vercel.app ✅

## Troubleshooting

### Backend not responding?
```bash
cd fleet/apps/backend
python manage.py runserver
```

### Frontend not responding?
```bash
cd fleet/apps/web
npm run dev
```

### Check if servers are running
```bash
# Check backend (port 8000)
netstat -ano | findstr :8000

# Check frontend (port 3000)
netstat -ano | findstr :3000
```

### Kill processes if needed
```bash
# Kill backend
taskkill /PID 23648 /F

# Kill frontend
taskkill /PID 8160 /F
```

## Database

SQLite database: `fleet/apps/backend/db.sqlite3`

To access:
```bash
cd fleet/apps/backend
python manage.py dbshell
```

## Environment Variables

### Frontend
Create `.env.local` in `fleet/apps/web/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Backend
Settings are in `fleet/apps/backend/backend/settings.py`

## Next Steps

1. ✅ Both servers are running
2. ✅ Login API is working
3. ⏳ Test frontend login at http://localhost:3000/auth/signin
4. ⏳ Test authenticated API calls
5. ⏳ Test platform admin features
6. ⏳ Add new companies via platform admin

## Current Status

- Backend: ✅ Running on port 8000
- Frontend: ✅ Running on port 3000  
- Database: ✅ SQLite connected
- API: ✅ Working
- Login: ✅ Verified working
- Platform Admin: ✅ User 'ludmil' is super admin

**Ready to test!** 🚀

