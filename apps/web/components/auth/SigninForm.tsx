'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../lib/stores/authStore';
import { signinSchema, SigninFormData } from '../../lib/utils/validation';
import { authAPI } from '../../lib/api/auth';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SigninForm() {
  const { setEmail, setPhoneNumber, setStep, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SigninFormData>({ resolver: zodResolver(signinSchema) });

  const identifier = watch('identifier');

  // Simple email/phone detection (display-only)
  const isEmail = !!identifier && identifier.includes('@');
  const isPhone = !!identifier && /^[\d\s\-\(\)\+]+$/.test(identifier);

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const isEmailInput = data.identifier.includes('@');

      if (isEmailInput) {
        await authAPI.requestEmailOTP({
          email: data.identifier,
          type: 'login',
        });
      } else {
        await authAPI.requestPhoneOTP({
          phoneNumber: data.identifier,
          type: 'login',
        });
      }

      if (isEmailInput) {
        setEmail(data.identifier);
        setPhoneNumber('');
      } else {
        setPhoneNumber(data.identifier);
        setEmail('');
      }

      setStep('signinOtp');
      toast.success(`Verification code sent to your ${isEmailInput ? 'email' : 'phone'}!`);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleSignupLink = () => {
    const { setAuthMode, setStep, reset } = useAuthStore.getState();
    reset();
    setAuthMode('signup');
    setStep('userType');
  };

  return (
    <div className="min-h-screen w-full bg-white sm:bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[400px] sm:bg-white sm:rounded-3xl sm:shadow-xl sm:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-slate-500 text-lg">
              Sign in to continue your journey
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-slate-700 ml-1">
              Email or Phone Number
            </Label>
            <div className="relative group">
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="name@example.com or +1234567890"
                disabled={isSubmitting || isLoading}
                className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50 text-lg transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                {...register('identifier')}
                aria-invalid={!!errors.identifier}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500">
                {isEmail ? (
                  <Mail className="w-6 h-6" />
                ) : isPhone ? (
                  <Phone className="w-6 h-6" />
                ) : (
                  <Mail className="w-6 h-6" />
                )}
              </div>
            </div>

            {/* Error / Help */}
            <div className="min-h-[20px] px-1">
              {errors.identifier ? (
                <p className="text-sm font-medium text-rose-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {errors.identifier.message}
                </p>
              ) : identifier && (
                <p className="text-sm text-slate-500 animate-in slide-in-from-top-1">
                  {isEmail
                    ? "We'll send a code to your email"
                    : isPhone
                      ? "We'll send a code via SMS"
                      : 'Enter a valid email or phone number'}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full h-14 rounded-2xl bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Sending code...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </form>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-slate-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={handleSignupLink}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-2 transition-colors"
            >
              Sign up now
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 leading-relaxed px-4">
            By continuing, you agree to our{' '}
            <a href="/terms" className="hover:text-slate-600 underline underline-offset-2">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="hover:text-slate-600 underline underline-offset-2">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
