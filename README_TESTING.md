# Day-to-Day Operations Testing Guide

This document describes the comprehensive test suite for testing all day-to-day operations of the Fleet Management System across Web, Mobile, and Backend platforms.

## Overview

The test suite covers:
- **Backend API Tests**: Core functionality and data operations
- **Web Application Tests**: Browser-based UI and workflow testing
- **Mobile Application Tests**: Mobile-specific operations and API integration

## Prerequisites

### Backend Requirements
- Python 3.8+
- Django backend running on port 8000
- Test data seeded (run `python api_data_enhancement.py`)

### Web Requirements
- Node.js 18+
- Web application running on port 3000
- Playwright (will be installed automatically)

### Mobile Requirements
- Node.js 18+
- Backend API accessible
- Axios package installed

## Test Accounts

The following test accounts are used across all test suites:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | admin | admin123 | Full system access |
| Staff | staff1 | staff123 | Operations management |
| Driver | driver1 | driver123 | Route management |
| Inspector | inspector1 | inspector123 | Vehicle inspections |

## Running Tests

### Quick Start

Run all tests with a single command:

```bash
chmod +x run_all_tests.sh
./run_all_tests.sh
```

### Individual Test Suites

#### Backend API Tests

```bash
cd fleet/apps/backend
python3 ../../test_day_to_day_operations.py --api-url http://localhost:8000
```

#### Mobile Application Tests

```bash
API_URL=http://localhost:8000 node test_mobile_operations.js
```

#### Web Application Tests

```bash
WEB_URL=http://localhost:3000 API_URL=http://localhost:8000 node test_web_operations.js
```

## Test Coverage

### Backend API Tests (`test_day_to_day_operations.py`)

1. **Authentication Flow**
   - Login for all roles (admin, staff, driver, inspector)
   - Profile access
   - Token management

2. **Vehicle Management**
   - List vehicles
   - Create vehicle
   - Update vehicle
   - Get vehicle details

3. **Inspection Operations**
   - Create inspection
   - Add inspection items
   - List inspections
   - Get inspection details

4. **Shift Management**
   - Start shift
   - End shift
   - List shifts

5. **Issue Reporting**
   - Create issue
   - Update issue status
   - List issues

6. **Dashboard Access**
   - Dashboard stats for all roles
   - Role-based access control

7. **User Management** (Admin only)
   - List users
   - Get user statistics

### Web Application Tests (`test_web_operations.js`)

1. **Authentication**
   - Sign in flow
   - Role-based redirects

2. **Dashboard Access**
   - Dashboard for each role
   - Dashboard content display

3. **Vehicle Management**
   - Navigate to vehicles page
   - View vehicles list
   - Add vehicle button

4. **Inspections**
   - Navigate to inspections
   - View inspections page

5. **Shifts**
   - Navigate to shifts
   - View shifts page

### Mobile Application Tests (`test_mobile_operations.js`)

1. **Mobile Authentication**
   - Login for all roles
   - Profile access
   - Token management

2. **Mobile Dashboard**
   - Dashboard stats for all roles
   - Mobile-optimized endpoints

3. **Mobile Inspections**
   - Create inspection
   - Add inspection items
   - List inspections
   - Photo upload simulation

4. **Mobile Shifts**
   - Start shift
   - End shift
   - List shifts

5. **Mobile Issue Reporting**
   - Create issue
   - Update issue
   - List issues

6. **Mobile Camera Operations**
   - Photo upload endpoints
   - Photo confirmation

7. **Mobile Location**
   - GPS tracking simulation
   - Geofencing support

## Test Results

Test results are saved in timestamped directories:
- `test_results_YYYYMMDD_HHMMSS/`
  - `backend_tests.log` - Backend test output
  - `mobile_tests.log` - Mobile test output
  - `web_tests.log` - Web test output
  - `summary.txt` - Overall summary
  - JSON result files for detailed analysis

## Day-to-Day Operations Tested

### Admin Operations
- ✅ User management
- ✅ System overview and statistics
- ✅ Vehicle management
- ✅ Company settings
- ✅ Reports and analytics

### Staff Operations
- ✅ Task management
- ✅ Vehicle assignment
- ✅ Maintenance scheduling
- ✅ Operations overview
- ✅ Team collaboration

### Driver Operations
- ✅ Start/end shifts
- ✅ View assigned vehicles
- ✅ Report issues
- ✅ View route information
- ✅ Trip history

### Inspector Operations
- ✅ Create inspections
- ✅ Add inspection items
- ✅ Capture photos
- ✅ View inspection history
- ✅ Compliance tracking

## Troubleshooting

### Backend API Not Running
```bash
cd fleet/apps/backend
python manage.py runserver
```

### Web Application Not Running
```bash
cd fleet/apps/web
npm run dev
```

### Test Failures

1. **Authentication Failures**
   - Ensure test accounts exist
   - Run `python api_data_enhancement.py` to create test data
   - Check database connection

2. **API Endpoint Errors**
   - Verify API is running on correct port
   - Check CORS settings
   - Verify authentication tokens

3. **Web Test Failures**
   - Ensure Playwright is installed: `npx playwright install`
   - Check browser compatibility
   - Verify web app is accessible

4. **Mobile Test Failures**
   - Verify API endpoints are correct
   - Check network connectivity
   - Ensure test data exists

## Continuous Integration

To integrate into CI/CD:

```yaml
# Example GitHub Actions
- name: Run Backend Tests
  run: |
    cd fleet/apps/backend
    python3 ../../test_day_to_day_operations.py

- name: Run Mobile Tests
  run: |
    API_URL=${{ secrets.API_URL }} node test_mobile_operations.js

- name: Run Web Tests
  run: |
    WEB_URL=${{ secrets.WEB_URL }} API_URL=${{ secrets.API_URL }} node test_web_operations.js
```

## Environment Variables

- `API_URL` - Backend API base URL (default: http://localhost:8000)
- `WEB_URL` - Web application URL (default: http://localhost:3000)

## Notes

- Tests are designed to be non-destructive but may create test data
- Some tests may fail if test data doesn't exist - run `api_data_enhancement.py` first
- Web tests require a browser and may take longer to run
- Mobile tests simulate mobile operations via API calls

## Support

For issues or questions:
- Check test logs in results directory
- Verify all services are running
- Ensure test accounts exist
- Review API documentation

