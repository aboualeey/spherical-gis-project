'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
  email?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
}

export interface FieldConfig {
  rules?: ValidationRule;
  label?: string;
  dependencies?: string[];
}

export interface FormConfig {
  [fieldName: string]: FieldConfig;
}

export interface FormErrors {
  [fieldName: string]: string;
}

export interface FormTouched {
  [fieldName: string]: boolean;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  config: FormConfig = {}
): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateValue = useCallback((field: keyof T, value: T[keyof T], allValues: T): string | null => {
    const fieldConfig = config[field as string];
    if (!fieldConfig?.rules) return null;

    const rules = fieldConfig.rules;
    const label = fieldConfig.label || String(field);

    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${label} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${label} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${label} must be no more than ${rules.maxLength} characters`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${label} format is invalid`;
      }
      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `${label} must be a valid email address`;
      }
      if (rules.url && !/^https?:\/\/.+/.test(value)) {
        return `${label} must be a valid URL`;
      }
    }

    // Number validations
    if (rules.number) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${label} must be a valid number`;
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return `${label} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `${label} must be no more than ${rules.max}`;
      }
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value, allValues);
    }

    return null;
  }, [config]);

  const validateField = useCallback((field: keyof T): boolean => {
    const error = validateValue(field, values[field], values);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      return true;
    }
  }, [values, validateValue]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isFormValid = true;

    Object.keys(values).forEach(field => {
      const error = validateValue(field, values[field], values);
      if (error) {
        newErrors[field] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [values, validateValue]);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Auto-validate on change if field was touched
    if (touched[field as string]) {
      setTimeout(() => {
        const error = validateValue(field, value, { ...values, [field]: value });
        if (error) {
          setErrors(prev => ({ ...prev, [field]: error }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field as string];
            return newErrors;
          });
        }
      }, 0);
    }
  }, [touched, validateValue, values]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched: FormTouched = {};
      Object.keys(values).forEach(key => {
        allTouched[key] = true;
      });
      setTouchedState(allTouched);

      if (!validateForm()) {
        toast.error('Please fix the form errors before submitting');
        return;
      }

      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        if (error instanceof Error) {
          toast.error(error.message || 'Form submission failed');
        } else {
          toast.error('Form submission failed');
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm]);

  const reset = useCallback((newValues?: Partial<T>) => {
    setValuesState(newValues ? { ...initialValues, ...newValues } : initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    setTouched
  };
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    email: true,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/
  },
  url: {
    url: true
  },
  required: {
    required: true
  }
};