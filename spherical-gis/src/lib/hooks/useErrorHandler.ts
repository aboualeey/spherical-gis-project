'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
}

export interface UseErrorHandlerReturn extends ErrorState {
  handleError: (error: unknown, customMessage?: string) => void;
  clearError: () => void;
  retryAction: (action: () => Promise<void> | void) => Promise<void>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: ''
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error caught by useErrorHandler:', error);
    
    let errorMessage = customMessage || 'An unexpected error occurred';
    let errorObject: Error;

    if (error instanceof Error) {
      errorObject = error;
      if (!customMessage) {
        errorMessage = error.message || errorMessage;
      }
    } else if (typeof error === 'string') {
      errorMessage = customMessage || error;
      errorObject = new Error(error);
    } else {
      errorObject = new Error(errorMessage);
    }

    // Handle specific error types
    if (errorObject.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (errorObject.message.includes('401')) {
      errorMessage = 'You are not authorized to perform this action.';
    } else if (errorObject.message.includes('403')) {
      errorMessage = 'Access denied. You do not have permission for this action.';
    } else if (errorObject.message.includes('404')) {
      errorMessage = 'The requested resource was not found.';
    } else if (errorObject.message.includes('500')) {
      errorMessage = 'Server error. Please try again later.';
    }

    setErrorState({
      error: errorObject,
      isError: true,
      errorMessage
    });

    // Show toast notification
    toast.error(errorMessage);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      // logErrorToService(errorObject);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: ''
    });
  }, []);

  const retryAction = useCallback(async (action: () => Promise<void> | void) => {
    try {
      clearError();
      await action();
    } catch (error) {
      handleError(error, 'Retry failed. Please try again.');
    }
  }, [clearError, handleError]);

  return {
    ...errorState,
    handleError,
    clearError,
    retryAction
  };
}

// Hook for API calls with built-in error handling
export function useApiCall<T = any>() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { handleError, clearError, isError, errorMessage } = useErrorHandler();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: unknown) => void;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await apiCall();
      setData(result);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      if (options?.onError) {
        options.onError(error);
      }
      handleError(error, options?.errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    clearError();
  }, [clearError]);

  return {
    loading,
    data,
    isError,
    errorMessage,
    execute,
    reset
  };
}

// Higher-order component for error boundaries
export function withErrorHandler<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return function ErrorHandledComponent(props: P) {
    const { handleError, isError, error, clearError } = useErrorHandler();

    if (isError && error && fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return React.createElement(FallbackComponent, { error, retry: clearError });
    }

    try {
      return React.createElement(Component, props);
    } catch (error) {
      handleError(error);
      return null;
    }
  };
}