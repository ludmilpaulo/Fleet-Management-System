# Manual Server Startup Guide

To see the terminal output for each server, open separate terminal windows/tabs and run:

## 1. Backend Server (Django)
```bash
cd fleet/apps/backend
python3 manage.py runserver 0.0.0.0:8000
```
This will start the Django backend on http://localhost:8000

## 2. Web Server (Next.js)
```bash
cd fleet/apps/web
npm run dev
```
This will start the Next.js web app on http://localhost:3000

## 3. Mobile Server (Expo)
```bash
cd fleet/apps/mobile
npm start
```
This will start the Expo development server and show a QR code for the mobile app.

---

## Quick Start (macOS)
You can also use the provided script:
```bash
./start-servers.sh
```
This will automatically open 3 separate Terminal windows, one for each server.

---

## Current Status
All servers are currently running in the background. To stop them, you can:

1. Find and kill the processes:
   ```bash
   lsof -ti:8000 | xargs kill  # Backend
   lsof -ti:3000 | xargs kill  # Web
   lsof -ti:8081 | xargs kill  # Expo
   ```

2. Or restart them manually in separate terminals using the commands above.

