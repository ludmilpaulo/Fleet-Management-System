# Fleet Management System - Web Application

A modern, responsive web application built with Next.js, TypeScript, and Tailwind CSS for managing fleet operations with role-based access control.

## Features

### 🎨 **Modern UI/UX**
- Clean, professional design with gradient backgrounds
- Responsive layout that works on all devices
- Smooth animations and transitions
- Dark/light mode support
- Custom scrollbars and focus states

### 🔐 **Authentication System**
- Secure sign-in and sign-up forms
- Token-based authentication
- Form validation with Zod
- Password visibility toggles
- Error handling and loading states

### 👥 **Role-Based Dashboards**
- **Admin Dashboard**: System overview, user management, statistics
- **Staff Dashboard**: Operations management, task tracking, maintenance
- **Driver Dashboard**: Route management, vehicle status, trip history
- **Inspector Dashboard**: Vehicle inspections, compliance tracking

### 📱 **Responsive Design**
- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly interface
- Optimized for tablets and desktops

## Technology Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **State Management**: Redux Toolkit with React Redux
- **Authentication**: Token-based with js-cookie

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 8000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
```bash
npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Accounts

The application comes with pre-configured demo accounts organized by company:

#### FleetCorp Solutions
| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | admin | admin123 | Full system access |
| Staff | staff1 | staff123 | Operations management |
| Driver | driver1 | driver123 | Route management |

#### Transport Masters
| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Inspector | inspector1 | inspector123 | Vehicle inspections |

### Sample Companies

The system includes two sample companies:

1. **FleetCorp Solutions** (Professional Plan)
   - Email: contact@fleetcorp.com
   - Website: https://fleetcorp.com
   - Location: New York, NY, USA
   - Trial: 30 days

2. **Transport Masters** (Basic Plan)
   - Email: info@transportmasters.com
   - Website: https://transportmasters.com
   - Location: Los Angeles, CA, USA
   - Trial: 14 days

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign-in page
│   │   └── signup/        # Sign-up page
│   ├── dashboard/         # Dashboard pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── staff/         # Staff dashboard
│   │   ├── driver/        # Driver dashboard
│   │   └── inspector/     # Inspector dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── layout/            # Layout components
│   │   └── dashboard-layout.tsx
│   ├── providers/         # Context providers
│   │   └── redux-provider.tsx
│   └── ui/                # UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       └── notification.tsx
├── store/                 # Redux store
│   ├── index.ts           # Store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   └── slices/            # Redux slices
│       ├── authSlice.ts   # Authentication state
│       └── uiSlice.ts     # UI state
└── lib/                   # Utility libraries
    ├── auth.ts            # Authentication logic
    └── utils.ts           # Utility functions
```

## Key Features

### Multi-Tenant Architecture
1. **Company Profiles**: Each company has its own profile with branding, settings, and limits
2. **Company Selection**: Users must select a company during registration
3. **Isolated Data**: Users can only access data within their company
4. **Company-Specific Dashboards**: Role-based dashboards show company-specific information
5. **Subscription Management**: Different subscription plans with user/vehicle limits

### Authentication Flow
1. **Company Selection**: Choose company during sign-up process
2. **Sign Up**: Create new user accounts with role selection and company assignment
3. **Sign In**: Authenticate with username/password (company context included)
4. **Auto-redirect**: Automatic redirection based on user role
5. **Token Management**: Secure token storage and refresh

### Redux State Management
1. **Authentication State**: User data, token, loading states, company information
2. **UI State**: Sidebar, notifications, modals, filters
3. **Async Actions**: Login, register, logout, profile updates
4. **Notifications**: Toast notifications with different types
5. **Persistence**: Auth state persisted in localStorage

### Dashboard Features

#### Admin Dashboard
- System statistics and user metrics
- User role distribution charts
- Recent activity feed
- Quick action buttons
- User management interface

#### Staff Dashboard
- Task management and scheduling
- Vehicle assignment tracking
- Maintenance scheduling
- Operations overview
- Team collaboration tools

#### Driver Dashboard
- Current route information
- Vehicle status monitoring
- Trip history and reports
- Maintenance alerts
- Navigation tools

#### Inspector Dashboard
- Inspection scheduling
- Vehicle compliance tracking
- Safety checklist management
- Report generation
- Issue tracking

### Responsive Navigation
- Collapsible sidebar on mobile
- Role-based menu items
- User profile information
- Notification system
- Search functionality

## API Integration

The frontend integrates with the Django REST API backend:

- **Base URL**: `http://localhost:8000/api/account/`
- **Authentication**: Token-based
- **Endpoints**: User management, authentication, statistics

### Key API Endpoints Used
- `POST /login/` - User authentication
- `POST /register/` - User registration
- `GET /profile/` - User profile
- `GET /users/` - User list (admin/staff)
- `GET /stats/` - System statistics (admin)

## Styling Guidelines

### Color Scheme
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#f1f5f9)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Geist Sans (primary), Geist Mono (code)
- **Sizes**: Responsive text scaling
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Multiple variants with hover states
- **Forms**: Clean inputs with focus states
- **Navigation**: Collapsible sidebar with icons

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/account
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Fleet Management System and is proprietary software.

## Support

For support and questions, please contact the development team or refer to the API documentation.