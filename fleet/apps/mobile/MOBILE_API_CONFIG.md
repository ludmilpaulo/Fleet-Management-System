# Mobile App - API Configuration for Physical Devices

## Network Connection Issue

When running the mobile app on a **physical Android/iOS device**, the app cannot connect to `localhost:8000` because `localhost` on the device refers to the device itself, not your development machine.

## ✅ Solution Implemented

The mobile app now **automatically detects** if it's running on a physical device and uses your network IP address instead of `localhost`.

### Current Configuration

- **Network IP**: `192.168.1.110` (auto-detected from your machine)
- **Backend Port**: `8000`
- **API Base**: `http://192.168.1.110:8000/api`

### How It Works

1. **Environment Variable Check**: First checks `EXPO_PUBLIC_API_URL`
2. **Physical Device Detection**: Detects if running on iOS/Android device
3. **Auto Network IP**: Uses network IP (`192.168.1.110`) for physical devices
4. **Localhost Fallback**: Uses `localhost` for simulators/emulators

### Updated Files

✅ `src/services/authService.ts` - Auto-detects network IP
✅ `src/services/apiService.ts` - Auto-detects network IP  
✅ `src/api/client.ts` - Auto-detects network IP

## Configuration Options

### Option 1: Automatic (Current - Recommended)

The app automatically uses `192.168.1.110:8000` for physical devices. No configuration needed!

### Option 2: Environment Variable

Create `.env` file in `fleet/apps/mobile/`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.110:8000/api
```

Or set network IP only:

```bash
EXPO_PUBLIC_NETWORK_IP=192.168.1.110
```

### Option 3: Change Default IP

If your network IP is different, update the default in:
- `src/services/authService.ts` - Line ~42
- `src/services/apiService.ts` - Line ~12
- `src/api/client.ts` - Line ~8

Change:
```typescript
const networkIP = process.env.EXPO_PUBLIC_NETWORK_IP || '192.168.1.110';
```

To your IP:
```typescript
const networkIP = process.env.EXPO_PUBLIC_NETWORK_IP || 'YOUR_IP_HERE';
```

## Finding Your Network IP

### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# or
ipconfig getifaddr en0
```

### Windows:
```bash
ipconfig
# Look for "IPv4 Address" under your network adapter
```

### Quick Check:
```bash
cd fleet/apps/mobile
cat ../.. | grep "inet.*broadcast" | head -1
```

## Backend Server Configuration

Ensure your Django backend is accessible from the network:

1. **Bind to all interfaces** (not just localhost):
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Firewall**: Allow port 8000 on your machine

3. **Same Network**: Device and computer must be on same WiFi network

## Testing Connection

1. **From your computer**, test if backend is accessible:
   ```bash
   curl http://192.168.1.110:8000/api/account/users/
   ```

2. **From mobile device browser** (if possible):
   - Open `http://192.168.1.110:8000/api/account/users/`
   - Should show API response or auth error (not connection error)

3. **Check logs** in mobile app:
   - Look for `[AuthService] Using API URL: ...`
   - Look for `[ApiService] Using API URL: ...`
   - Should show `http://192.168.1.110:8000/api` for physical devices

## Troubleshooting

### Still Getting Network Error?

1. **Check Backend is Running**:
   ```bash
   cd fleet/apps/backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Verify Network IP**:
   - Make sure IP is correct (check with `ifconfig`)
   - Update in code if different

3. **Check Firewall**:
   - macOS: System Settings > Firewall > Allow incoming connections
   - Allow port 8000

4. **Verify Same Network**:
   - Computer and phone must be on same WiFi
   - Check WiFi settings on both

5. **Test with curl**:
   ```bash
   curl -v http://192.168.1.110:8000/api/account/users/
   ```

6. **Check Mobile Logs**:
   - Open Expo DevTools
   - Look for API URL logs
   - Check for connection errors

## Production

For production, the app uses:
- `https://www.fleetia.online/api` (when `__DEV__` is false)

## Status

✅ **Fixed**: All API services now auto-detect network IP for physical devices
✅ **Tested**: Should work on Android/iOS devices on same network
✅ **Default IP**: `192.168.1.110` (your current network IP)

---

**Last Updated**: Auto-configured for network IP `192.168.1.110`

