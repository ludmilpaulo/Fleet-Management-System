# Fleet Management System – Manual Test Checklist (2–3 Hours)

Use this checklist for a full manual test of mobile, web, admin, company admin, staff, and roles.

---

## Prerequisites

- Backend running: `cd fleet/apps/backend && python manage.py runserver`
- Web app running: `cd fleet/apps/web && npm run dev`
- Test users (from `test_day_to_day_operations.py`):
  - **Platform Admin:** `test_platform_admin` / `testpass123`
  - **Company Admin:** `test_admin` / `testpass123`
  - **Staff:** `test_staff` / `testpass123`
  - **Driver:** `test_driver` / `testpass123`
  - **Inspector:** `test_inspector` / `testpass123`

---

## 1. Platform Admin (≈30 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 1.1 | Login | Sign in as `test_platform_admin` | Redirect to platform admin dashboard | |
| 1.2 | Companies | Open Companies list | See all companies | |
| 1.3 | Company details | Open a company | Details, users, vehicles | |
| 1.4 | Activate/Deactivate | Toggle company status | Status updates | |
| 1.5 | Users | Open Users list | See all platform users | |
| 1.6 | Vehicles | Open Vehicles list | See all vehicles | |
| 1.7 | Shifts | Open Shifts list | See all shifts | |
| 1.8 | Inspections | Open Inspections list | See all inspections | |
| 1.9 | Issues | Open Issues list | See all issues | |
| 1.10 | Stats | Open Stats/Analytics | Charts and metrics | |
| 1.11 | Settings | Open Platform Settings | Config options | |
| 1.12 | Logout | Log out | Return to sign-in | |

---

## 2. Company Admin (≈30 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 2.1 | Login | Sign in as `test_admin` | Redirect to company dashboard | |
| 2.2 | Dashboard | View dashboard | Stats, vehicles, shifts | |
| 2.3 | Vehicles – List | Open Vehicles | List of company vehicles | |
| 2.4 | Vehicles – Create | Add new vehicle | Vehicle created | |
| 2.5 | Vehicles – Edit | Edit a vehicle | Changes saved | |
| 2.6 | Users – List | Open Users | List of company users | |
| 2.7 | Users – Create | Add new user | User created | |
| 2.8 | Shifts | Open Shifts | List of shifts | |
| 2.9 | Inspections | Open Inspections | List of inspections | |
| 2.10 | Issues | Open Issues | List of issues | |
| 2.11 | Company profile | Open Company Settings | Edit company info | |
| 2.12 | Logout | Log out | Return to sign-in | |

---

## 3. Staff (≈25 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 3.1 | Login | Sign in as `test_staff` | Redirect to dashboard | |
| 3.2 | Dashboard | View dashboard | Stats visible | |
| 3.3 | Vehicles | Open Vehicles | Read-only or limited edit | |
| 3.4 | Users | Open Users | List of users | |
| 3.5 | Shifts | Open Shifts | List of shifts | |
| 3.6 | Inspections | Open Inspections | List of inspections | |
| 3.7 | Issues | Open Issues | List of issues | |
| 3.8 | Permissions | Try admin-only actions | Blocked or hidden | |
| 3.9 | Logout | Log out | Return to sign-in | |

---

## 4. Driver (≈25 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 4.1 | Login | Sign in as `test_driver` | Redirect to dashboard | |
| 4.2 | Dashboard | View dashboard | Driver-relevant stats | |
| 4.3 | Start shift | Start shift for a vehicle | Shift started | |
| 4.4 | Active shift | View active shift | Shift details | |
| 4.5 | End shift | End active shift | Shift completed | |
| 4.6 | Report issue | Create new issue | Issue created | |
| 4.7 | My shifts | View own shifts | Only driver’s shifts | |
| 4.8 | Vehicles | View vehicles | Read-only list | |
| 4.9 | Logout | Log out | Return to sign-in | |

---

## 5. Inspector (≈25 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 5.1 | Login | Sign in as `test_inspector` | Redirect to dashboard | |
| 5.2 | Dashboard | View dashboard | Inspector stats | |
| 5.3 | Inspections | Open Inspections | List of inspections | |
| 5.4 | Create inspection | Create inspection for a shift | Inspection created | |
| 5.5 | Add items | Add inspection items (ENGINE, TYRES) | Items added | |
| 5.6 | Photo upload | Upload photo to inspection | Photo saved | |
| 5.7 | Complete inspection | Mark inspection complete | Status updated | |
| 5.8 | Shifts | View shifts | Shifts with inspections | |
| 5.9 | Logout | Log out | Return to sign-in | |

---

## 6. Web App – Cross-Role (≈20 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 6.1 | Responsive | Resize browser (mobile, tablet) | Layout adapts | |
| 6.2 | Navigation | Use main nav for each role | Correct menus | |
| 6.3 | Search | Use search where available | Results shown | |
| 6.4 | Filters | Use filters on lists | Filtering works | |
| 6.5 | Pagination | Change pages on lists | Pagination works | |
| 6.6 | Error handling | Invalid input, 404 | Clear error messages | |

---

## 7. Mobile API / PWA (≈15 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 7.1 | Mobile login | Login via API (driver) | Token received | |
| 7.2 | Dashboard API | GET dashboard stats | Stats returned | |
| 7.3 | Start shift API | POST shift start | Shift created | |
| 7.4 | Create issue API | POST issue | Issue created | |
| 7.5 | Create inspection API | POST inspection (after shift) | Inspection created | |
| 7.6 | Photo confirm API | POST photo confirm | Photo saved | |

---

## 8. Role Permissions (≈15 min)

| # | Test | Steps | Expected | ✓ |
|---|------|-------|----------|---|
| 8.1 | Driver → Admin | Driver tries admin URL | Blocked or redirect | |
| 8.2 | Staff → Platform Admin | Staff tries platform admin | Blocked | |
| 8.3 | Inspector → User create | Inspector tries to create user | Blocked | |
| 8.4 | Company isolation | User A cannot see Company B data | Isolated | |
| 8.5 | Platform admin access | Platform admin sees all companies | Full access | |

---

## Summary

- **Total checks:** ~60
- **Estimated time:** 2–3 hours
- **Roles:** Platform Admin, Company Admin, Staff, Driver, Inspector
- **Platforms:** Web, Mobile API

---

## Automated Test Results (Reference)

- **Backend API:** 37/37 passed
- **Mobile API:** 27/27 passed
- **Web (Playwright):** Some failures (sign-in form selectors may need updating)

Run automated tests:
```bash
# Backend
python3 test_day_to_day_operations.py --api-url http://localhost:8000

# Mobile
API_URL=http://localhost:8000 node test_mobile_operations.js

# Web (requires Playwright)
HEADLESS=true WEB_URL=http://localhost:3000 API_URL=http://localhost:8000 node test_web_operations.js
```
