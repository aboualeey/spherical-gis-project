'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToDashboard = () => {
    if (session?.user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  What happened?
                </h2>
                <p className="text-sm text-gray-600">
                  The page you're trying to access requires specific permissions that your account doesn't have.
                  {session?.user?.role && (
                    <span className="block mt-2">
                      Your current role: <span className="font-medium">{session.user.role}</span>
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="primary"
                  className="w-full"
                >
                  Go to Home
                </Button>

                {session?.user && (
                  <Button
                    onClick={handleGoToDashboard}
                    variant="secondary"
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  If you believe this is an error, please contact your administrator.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}