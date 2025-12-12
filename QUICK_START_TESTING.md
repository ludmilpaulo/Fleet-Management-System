# Quick Start Testing Guide

## Prerequisites

1. **Backend API** running on `http://localhost:8000`
2. **Web Application** running on `http://localhost:3000` (optional, for web tests)
3. **Test Data** seeded (run `python fleet/apps/backend/api_data_enhancement.py`)

## Quick Test Run

### Run All Tests
```bash
./run_all_tests.sh
```

### Run Individual Test Suites

**Backend API Tests:**
```bash
cd fleet/apps/backend
python3 ../../test_day_to_day_operations.py
```

**Mobile Tests:**
```bash
node test_mobile_operations.js
```

**Web Tests:**
```bash
node test_web_operations.js
```

## Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Staff | staff1 | staff123 |
| Driver | driver1 | driver123 |
| Inspector | inspector1 | inspector123 |

## What Gets Tested

### ✅ Authentication
- Login for all roles
- Profile access
- Token management

### ✅ Vehicle Management
- List, create, update vehicles
- Vehicle details

### ✅ Inspections
- Create inspections
- Add inspection items
- List inspections

### ✅ Shifts
- Start shift
- End shift
- List shifts

### ✅ Issues
- Create issues
- Update issues
- List issues

### ✅ Dashboards
- Dashboard access for all roles
- Statistics and metrics

### ✅ User Management (Admin)
- List users
- User statistics

## Results

Test results are saved in `test_results_YYYYMMDD_HHMMSS/` directory with:
- Detailed logs
- JSON result files
- Summary report

## Troubleshooting

**Backend not running?**
```bash
cd fleet/apps/backend
python manage.py runserver
```

**Web app not running?**
```bash
cd fleet/apps/web
npm run dev
```

**No test data?**
```bash
cd fleet/apps/backend
python api_data_enhancement.py
```

**Install test dependencies:**
```bash
npm install playwright axios
```

