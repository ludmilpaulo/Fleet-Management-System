# ⚡ Quick Deploy Reference

## 🎯 Current Status
- ✅ **Code pushed to GitHub!**
- ✅ **Backend URL configured:** https://taki.pythonanywhere.com
- ⚠️ **Backend needs ALLOWED_HOSTS update**
- ✅ **Frontend ready to deploy**
- ✅ **Mobile ready to build**

---

## 🔧 Step 1: Fix Backend (5 minutes)

### On PythonAnywhere Console:
```bash
# 1. Go to bash console
cd /home/taki/Fleet-Management-System

# 2. Pull latest code
git pull origin main

# 3. Edit settings
nano fleet/apps/backend/backend/settings.py

# 4. Add to ALLOWED_HOSTS (around line 28):
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'taki.pythonanywhere.com', '*.vercel.app']

# 5. Update CORS (around line 174):
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://taki.pythonanywhere.com',
]

# 6. Save (Ctrl+X, Y, Enter)

# 7. Reload web app from dashboard
```

### Test Backend:
```bash
curl https://taki.pythonanywhere.com/api/companies/companies/
# Should return JSON, not 400
```

---

## 🚀 Step 2: Deploy Frontend (2 minutes)

### Via Vercel (Easiest):
1. Go to https://vercel.com
2. Click "New Project"
3. Import: `ludmilpaulo/Fleet-Management-System`
4. Root Directory: `fleet/apps/web`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://taki.pythonanywhere.com/api
   NEXT_PUBLIC_MIXPANEL_TOKEN=c1cb0b3411115435a0d45662ad7a97e4
   ```
6. Click "Deploy"
7. Wait ~2 minutes
8. ✅ LIVE!

### Get Your URL:
- Vercel will give you: `https://fleet-management-xxx.vercel.app`

### Update Backend CORS:
```python
# Add your Vercel URL to CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://taki.pythonanywhere.com',
    'https://fleet-management-xxx.vercel.app',  # Your URL here
]
```

---

## 📱 Step 3: Build Mobile (15 minutes)

### Install EAS:
```bash
npm install -g eas-cli
```

### Configure & Build:
```bash
cd /Users/ludmil/Desktop/Apps/Fleet-Management-System/fleet/apps/mobile

# Login
eas login

# Configure
eas build:configure

# Build both platforms
eas build --platform all

# Or individual:
eas build --platform ios
eas build --platform android
```

### Download & Install:
- Check EAS dashboard for build links
- Download and install on device

---

## 🧪 Testing Checklist

### Backend:
- [ ] `curl https://taki.pythonanywhere.com/` → 200 OK
- [ ] `curl https://taki.pythonanywhere.com/api/companies/companies/` → JSON
- [ ] Admin login works

### Frontend:
- [ ] Visit Vercel URL
- [ ] Landing page looks good
- [ ] Sign in works
- [ ] Dashboard loads
- [ ] Mixpanel tracking works

### Mobile:
- [ ] App installs
- [ ] Sign in works
- [ ] Camera works
- [ ] Location works
- [ ] Offline mode works

---

## 📊 Demo Accounts

```
Admin:
Username: admin
Password: admin123

Staff:
Username: staff_user
Password: staff123

Driver:
Username: driver_user
Password: driver123

Inspector:
Username: inspector_user
Password: inspector123
```

---

## 🔗 Quick Links

- **GitHub:** https://github.com/ludmilpaulo/Fleet-Management-System
- **Backend:** https://taki.pythonanywhere.com
- **Vercel:** https://vercel.com
- **Mixpanel:** https://mixpanel.com
- **EAS:** https://expo.dev

---

## 💡 Common Issues

### Backend 400 Error:
**Fix:** Update `ALLOWED_HOSTS` in settings.py

### CORS Error:
**Fix:** Add frontend URL to `CORS_ALLOWED_ORIGINS`

### Mixpanel Not Tracking:
**Fix:** Check token is set in environment variables

### Build Failed:
**Fix:** Clear cache: `rm -rf .next && yarn build`

---

## 📞 Need Help?

Check these files:
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `PRODUCTION_DEPLOYMENT_STATUS.md` - Current status
- `FEATURE_TESTING_REPORT.md` - Feature list

---

## ✅ Deployment Order

1. **Backend First** (5 min) ⚠️
   - Update ALLOWED_HOSTS
   - Reload PythonAnywhere

2. **Frontend Second** (2 min) 🚀
   - Deploy to Vercel
   - Test connection

3. **Mobile Last** (15 min) 📱
   - Build with EAS
   - Test on device

---

**Total Time: ~22 minutes** ⏱️

**Let's go! 🚀**
