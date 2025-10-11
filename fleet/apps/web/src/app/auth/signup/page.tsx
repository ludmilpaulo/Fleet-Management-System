'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Truck, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { CompanySelector } from '@/components/ui/company-selector';
import { Company } from '@/lib/auth';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirm: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'driver', 'staff', 'inspector']),
  phone_number: z.string().optional(),
  employee_id: z.string().optional(),
  department: z.string().optional(),
  company_slug: z.string().min(1, 'Please select a company'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'staff':
          router.push('/dashboard/staff');
          break;
        case 'driver':
          router.push('/dashboard/driver');
          break;
        case 'inspector':
          router.push('/dashboard/inspector');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: SignUpForm) => {
    if (!selectedCompany) {
      dispatch(addNotification({
        type: 'error',
        title: 'Company Required',
        message: 'Please select a company to join',
      }));
      return;
    }

    try {
      const registrationData = {
        ...data,
        company_slug: selectedCompany.slug,
      };
      
      const result = await dispatch(registerUser(registrationData)).unwrap();
      setSuccess(true);
      
      // Add success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to ${selectedCompany.name}, ${result.user.first_name || result.user.username}!`,
      }));
      
      // Redirect after a short delay
      setTimeout(() => {
        switch (result.user.role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'staff':
            router.push('/dashboard/staff');
            break;
          case 'driver':
            router.push('/dashboard/driver');
            break;
          case 'inspector':
            router.push('/dashboard/inspector');
            break;
          default:
            router.push('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      // Error is handled by Redux slice
      dispatch(addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: err || 'Registration failed',
      }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full mb-3 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4">Your account has been created successfully.</p>
                <p className="text-xs sm:text-sm text-gray-500">Redirecting to your dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-3 sm:mb-4">
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Fleet Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Create your account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Join our team</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="John"
                    {...register('first_name')}
                    className="focus-ring"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    {...register('last_name')}
                    className="focus-ring"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  {...register('username')}
                  className="focus-ring"
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  className="focus-ring"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  {...register('role')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="driver">Driver</option>
                  <option value="inspector">Inspector</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Company Selection */}
              <div className="space-y-4">
                <CompanySelector
                  onCompanySelect={setSelectedCompany}
                  selectedCompany={selectedCompany}
                />
                {errors.company_slug && (
                  <p className="text-sm text-red-600">{errors.company_slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID (Optional)</Label>
                <Input
                  id="employee_id"
                  type="text"
                  placeholder="EMP001"
                  {...register('employee_id')}
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="Operations"
                  {...register('department')}
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (Optional)</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone_number')}
                  className="focus-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="focus-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="password_confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('password_confirm')}
                    className="focus-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password_confirm && (
                  <p className="text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
