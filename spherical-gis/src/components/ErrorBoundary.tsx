'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      // logErrorToService(error, errorInfo);
    }

    // Show toast notification for component-level errors
    if (this.props.level === 'component') {
      toast.error('A component failed to load. Please try refreshing.');
    }
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1
    });
  };

  private handleAutoRetry = () => {
    if (this.state.retryCount < 3) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleReset();
      }, 2000);
    }
  };

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private renderErrorUI() {
    const { level = 'page', showDetails = process.env.NODE_ENV === 'development' } = this.props;
    const { error, errorInfo, retryCount } = this.state;

    // Component-level error (minimal UI)
    if (level === 'component') {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-800">Component failed to load</span>
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    // Section-level error
    if (level === 'section') {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <svg className="w-8 h-8 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Section Error</h3>
            <p className="text-sm text-red-600 mb-4">This section failed to load properly.</p>
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // Page-level error (full UI)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            {retryCount > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Retry attempt: {retryCount}/3
              </p>
            )}
            {showDetails && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details
                </summary>
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-40">
                  <div className="font-semibold mb-1">Error:</div>
                  <pre className="whitespace-pre-wrap">{error.message}</pre>
                  {error.stack && (
                    <>
                      <div className="font-semibold mt-2 mb-1">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </>
                  )}
                  {errorInfo && (
                    <>
                      <div className="font-semibold mt-2 mb-1">Component Stack:</div>
                      <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
          <div className="mt-6 flex space-x-3">
            <Button
              onClick={this.handleReset}
              variant="outline"
              className="flex-1"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? 'Max Retries' : 'Try Again'}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>
          {retryCount < 3 && (
            <div className="mt-3 text-center">
              <button
                onClick={this.handleAutoRetry}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Auto-retry in 2 seconds
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Convenience components for different error boundary levels
export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
);

export const SectionErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="section" />
);

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
);

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service
      // logErrorToService(error, errorInfo);
    }
  };

  return { handleError };
};

// Async error handler for promises
export const handleAsyncError = (error: any) => {
  console.error('Async error:', error);
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service
    // logErrorToService(error);
  }
};