'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../lib/stores/authStore';
import { IndividualSignupFormData } from '../../lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Mail, Phone, ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import toast from 'react-hot-toast';

export default function IndividualSignupForm() {
  const { email: storeEmail, phoneNumber: storePhone, setLoading, isLoading, setUser, setStep } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IndividualSignupFormData>({
    defaultValues: {
      name: '',
      address: '',
      acceptTerms: false,
    },
  });

  const watchedAddress = watch('address');

  // Complete Signup
  const onSubmit = async (data: IndividualSignupFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Validation
      if (!storeEmail && !storePhone) {
        toast.error('Email or phone number is required');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (!data.name || data.name.trim().length < 2) {
        toast.error('Full name is required (minimum 2 characters)');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (!data.address || data.address.trim().length < 10) {
        toast.error('Address is required (minimum 10 characters)');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (!data.acceptTerms) {
        toast.error('You must accept the Terms and Conditions');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      const { authAPI, tokenManager } = await import('../../lib/api/auth');

      // Create account with verified email and phone from EmailStep
      const signupData = {
        accountType: 'individual' as const,
        email: storeEmail || undefined,
        phone: storePhone || undefined,
        name: data.name.trim(),
        address: data.address.trim(),
      };

      const response = await authAPI.signup(signupData);

      if (response?.token) {
        tokenManager.setToken(response.token);
      }

      const user = response?.user || response;

      setUser(user);
      setStep('success');
      toast.success('Account created successfully! 🎉');
    } catch (error: any) {
      console.error('Signup failed:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create account. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
  };

  return (
    <div className="w-full max-w-[400px] mx-auto space-y-8">
      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="w-12 h-1 bg-green-500 rounded-full" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-50">
            <span className="text-sm font-bold">2</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Complete Profile</h2>
        <p className="text-slate-500">Tell us a bit more about yourself</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Display Email/Phone (Non-editable) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          {storeEmail && (
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-medium truncate">{storeEmail}</span>
            </div>
          )}
          {storePhone && (
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Phone className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="font-medium">{storePhone}</span>
            </div>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700 ml-1">Full Name</Label>
          <div className="relative group">
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting || isLoading}
              className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50 text-lg transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
              {...register('name')}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <User className="w-6 h-6" />
            </div>
          </div>
          {errors.name && (
            <p className="text-sm font-medium text-rose-500 ml-1">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <AddressAutocomplete
            value={watchedAddress || ''}
            onChange={(value) => setValue('address', value)}
            label="Address"
            placeholder="Search for your address"
            error={errors.address?.message}
            disabled={isSubmitting || isLoading}
          />
        </div>

        {/* Terms */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                disabled={isSubmitting || isLoading}
                {...register('acceptTerms')}
              />
              <div className="w-6 h-6 rounded-lg border-2 border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200" />
              <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 left-1 top-1 transition-opacity duration-200" />
            </div>
            <div className="text-sm text-slate-600 leading-relaxed pt-0.5">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">Terms</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">Privacy Policy</a>
            </div>
          </label>
          {errors.acceptTerms && (
            <p className="text-sm font-medium text-rose-500 mt-2 ml-1">{errors.acceptTerms.message}</p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full h-14 rounded-2xl bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="w-full h-12 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}
