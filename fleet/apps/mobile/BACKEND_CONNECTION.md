# Backend Connection Guide

## ✅ Backend Server Status

The backend server is **running** and all endpoints are **accessible**.

- **Server URL**: `http://localhost:8000`
- **API Base URL**: `http://localhost:8000/api`
- **Status**: ✅ All endpoints tested and working

## 📱 Mobile App Configuration

### For iOS Simulator / Android Emulator

The mobile app can connect directly to `localhost`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

### For Physical Device

You need to use your computer's local IP address instead of `localhost`:

1. **Find your local IP address:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Set the environment variable:**
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api
   ```
   
   Example: `http://192.168.1.110:8000/api`

3. **Create `.env` file in mobile app directory:**
   ```bash
   cd fleet/apps/mobile
   echo "EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api" > .env
   ```

4. **Restart Expo server:**
   ```bash
   npm start
   # or
   yarn start
   ```

## 🔗 API Endpoints

All endpoints are properly configured:

### Authentication
- ✅ `POST /api/account/login/` - User login
- ✅ `POST /api/account/register/` - User registration
- ✅ `POST /api/account/logout/` - User logout
- ✅ `GET /api/account/profile/` - Get user profile

### Companies
- ✅ `GET /api/companies/companies/` - List companies

### Other Endpoints
- `GET /api/fleet/` - Fleet management
- `GET /api/inspections/` - Inspections
- `GET /api/issues/` - Issues
- `GET /api/tickets/` - Tickets
- `GET /api/telemetry/` - Telemetry data

## 🔧 CORS Configuration

The backend is configured to allow all origins in development mode, so mobile app connections should work without CORS issues.

## 🧪 Testing Endpoints

Run the test script to verify all endpoints:

```bash
cd fleet/apps/backend
python3 test_endpoints.py
```

## 🐛 Troubleshooting

### Cannot connect to backend

1. **Check if backend is running:**
   ```bash
   lsof -i :8000
   ```

2. **Start the backend server:**
   ```bash
   cd fleet/apps/backend
   python3 manage.py runserver
   ```

3. **Check firewall settings** - Make sure port 8000 is not blocked

4. **Verify IP address** - Ensure you're using the correct local IP for physical devices

### Connection refused errors

- Make sure the backend server is running
- Verify the API URL in your `.env` file
- Check that your device and computer are on the same network (for physical devices)

### CORS errors

- CORS is automatically allowed in development mode
- If you see CORS errors, check the backend `settings.py` file

## 📝 Notes

- The backend server must be running before starting the mobile app
- For production, update `EXPO_PUBLIC_API_URL` to your production API URL
- The mobile app will log API calls and errors to help with debugging
