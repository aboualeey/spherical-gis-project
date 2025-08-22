'use client';

import { useEffect } from 'react';
import { useFormValidation, commonRules } from '@/lib/hooks/useFormValidation';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

type UserRole = 'managing_director' | 'admin' | 'inventory_manager' | 'cashier' | 'report_viewer';

interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  isActive: boolean;
}

interface UserFormProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: User) => Promise<void>;
  title: string;
}

const roleOptions = [
  { value: 'managing_director', label: 'Managing Director' },
  { value: 'admin', label: 'Administrator' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'report_viewer', label: 'Report Viewer' },
];

export default function UserForm({ user, isOpen, onClose, onSubmit, title }: UserFormProps) {
  const { handleError } = useErrorHandler();
  const isEditing = !!user?.id;

  const initialValues: User = {
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'report_viewer',
    isActive: user?.isActive ?? true,
  };

  const formConfig = {
    name: {
      rules: {
        ...commonRules.name,
        minLength: 2,
        maxLength: 50,
      },
      label: 'Full Name',
    },
    email: {
      rules: {
        ...commonRules.email,
        custom: async (value: string) => {
          if (!value) return null;
          // In a real app, you'd check if email exists
          // For now, just basic validation
          return null;
        },
      },
      label: 'Email Address',
    },
    password: {
      rules: {
        required: !isEditing, // Password required only for new users
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        custom: (value: string) => {
          if (!isEditing && !value) return 'Password is required for new users';
          if (value && value.length < 8) return 'Password must be at least 8 characters';
          if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            return 'Password must contain uppercase, lowercase, number, and special character';
          }
          return null;
        },
      },
      label: 'Password',
    },
    confirmPassword: {
      rules: {
        required: !isEditing && !!initialValues.password,
        custom: (value: string, allValues: User) => {
          if (!isEditing && allValues.password && value !== allValues.password) {
            return 'Passwords do not match';
          }
          return null;
        },
      },
      label: 'Confirm Password',
    },
    role: {
      rules: {
        required: true,
      },
      label: 'Role',
    },
  };

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit,
    reset,
  } = useFormValidation(initialValues, formConfig);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  const onFormSubmit = handleSubmit(async (formData: User) => {
    try {
      const submitData = { ...formData };
      
      // Remove password fields if editing and password is empty
      if (isEditing && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      // Remove confirmPassword from final data
      delete submitData.confirmPassword;
      
      await onSubmit(submitData);
      toast.success(isEditing ? 'User updated successfully' : 'User created successfully');
      onClose();
    } catch (error) {
      handleError(error, 'Failed to save user');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onFormSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
              onBlur={() => setTouched('name')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && touched.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <FaEnvelope className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              onBlur={() => setTouched('email')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              <FaLock className="inline mr-2" />
              Password {isEditing && <span className="text-gray-500">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              id="password"
              value={values.password}
              onChange={(e) => setValue('password', e.target.value)}
              onBlur={() => setTouched('password')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
            />
            {errors.password && touched.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          {(!isEditing || values.password) && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <FaLock className="inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={values.confirmPassword}
                onChange={(e) => setValue('confirmPassword', e.target.value)}
                onBlur={() => setTouched('confirmPassword')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              <FaUserShield className="inline mr-2" />
              Role
            </label>
            <select
              id="role"
              value={values.role}
              onChange={(e) => setValue('role', e.target.value as UserRole)}
              onBlur={() => setTouched('role')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role && touched.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role && touched.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={values.isActive}
              onChange={(e) => setValue('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active User
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}