'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-blue-500">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-6xl font-bold text-gray-900">
            404
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-700">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What can you do?
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check the URL for typos</li>
                  <li>• Go back to the previous page</li>
                  <li>• Visit our homepage</li>
                  <li>• Use the search function</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link href="/" className="block">
                  <Button variant="primary" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
                
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline" 
                  className="w-full"
                >
                  Go Back
                </Button>
                
                <Link href="/public/products" className="block">
                  <Button variant="secondary" className="w-full">
                    Browse Products
                  </Button>
                </Link>
                
                <Link href="/public/services" className="block">
                  <Button variant="ghost" className="w-full">
                    View Services
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact us</Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}