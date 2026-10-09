import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { api } from '../../lib/api';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ message: string; devToken?: string }>('/auth/forgot-password', data);
      setIsSuccess(true);
      if (res?.devToken) {
        setDevToken(res.devToken);
      }
    } catch (err) {
      setIsSuccess(true); // show generic message for security
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
          Reset Your Password
        </h2>
        <p className="text-xs text-[#77716B]">
          Enter your registered email and we'll dispatch password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-luxury-lg rounded-3xl border border-[#E8E0D6] space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#24845D] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#24211F]">Check Your Inbox</h4>
              <p className="text-xs text-[#77716B] leading-relaxed">
                If the email is registered in the system, password reset instructions have been dispatched.
              </p>

              {devToken && (
                <div className="p-3 bg-[#FAF7F2] border border-[#EBDDBF] rounded-xl text-left text-xs space-y-1">
                  <span className="font-bold text-[#B8955A] block">Local Dev Reset Link:</span>
                  <Link
                    to={`/admin/reset-password?token=${devToken}`}
                    className="text-[#24845D] font-mono break-all hover:underline"
                  >
                    Click to Reset Password with Token
                  </Link>
                </div>
              )}

              <Link to="/admin/login" className="block pt-2">
                <Button variant="secondary" size="md" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="e.g. admin@sathuragiridecoration.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
                required
              />

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/admin/login"
              className="text-xs font-semibold text-[#77716B] hover:text-[#B8955A] inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
