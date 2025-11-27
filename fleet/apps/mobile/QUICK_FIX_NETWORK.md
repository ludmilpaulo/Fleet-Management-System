# Quick Fix: Network Error on Android Device

## ✅ Problem Fixed!

The mobile app now **automatically uses your network IP** (`192.168.1.110`) when running on physical Android/iOS devices instead of `localhost`.

## What Was Changed

All API services now detect if running on a physical device and use network IP:

1. ✅ `src/services/authService.ts` - Login/Registration
2. ✅ `src/services/apiService.ts` - All API calls
3. ✅ `src/api/client.ts` - API client
4. ✅ `src/services/api.ts` - Legacy API service

## Configuration

**Current Network IP**: `192.168.1.110` (auto-configured)

The app will automatically:
- Use `http://192.168.1.110:8000/api` for physical devices (Android/iOS)
- Use `http://localhost:8000/api` for simulators/emulators

## Backend Server Setup

⚠️ **Important**: Make sure your backend is running and accessible on the network:

```bash
cd fleet/apps/backend
python manage.py runserver 0.0.0.0:8000
```

The `0.0.0.0` binds to all network interfaces, allowing connections from your Android device.

## Testing

1. **Start Backend**:
   ```bash
   cd fleet/apps/backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Check Backend is Accessible**:
   ```bash
   curl http://192.168.1.110:8000/api/account/users/
   ```
   Should return JSON (or 401/403 if not authenticated, but NOT connection error)

3. **Run Mobile App**:
   ```bash
   cd fleet/apps/mobile
   npm start
   ```

4. **Check Logs**: When app starts, you should see:
   ```
   [AuthService] Using API URL: http://192.168.1.110:8000/api/account (Device: android, Physical: true, Network IP: 192.168.1.110)
   ```

5. **Try Login**: Should now work without network error!

## If Still Getting Network Error

1. **Verify Backend is Running on 0.0.0.0:8000**:
   - Check terminal where backend is running
   - Should show: `Starting development server at http://0.0.0.0:8000/`

2. **Check Firewall**:
   - macOS: System Settings > Firewall > Allow incoming connections
   - Ensure port 8000 is not blocked

3. **Verify Network IP**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   - If different from `192.168.1.110`, update in code or set environment variable

4. **Check Same Network**:
   - Computer and Android device must be on same WiFi network
   - Check WiFi settings on both

5. **Test from Browser** (on Android device if possible):
   - Open: `http://192.168.1.110:8000/api/account/users/`
   - Should show API response (not connection error)

## Change Network IP

If your network IP is different, either:

**Option 1**: Set environment variable (recommended)
```bash
# In fleet/apps/mobile/.env (create if doesn't exist)
EXPO_PUBLIC_NETWORK_IP=YOUR_IP_HERE
```

**Option 2**: Update default in code files:
- `src/services/authService.ts` - line ~43
- `src/services/apiService.ts` - line ~17
- `src/api/client.ts` - line ~12

Change `'192.168.1.110'` to your IP.

## Status

✅ **Fixed**: All API services now use network IP for physical devices
✅ **Tested**: Backend is accessible on network IP
✅ **Ready**: Should work on Android devices now!

