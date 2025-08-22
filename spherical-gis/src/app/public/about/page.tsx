'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaUsers, FaAward, FaHandshake, FaGlobe } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Carousel from '@/components/ui/Carousel';
import { useCarousel } from '@/lib/hooks/useCarousel';

export default function AboutPage() {
  // Use dynamic carousel items from admin panel
  const carouselItems = useCarousel('about');

  return (
    <MainLayout>
      {/* Hero Section with Carousel */}
      <section className="relative h-[500px] w-full">
        <Carousel
          items={carouselItems}
          className="h-[500px]"
        />
        {/* <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-40">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Spherical GIS & RS LTD</h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Your trusted partner for geospatial solutions and renewable energy services.
            </p>
          </div>
        </div> */}
      </section>

      {/* Company Overview */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:space-x-12 mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                  <Image 
                    src="/Spherical-md.jpg" 
                    alt="Spherical GIS & RS Team" 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Spherical GIS & RS LTD was founded with a vision to provide cutting-edge geospatial solutions and renewable energy services to businesses, organizations, and communities across the region.
                </p>
                <p className="text-gray-600">
                  With years of experience in the industry, our team of experts combines technical knowledge with practical insights to deliver solutions that address real-world challenges and drive sustainable development.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mission & Vision</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                  <p className="text-gray-600">
                    To empower organizations and communities with innovative geospatial solutions and renewable energy services that promote sustainable development, informed decision-making, and environmental stewardship.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                  <p className="text-gray-600">
                    To be the leading provider of integrated geospatial and renewable energy solutions in the region, recognized for excellence, innovation, and commitment to sustainability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide our work and define our approach to every project and client relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, delivering high-quality solutions that exceed expectations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAward className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We embrace innovation and continuously seek new approaches and technologies to solve complex challenges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Integrity</h3>
              <p className="text-gray-600">
                We conduct our business with honesty, transparency, and ethical standards that build trust and lasting relationships.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGlobe className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability</h3>
              <p className="text-gray-600">
                We are committed to promoting sustainable practices that protect the environment and benefit communities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-700 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Work With Us?</h2>
            <p className="text-xl text-green-100 mb-8">
              Contact us today to discuss how our expertise can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/public/contact" className="inline-block bg-white text-green-700 py-3 px-6 rounded-md font-medium hover:bg-gray-100 transition duration-300">
                Contact Us
              </Link>
              <Link href="/public/services" className="inline-block bg-transparent text-white py-3 px-6 rounded-md font-medium border border-white hover:bg-green-800 transition duration-300">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
// ... existing code ...