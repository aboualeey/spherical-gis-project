'use client';

import { useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Carousel from '@/components/ui/Carousel';
import QuoteForm from '@/components/forms/QuoteForm';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';

export default function QuotePage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitSuccess = () => {
    setSubmitSuccess(true);
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };



  const getTimeframeLabel = (value: string): string => {
    const labels: Record<string, string> = {
      immediate: 'Immediate (ASAP)',
      within_1_month: 'Within 1 month',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      flexible: 'Flexible / Not sure yet',
    };
    return labels[value] || value;
  };

  return (
    <MainLayout>
      {/* Hero Section with Carousel */}
      <section className="relative h-[500px] w-full">
        <Carousel
          items={[
            { src: '/Geo-spatial1.jpeg', alt: 'Spherical GIS Solutions', caption: 'Innovative Geospatial Technology', type: 'image' },
            { src: '/Geo-spatial2.jpg', alt: 'GIS & Remote Sensing', caption: 'Advanced Spatial Analysis', type: 'image' },
            { src: '/carousel-3.svg', alt: 'Solar Energy Solutions', caption: 'Sustainable Power for the Future', type: 'image' }
          ]}
          className="h-[500px]"
        />
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-opacity-40">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Quote</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Fill out the form below and our team will get back to you with a customized quote
            </p>
          </div>
        </div>
      </section>
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Request a Quote</h1>
              <p className="text-lg text-gray-600">
                Fill out the form below to request a customized quote for our services. We'll get back to you with a detailed proposal tailored to your needs.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quote Request Submitted!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for your interest in our services. Our team will review your request and get back to you within 24-48 business hours with a customized quote.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <SectionErrorBoundary>
                  <div className="flex items-center mb-8">
                    <FaClipboardList className="text-green-600 text-2xl mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Your Quote Request</h2>
                  </div>
                  <QuoteForm onSuccess={handleSubmitSuccess} />
                </SectionErrorBoundary>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}