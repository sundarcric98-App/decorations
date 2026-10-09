import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must match'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      error('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      success('Password successfully reset! You can now log in.');
    } catch (err: any) {
      error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F]">
          Set New Password
        </h2>
        <p className="text-xs text-[#77716B]">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-luxury-lg rounded-3xl border border-[#E8E0D6] space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#24845D] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#24211F]">Password Changed!</h4>
              <p className="text-xs text-[#77716B]">
                Your account password has been updated securely.
              </p>
              <Link to="/admin/login" className="block pt-2">
                <Button variant="gold" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4">
              <p className="text-xs text-[#C74646]">
                Invalid or missing reset token. Please request a new password reset link.
              </p>
              <Link to="/admin/forgot-password">
                <Button variant="secondary" size="sm">
                  Request New Link
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                required
              />

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
