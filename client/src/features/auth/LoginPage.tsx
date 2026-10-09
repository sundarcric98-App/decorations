import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Eye, EyeOff, Sparkles, LogIn, KeyRound } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role: 'admin' | 'manager' | 'staff') => {
    if (role === 'admin') {
      setValue('email', 'admin@sathuragiridecoration.com');
      setValue('password', 'Admin@12345');
    } else if (role === 'manager') {
      setValue('email', 'manager@sathuragiridecoration.com');
      setValue('password', 'Manager@12345');
    } else {
      setValue('email', 'staff@sathuragiridecoration.com');
      setValue('password', 'Staff@12345');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F] tracking-tight">
          Management Portal
        </h2>
        <p className="text-xs text-[#77716B]">
          Sign in to access Sathuragiri Decoration operations & analytics.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-luxury-lg rounded-3xl border border-[#E8E0D6] space-y-6">
          {errorMessage && (
            <div className="p-3 bg-[#FDF2F2] border border-[#C74646]/30 text-[#C74646] rounded-xl text-xs font-medium animate-in fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Staff / Admin Email"
              type="email"
              placeholder="e.g. admin@sathuragiridecoration.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-400">Secure Session</span>
              <Link
                to="/admin/forgot-password"
                className="font-semibold text-[#B8955A] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo Login Shortcuts */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <div className="text-center text-[10px] uppercase font-bold tracking-wider text-[#AFAEA9] flex items-center justify-center gap-1.5">
              <KeyRound className="w-3 h-3 text-[#B8955A]" /> Quick Demo Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#EBDDBF] text-[11px] font-bold text-[#96743A] transition-colors"
              >
                👑 Owner
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('manager')}
                className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#EBDDBF] text-[11px] font-bold text-[#96743A] transition-colors"
              >
                👔 Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff')}
                className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#EBDDBF] text-[11px] font-bold text-[#96743A] transition-colors"
              >
                🛠️ Staff
              </button>
            </div>
          </div>
        </div>

        {/* Back to Public Site */}
        <p className="mt-6 text-center text-xs text-[#77716B]">
          <Link to="/" className="text-[#B8955A] hover:underline font-semibold">
            ← Return to Sathuragiri Public Website
          </Link>
        </p>
      </div>
    </div>
  );
};
