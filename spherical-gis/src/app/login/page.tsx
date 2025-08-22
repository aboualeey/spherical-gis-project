'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/forms/LoginForm';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/ui/Carousel';
import { FaInfoCircle, FaShieldAlt } from 'react-icons/fa';

export default function LoginPage() {
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

  const handleLoginSuccess = () => {
    // Login success is handled by the LoginForm component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="flex items-center justify-center py-4 px-6">
          <Image
            src="/spherical-logo.svg"
            alt="Spherical GIS Logo"
            width={40}
            height={40}
            className="mr-3"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Spherical GIS
          </h1>
        </div>
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
            { src: '/Geo-spatial1.jpeg', alt: 'Spherical GIS Solutions', caption: 'Welcome Back', type: 'image' },
            { src: '/Geo-spatial2.jpg', alt: 'GIS & Remote Sensing', caption: 'Access Your Account', type: 'image' },
            { src: '/carousel-3.svg', alt: 'Solar Energy Solutions', caption: 'Manage Your Inventory', type: 'image' }
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
              <h1 className="text-4xl md:text-5xl font-bold text-white">Login</h1>
            </div>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Access your Spherical GIS account to manage inventory and more
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
      
      <div className="flex-1 flex items-center justify-center py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
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
                      After signing in, you'll be redirected to: <br />
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
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Spherical GIS Inventory Management System
            </p>
          </div>

          <SectionErrorBoundary>
            <LoginForm 
              onSuccess={handleLoginSuccess} 
              callbackUrl={callbackUrl}
            />
          </SectionErrorBoundary>
          
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href={callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/signup'} 
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}