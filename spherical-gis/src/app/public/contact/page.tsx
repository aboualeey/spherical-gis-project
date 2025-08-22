'use client';

import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/components/forms/ContactForm';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';

export default function ContactPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitSuccess = () => {
    setSubmitSuccess(true);
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <MainLayout>
      {/* Hero Section with Background Image */}
      <div className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/contact-spherical-gis.jpg"
            alt="Contact Spherical GIS"
            className="w-full h-full object-cover"
          />

        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white max-w-3xl mx-auto leading-relaxed">
              Spherical House is your most reliable choice, welcome to join hands with us to create a prosperous future.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get In Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaPhone className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                    <p className="mt-1 text-gray-600">+234 123 456 7890</p>
                    <p className="mt-1 text-gray-600">+234 987 654 3210</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaEnvelope className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                    <p className="mt-1 text-gray-600">info@sphericalgis.com</p>
                    <p className="mt-1 text-gray-600">sales@sphericalgis.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaMapMarkerAlt className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Office Address</h3>
                    <p className="mt-1 text-gray-600">
                      123 Business Avenue, Victoria Island<br />
                      Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Monday - Friday</p>
                    <p className="text-gray-600">8:00 AM - 5:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Saturday</p>
                    <p className="text-gray-600">9:00 AM - 2:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Sunday</p>
                    <p className="text-gray-600">Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
              
              <SectionErrorBoundary>
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Message Sent Successfully</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setSubmitSuccess(false)}
                            className="text-sm font-medium text-green-600 hover:text-green-500"
                          >
                            Send another message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ContactForm onSuccess={handleSubmitSuccess} />
                )}
              </SectionErrorBoundary>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-4">
            <div className="aspect-w-16 aspect-h-9 w-full">
              {/* In a real application, this would be a Google Maps or other map integration */}
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">Map would be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">123 Business Avenue, Victoria Island, Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}