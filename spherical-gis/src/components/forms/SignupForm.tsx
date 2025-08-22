'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { commonRules } from '@/lib/hooks/useFormValidation';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';

interface SignupFormProps {
  onSuccess?: () => void;
  isAdmin?: boolean;
  callbackUrl?: string | null;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, isAdmin = false, callbackUrl }) => {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const validationConfig = {
    name: {
      rules: {
        required: true,
        minLength: 2
      },
      label: 'Name'
    },
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
        minLength: 8
      },
      label: 'Password'
    },
    confirmPassword: {
      rules: {
        required: true,
        custom: (value: string, allValues: SignupFormData) => {
          if (value !== allValues.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      },
      label: 'Confirm Password'
    },
    ...(isAdmin && {
      role: {
        rules: {
          required: true
        },
        label: 'Role'
      }
    })
  };

  const {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    handleSubmit,
    reset
  } = useFormValidation<SignupFormData>(
    { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      ...(isAdmin && { role: '' })
    },
    validationConfig
  );

  const onSubmit = async (data: SignupFormData) => {
    try {
      const endpoint = isAdmin ? '/api/admin/users' : '/api/auth/register';
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        ...(isAdmin && { role: data.role })
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const result = await response.json();
      toast.success(isAdmin ? 'User created successfully!' : 'Account created successfully!');
      reset();
      onSuccess?.();
      
      if (!isAdmin) {
        // Redirect to login with callback URL if provided
        const loginUrl = callbackUrl 
          ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/login';
        router.push(loginUrl);
      }
    } catch (error) {
      handleError(error, isAdmin ? 'Failed to create user' : 'Failed to create account');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaUser className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
              className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 hover:bg-white'
              }`}
              placeholder="John Smith"
            />
          </div>
          {errors.name && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
            )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
            Phone or Gmail
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
              placeholder="Joydev@gmail.com"
            />
          </div>
          {errors.email && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
            )}
        </div>

        {isAdmin && (
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={values.role || ''}
              onChange={(e) => setValue('role', e.target.value)}
              className={`block w-full px-4 py-3.5 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-900 bg-gray-50 hover:bg-white ${
                errors.role
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
            >
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
            {errors.role && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.role}</p>
              )}
          </div>
        )}

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
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
            )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={(e) => setValue('confirmPassword', e.target.value)}
              className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 hover:bg-white'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
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
                {isAdmin ? 'Creating user...' : 'Creating account...'}
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2" />
                {isAdmin ? 'Create User' : 'SIGN UP'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;