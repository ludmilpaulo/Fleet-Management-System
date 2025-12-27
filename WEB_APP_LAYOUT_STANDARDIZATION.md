# Web App Layout & Color Standardization

## ✅ Completed Standardization

### 1. Color System Created
**File:** `fleet/apps/web/src/utils/colors.ts`

Standardized color palette with:
- Role-specific colors (admin, staff, driver, inspector)
- Status colors (active, inactive, maintenance, retired)
- Priority colors (critical, high, medium, low)
- Ticket status colors (open, in_progress, resolved, closed)
- Helper functions for consistent color usage

### 2. Dashboard Pages Updated

#### ✅ Driver Dashboard (`dashboard/driver/page.tsx`)
- Welcome banner: Uses `getRoleColors('driver')` - green gradient
- Cards: Standardized with `hover:shadow-lg transition-shadow border border-gray-200`
- Consistent spacing: `space-y-6`

#### ✅ Inspector Dashboard (`dashboard/inspector/page.tsx`)
- Welcome banner: Uses `getRoleColors('inspector')` - yellow/orange gradient
- Cards: Standardized styling
- Consistent spacing: `space-y-6`

#### ✅ Admin Dashboard (`dashboard/admin/page.tsx`)
- Welcome banner: Uses `getRoleColors('admin')` - red gradient
- Cards: Standardized styling
- Company banner: Updated to consistent card style
- Consistent spacing: `space-y-6`

#### ✅ Staff Dashboard (`dashboard/staff/page.tsx`)
- Welcome banner: Uses `getRoleColors('staff')` - blue gradient
- Cards: Standardized styling
- Status/priority badges: Use helper functions
- Consistent spacing: `space-y-6`

#### ✅ Main Dashboard (`dashboard/page.tsx`)
- Welcome banner: Uses primary brand colors (blue-purple gradient)
- Cards: Standardized styling
- Consistent spacing: `space-y-6`

#### ✅ Tickets Page (`dashboard/tickets/page.tsx`)
- Status badges: Use `getTicketStatusColors()`
- Priority badges: Use `getPriorityColors()`
- Cards: Standardized styling
- Gradient buttons: Use `COLORS.primary`

#### ✅ Vehicles Page (`dashboard/vehicles/page.tsx`)
- Status badges: Use `getStatusColors()`
- Consistent styling

### 3. Standardized Components

#### Welcome Banners
All role dashboards now use consistent welcome banners:
```tsx
<div className={`bg-gradient-to-r ${roleColors.gradient} rounded-lg p-6 text-white shadow-lg`}>
  <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
  <p className="text-{role}-100">Role-specific message</p>
</div>
```

#### Cards
All cards use consistent styling:
```tsx
<Card className="hover:shadow-lg transition-shadow border border-gray-200">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-gray-600">Title</CardTitle>
    <div className="p-2 rounded-full bg-{color}-50">
      <Icon className="w-4 h-4 text-{color}-600" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-gray-900">Value</div>
    <div className="flex items-center text-xs text-gray-500 mt-1">Description</div>
  </CardContent>
</Card>
```

#### Badges
All badges use helper functions:
- Status: `getStatusColors(status).full`
- Priority: `getPriorityColors(priority).full`
- Ticket Status: `getTicketStatusColors(status).full`
- Role: `getRoleColors(role).badge`

### 4. Layout Consistency

#### Spacing
- All dashboard pages use: `space-y-6` for vertical spacing
- Cards use: `gap-6` for grid spacing
- Consistent padding: DashboardLayout handles main padding

#### Background
- All pages inherit from DashboardLayout
- Background: `bg-gray-50` (handled by layout)
- Cards: `bg-white` with `border border-gray-200`

### 5. Color Usage

#### Role Colors
- **Admin**: Red gradient (`from-red-600 to-rose-600`)
- **Staff**: Blue gradient (`from-blue-600 to-indigo-600`)
- **Driver**: Green gradient (`from-green-600 to-emerald-600`)
- **Inspector**: Yellow/Orange gradient (`from-yellow-600 to-orange-600`)

#### Status Colors
- **Active**: Green (`bg-green-100 text-green-800`)
- **Inactive**: Gray (`bg-gray-100 text-gray-800`)
- **Maintenance**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Retired**: Red (`bg-red-100 text-red-800`)

#### Priority Colors
- **Critical/High**: Red (`bg-red-100 text-red-800`)
- **Medium**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Low**: Green (`bg-green-100 text-green-800`)

## 📋 Files Modified

1. ✅ `src/utils/colors.ts` - Created color constants
2. ✅ `src/app/dashboard/driver/page.tsx` - Updated colors and layout
3. ✅ `src/app/dashboard/inspector/page.tsx` - Updated colors and layout
4. ✅ `src/app/dashboard/admin/page.tsx` - Updated colors and layout
5. ✅ `src/app/dashboard/staff/page.tsx` - Updated colors and layout
6. ✅ `src/app/dashboard/page.tsx` - Updated colors and layout
7. ✅ `src/app/dashboard/tickets/page.tsx` - Updated badge colors
8. ✅ `src/app/dashboard/vehicles/page.tsx` - Updated badge colors

## 🎯 Standardization Rules

### Layout
- All dashboard pages wrapped in `<DashboardLayout>`
- Content wrapped in `<div className="space-y-6">`
- Welcome banner at top (role-specific gradient)
- Stats grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

### Cards
- Base: `hover:shadow-lg transition-shadow border border-gray-200`
- Header: `flex flex-row items-center justify-between space-y-0 pb-2`
- Title: `text-sm font-medium text-gray-600`
- Icon container: `p-2 rounded-full bg-{color}-50`
- Icon: `w-4 h-4 text-{color}-600`
- Value: `text-2xl font-bold text-gray-900`
- Description: `text-xs text-gray-500`

### Colors
- Always use helper functions from `@/utils/colors`
- Never hardcode color values
- Use role-specific gradients for welcome banners
- Use standardized badge colors for status/priority

## ✅ Verification Checklist

- [x] Color constants file created
- [x] All dashboard pages use standardized colors
- [x] Welcome banners consistent across roles
- [x] Card styling standardized
- [x] Badge colors use helper functions
- [x] Spacing consistent (`space-y-6`)
- [x] Background colors consistent
- [x] No hardcoded color values in pages

## 🚀 Usage Example

```tsx
import { getRoleColors, getStatusColors, COLORS } from '@/utils/colors';

// Get role colors
const roleColors = getRoleColors('admin');

// Use in welcome banner
<div className={`bg-gradient-to-r ${roleColors.gradient} rounded-lg p-6 text-white`}>
  Welcome!
</div>

// Use for badges
<Badge className={getStatusColors('ACTIVE').full}>Active</Badge>

// Use primary colors
<Button className={`bg-gradient-to-r ${COLORS.primary.from} ${COLORS.primary.to}`}>
  Click Me
</Button>
```

## 📝 Notes

- The DashboardLayout component handles the main background (`bg-gray-50`)
- All pages should use `space-y-6` for consistent vertical spacing
- Cards should always have `border border-gray-200` for consistency
- Icon containers should use `rounded-full` with `p-2` padding
- Text colors follow: `text-gray-900` (primary), `text-gray-600` (secondary), `text-gray-500` (muted)

