'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { commonRules } from '@/lib/hooks/useFormValidation';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { ROLES } from '@/lib/utils/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  callbackUrl?: string | null;
}

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, callbackUrl }) => {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [showPassword, setShowPassword] = useState(false);
  
  const validationConfig = {
    email: {
      rules: {
        required: true,
        email: true
      },
      label: 'Email'
    },
    password: {
      rules: {
        required: true,
        minLength: 6
      },
      label: 'Password'
    }
  };

  const {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    handleSubmit,
    reset
  } = useFormValidation<LoginFormData>(
    { email: '', password: '' },
    validationConfig
  );

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Get the session to access user role
      const session = await getSession();
      const userRole = session?.user?.role;

      toast.success('Login successful!');
      reset();
      onSuccess?.();
      
      // Redirect to callback URL if provided, otherwise use role-based redirection
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        // Role-based redirection
        switch (userRole) {
          case ROLES.MANAGING_DIRECTOR:
            router.push('/admin/pages');
            break;
          case ROLES.ADMIN:
            router.push('/admin/dashboard');
            break;
          case ROLES.INVENTORY_MANAGER:
            router.push('/admin/inventory');
            break;
          case ROLES.CASHIER:
            router.push('/admin/sales');
            break;
          case ROLES.REPORT_VIEWER:
            router.push('/admin/reports');
            break;
          default:
            router.push('/admin/dashboard');
        }
      }
    } catch (error) {
      handleError(error, 'Failed to login');
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-white/20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 hover:bg-white'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={values.password}
              onChange={(e) => setValue('password', e.target.value)}
              className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 hover:bg-white'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;