# iOS Simulator Connection Fix

## Problem
The iOS Simulator is timing out when trying to connect to the Expo development server using the network IP address (`exp://192.168.100.110:8081`).

## Solutions

### Solution 1: Use localhost (Recommended for Simulator)
Restart Expo with the `--localhost` flag:

```bash
cd fleet/apps/mobile
npm run ios
# or
expo start --ios --localhost
```

This will use `exp://localhost:8081` which the simulator can access directly.

### Solution 2: Manual Connection
1. Start Expo server:
   ```bash
   npm start
   ```

2. In the Expo terminal, you'll see a QR code and connection options
3. In the iOS Simulator, open the Expo Go app manually
4. Manually enter the connection URL or scan the QR code

### Solution 3: Use Tunnel Mode
If localhost doesn't work, try tunnel mode:

```bash
expo start --ios --tunnel
```

Note: Tunnel mode requires an Expo account and may be slower.

### Solution 4: Check Simulator Network
1. Open iOS Simulator
2. Go to Settings > General > About
3. Check if the simulator has network access
4. Try opening Safari in the simulator and navigate to a website to test connectivity

## Quick Fix Command

For immediate fix, stop the current Expo server (Ctrl+C) and run:

```bash
cd fleet/apps/mobile
expo start --ios --localhost
```

This will automatically open the app in the simulator using localhost, which should resolve the timeout issue.
