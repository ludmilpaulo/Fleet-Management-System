# Fleet Management System - Account API Documentation

## Overview
The Account API provides user management functionality for the Fleet Management System with role-based access control. The system supports four user roles: Admin, Driver, Staff, and Inspector.

## Base URL
```
http://localhost:8000/api/account/
```

## Authentication
The API uses Token Authentication. Include the token in the Authorization header:
```
Authorization: Token <your_token_here>
```

## User Roles and Permissions

### Admin
- Full system access
- Can manage all users
- Can view system statistics
- All permissions

### Staff
- Can view and manage vehicles
- Can view and manage users
- Cannot access admin-only features

### Driver
- Can view assigned vehicles
- Can update assigned vehicles
- Can view own profile
- Limited permissions

### Inspector
- Can view vehicles
- Can inspect vehicles
- Can create inspection reports
- Cannot manage users

## API Endpoints

### Authentication

#### Register User
**POST** `/register/`

Create a new user account.

**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "admin|driver|staff|inspector",
    "phone_number": "string",
    "employee_id": "string",
    "department": "string",
    "hire_date": "YYYY-MM-DD"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "newuser",
        "email": "user@example.com",
        "role": "staff",
        "role_display": "Staff",
        "employee_id": "EMP001",
        "department": "Operations",
        "is_active": true,
        "date_joined": "2025-10-10T18:00:00Z"
    },
    "token": "abc123...",
    "message": "User registered successfully"
}
```

#### Login
**POST** `/login/`

Authenticate user and get access token.

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@fleet.com",
        "role": "admin",
        "role_display": "Admin",
        "employee_id": "ADM001",
        "is_active": true
    },
    "token": "abc123...",
    "message": "Login successful"
}
```

#### Logout
**POST** `/logout/`

Logout user and invalidate token.

**Headers:** `Authorization: Token <token>`

**Response:**
```json
{
    "message": "Logout successful"
}
```

### User Profile

#### Get Profile
**GET** `/profile/`

Get current user's profile information.

**Headers:** `Authorization: Token <token>`

**Response:**
```json
{
    "id": 1,
    "username": "admin",
    "email": "admin@fleet.com",
    "first_name": "Admin",
    "last_name": "User",
    "full_name": "Admin User",
    "role": "admin",
    "role_display": "Admin",
    "phone_number": "+1234567890",
    "employee_id": "ADM001",
    "department": "IT",
    "hire_date": "2025-01-01",
    "is_active": true,
    "date_joined": "2025-10-10T18:00:00Z",
    "last_login": "2025-10-10T18:30:00Z"
}
```

#### Update Profile
**PUT/PATCH** `/profile/`

Update current user's profile information.

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
    "email": "newemail@example.com",
    "first_name": "New Name",
    "last_name": "New Last Name",
    "phone_number": "+1234567890",
    "department": "New Department"
}
```

### User Management

#### List Users
**GET** `/users/`

List all users (Admin and Staff only).

**Headers:** `Authorization: Token <token>`

**Query Parameters:**
- `role`: Filter by role (admin, driver, staff, inspector)
- `department`: Filter by department
- `search`: Search by username, name, email, or employee ID

**Response:**
```json
{
    "count": 4,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "username": "admin",
            "email": "admin@fleet.com",
            "full_name": "Admin User",
            "role": "admin",
            "role_display": "Admin",
            "employee_id": "ADM001",
            "department": "IT",
            "is_active": true,
            "date_joined": "2025-10-10T18:00:00Z"
        }
    ]
}
```

#### Get User Detail
**GET** `/users/{id}/`

Get specific user details.

**Headers:** `Authorization: Token <token>`

**Response:** Same as profile response

#### Update User
**PUT/PATCH** `/users/{id}/`

Update user information (Admin and Staff only).

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
    "email": "newemail@example.com",
    "first_name": "New Name",
    "last_name": "New Last Name",
    "phone_number": "+1234567890",
    "department": "New Department",
    "is_active": true
}
```

#### Delete User
**DELETE** `/users/{id}/`

Delete user account (Admin and Staff only).

**Headers:** `Authorization: Token <token>`

**Response:** `204 No Content`

### Password Management

#### Change Password
**POST** `/change-password/`

Change current user's password.

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
    "old_password": "current_password",
    "new_password": "new_password",
    "new_password_confirm": "new_password"
}
```

**Response:**
```json
{
    "token": "new_token_here",
    "message": "Password changed successfully"
}
```

### Statistics

#### User Statistics
**GET** `/stats/`

Get user statistics (Admin only).

**Headers:** `Authorization: Token <token>`

**Response:**
```json
{
    "total_users": 4,
    "active_users": 4,
    "inactive_users": 0,
    "users_by_role": {
        "Admin": 1,
        "Driver": 1,
        "Staff": 1,
        "Inspector": 1
    },
    "recent_registrations": 4
}
```

## Error Responses

### 400 Bad Request
```json
{
    "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "error": "Permission denied"
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

## Sample Users

The system comes with pre-created sample users:

1. **Admin User**
   - Username: `admin`
   - Password: `admin123`
   - Role: Admin
   - Employee ID: ADM001

2. **Driver User**
   - Username: `driver1`
   - Password: `driver123`
   - Role: Driver
   - Employee ID: DRV001
   - Department: Transportation

3. **Staff User**
   - Username: `staff1`
   - Password: `staff123`
   - Role: Staff
   - Employee ID: STF001
   - Department: Operations

4. **Inspector User**
   - Username: `inspector1`
   - Password: `inspector123`
   - Role: Inspector
   - Employee ID: INS001
   - Department: Quality Control

## Development Server

To start the development server:
```bash
cd fleet/apps/backend
python3 manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/account/`

## Database Admin

Access the Django admin interface at `http://localhost:8000/admin/` using the admin credentials.
