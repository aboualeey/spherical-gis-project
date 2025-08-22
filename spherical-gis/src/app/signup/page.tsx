'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SignupForm from '@/components/forms/SignupForm';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/ui/Carousel';
import { FaInfoCircle, FaShieldAlt } from 'react-icons/fa';

export default function SignupPage() {
  const [success, setSuccess] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    const callback = searchParams.get('callbackUrl');
    
    if (message) {
      setAuthMessage(message);
    }
    
    if (callback) {
      setCallbackUrl(callback);
    }
  }, [searchParams]);

  const handleSignupSuccess = () => {
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Registration successful! You can now sign in.</p>
                </div>
              </div>
            </div>
            <Link href="/login" className="text-green-600 hover:text-green-500 font-medium">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-center py-4 px-4">
          <Image
            src="/spherical-logo.svg"
            alt="Spherical GIS Logo"
            width={32}
            height={32}
            className="h-8 w-auto mr-3"
          />
          <h1 className="text-xl font-bold text-gray-900">Spherical GIS</h1>
        </div>
        
        {/* Mobile auth messages */}
        {authMessage && (
          <div className="mx-4 mb-4">
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 flex items-start space-x-3">
              <FaShieldAlt className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-800">Authentication Required</p>
                <p className="text-sm text-blue-700 mt-1">{authMessage}</p>
                {callbackUrl && (
                  <p className="text-xs text-blue-600 mt-2">
                    You'll be redirected to: <span className="font-mono">{callbackUrl}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Carousel - Hidden on Mobile */}
      <div className="hidden lg:block relative">
        <Carousel
          items={[
            { src: '/Geo-spatial1.jpeg', alt: 'Spherical GIS Solutions', caption: 'Join Our Platform', type: 'image' },
            { src: '/Geo-spatial2.jpg', alt: 'GIS & Remote Sensing', caption: 'Create Your Account', type: 'image' },
            { src: '/carousel-3.svg', alt: 'Solar Energy Solutions', caption: 'Get Started Today', type: 'image' }
          ]}
          autoSlide={true}
          autoSlideInterval={5000}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 mr-4">
                <Image
                  src="/spherical-logo.svg"
                  alt="Spherical GIS Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Sign Up</h1>
            </div>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Create your Spherical GIS account to get started
            </p>
            {authMessage && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 flex items-start space-x-3">
                  <FaShieldAlt className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-blue-800">Authentication Required</p>
                    <p className="text-sm text-blue-700 mt-1">{authMessage}</p>
                    {callbackUrl && (
                      <p className="text-xs text-blue-600 mt-2">
                        You'll be redirected to: <span className="font-mono">{callbackUrl}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8">
        <div className="w-full max-w-md space-y-6 lg:space-y-8">
          {/* Desktop auth message */}
          {authMessage && (
            <div className="hidden lg:block bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Access Restricted</p>
                  <p className="text-sm text-blue-700 mt-1">{authMessage}</p>
                  {callbackUrl && (
                    <p className="text-xs text-blue-600 mt-2">
                      After signing up, you'll be redirected to: <br />
                      <span className="font-mono text-xs break-all">{callbackUrl}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="hidden lg:flex items-center justify-center mb-6">
              <Image
                src="/spherical-logo.svg"
                alt="Spherical GIS Logo"
                width={80}
                height={80}
                className="h-16 sm:h-20 w-auto"
              />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Join us today and start your journey
            </p>
          </div>

          <SectionErrorBoundary>
            <SignupForm 
              onSuccess={handleSignupSuccess} 
              callbackUrl={callbackUrl}
            />
          </SectionErrorBoundary>
          
          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}