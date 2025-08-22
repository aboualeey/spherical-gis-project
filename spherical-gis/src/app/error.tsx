'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
    
    // TODO: Log to external error tracking service
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error);
    // }
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Oops! Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-6">
            <div className="space-y-6">
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Error Details (Development Only)
                  </h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
                    {error.message}
                  </pre>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={reset}
                  variant="primary"
                  className="w-full"
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={handleReload}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="secondary"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact our support team.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}