# Starting Local Servers

## Backend (Django) - Port 8000

```bash
cd fleet/apps/backend
python manage.py runserver
```

Access at: http://localhost:8000/admin/

## Frontend (Next.js) - Port 3000

```bash
cd fleet/apps/web
npm run dev
```

Access at: http://localhost:3000

## Login Credentials

### Platform Admin (ludmil)
- Username: `ludmil`
- Password: `Maitland@2025`
- Token: `8781d2089ecdfbae146e5dc57444d1cc2c08be7e`

### Test Users
- Username: `admin` / Password: `admin123`
- Username: `staff1` / Password: `staff123`
- Username: `driver1` / Password: `driver123`
- Username: `inspector1` / Password: `inspector123`

## API Endpoints

### Authentication
- Login: http://localhost:8000/api/account/login/
- Register: http://localhost:8000/api/account/register/
- Profile: http://localhost:8000/api/account/profile/

### Platform Admin
- Companies: http://localhost:8000/api/platform-admin/companies/
- Dashboard: http://localhost:8000/api/platform-admin/dashboard/stats/

## Database

The backend uses SQLite database located at:
`fleet/apps/backend/db.sqlite3`

To view the database:
```bash
cd fleet/apps/backend
python manage.py dbshell
```

## Testing the Login

1. Start backend: http://localhost:8000
2. Start frontend: http://localhost:3000
3. Navigate to: http://localhost:3000/auth/signin
4. Login with: ludmil / Maitland@2025

The backend CORS is configured to allow requests from:
- http://localhost:3000
- http://127.0.0.1:3000

