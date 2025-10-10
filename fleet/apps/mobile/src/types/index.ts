export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'driver' | 'staff' | 'inspector';
  role_display: string;
  phone_number?: string;
  employee_id?: string;
  department?: string;
  hire_date?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  company: Company;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
  logo?: string;
  primary_color: string;
  secondary_color: string;
  max_users: number;
  max_vehicles: number;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  is_active: boolean;
  trial_ends_at?: string;
  is_trial_active?: boolean;
  current_user_count?: number;
  current_vehicle_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CompanyStats {
  company_name: string;
  total_users: number;
  max_users: number;
  user_limit_reached: boolean;
  total_vehicles: number;
  max_vehicles: number;
  vehicle_limit_reached: boolean;
  subscription_plan: string;
  is_trial_active: boolean;
  trial_ends_at?: string;
  users_by_role: Record<string, number>;
  recent_registrations: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UIState {
  notifications: Notification[];
  unreadNotifications: number;
  isLoading: boolean;
}

export interface RootState {
  auth: AuthState;
  ui: UIState;
}

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  CompanySelection: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Drivers: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
