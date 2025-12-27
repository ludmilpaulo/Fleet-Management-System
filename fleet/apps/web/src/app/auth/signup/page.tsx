'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Truck, AlertCircle, Loader2, CheckCircle, User, Mail, Building2, Phone, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { CompanySelector } from '@/components/ui/company-selector';
import { Company } from '@/lib/auth';
import { COLORS } from '@/utils/colors';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirm: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
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
    setValue,
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
      if (user.role) {
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
      } else {
        // No role assigned yet - redirect to main dashboard
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
      // Role will be assigned by company admin, so redirect to main dashboard
      setTimeout(() => {
        if (result.user?.role) {
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
        } else {
          // No role assigned yet - redirect to main dashboard
          // Company admin will assign role later
          router.push('/dashboard');
        }
      }, 2000);
    } catch (err: unknown) {
      // Error is handled by Redux slice
      dispatch(addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: err instanceof Error ? err.message : 'Registration failed',
      }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full -ml-36 -mb-36"></div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-8 sm:pt-10 px-6 sm:px-8 pb-8 sm:pb-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 sm:mb-6 shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                  Registration Successful!
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-4">Your account has been created successfully.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-700 font-medium">Your company admin will assign your role and access permissions.</p>
                </div>
                <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full -ml-36 -mb-36"></div>
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-blue-500/30">
            <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Fleet Management
          </h1>
          <p className="text-base sm:text-lg text-gray-600">Join our team and start managing your fleet</p>
        </div>

        <Card className="shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
            <CardTitle className="text-2xl sm:text-3xl text-center font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base text-gray-600">
              Fill in your details below to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="John"
                    {...register('first_name')}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    {...register('last_name')}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  {...register('username')}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                {errors.username && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Company Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Company
                </Label>
                <CompanySelector
                  onCompanySelect={(company) => {
                    setSelectedCompany(company);
                    setValue('company_slug', company.slug, { shouldValidate: true });
                  }}
                  selectedCompany={selectedCompany}
                />
                {errors.company_slug && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.company_slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone_number')}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password (min. 6 characters)"
                    {...register('password')}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('password_confirm')}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirm && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password_confirm.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className={`w-full h-12 bg-gradient-to-r ${COLORS.primary.from} ${COLORS.primary.to} hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
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
