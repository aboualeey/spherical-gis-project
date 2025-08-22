'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarked, FaSatellite, FaSolarPanel, FaLightbulb, FaChartLine, FaUsers } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Carousel from '@/components/ui/Carousel';
import { useCarousel } from '@/lib/hooks/useCarousel';

export default function ServicesPage() {
  // Use dynamic carousel items from admin panel
  const carouselItems = useCarousel('services');

  return (
    <MainLayout>
      {/* Hero Section with Carousel */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] w-full">
        <Carousel
          items={carouselItems}
          className="h-full"
          autoSlide={true}
          autoSlideInterval={6000}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">Our Services</h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-md">
              Comprehensive GIS, Remote Sensing, and Solar solutions tailored to your needs
            </p>
            <Link 
              href="/public/contact" 
              className="bg-white text-green-600 px-8 py-4 rounded-md font-medium text-lg hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Core Services</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We provide a range of specialized services combining geospatial technology and renewable energy solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* GIS Service */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/Geo-spatial1.jpeg" 
                  alt="GIS Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaMapMarked className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Geographical Information System (GIS)</h3>
                <p className="text-gray-600 mb-4">
                  Efficiently storing, organizing, and maintaining spatial data to ensure accuracy, precision and accessibility.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Spatial data collection and processing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Custom map creation and visualization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Geospatial analysis and modeling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Web-based GIS application development</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Remote Sensing Service */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/Geo-spatial2.jpg" 
                  alt="Remote Sensing Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaSatellite className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Remote Sensing (RS)</h3>
                <p className="text-gray-600 mb-4">
                  Advanced satellite imagery analysis for environmental monitoring and resource management.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Satellite imagery acquisition and processing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Land cover and land use classification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Change detection and time-series analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Vegetation and environmental monitoring</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Capacity Building Service */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/1st-Gis-day.jpg" 
                  alt="Capacity Building Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaUsers className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Capacity Building</h3>
                <p className="text-gray-600 mb-4">
                  Creating plans to engage and involve stakeholders in projects and initiatives.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Stakeholder engagement strategies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Training and skills development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Community involvement planning</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Project participation frameworks</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Policy and Regulatory Plan Consultation */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/placeholder-about.jpg.svg" 
                  alt="Policy Consultation Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaChartLine className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Policy and Regulatory Plan Consultation</h3>
                <p className="text-gray-600 mb-4">
                  Conducting research and analysis to inform policy development and reform.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Policy research and analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Regulatory framework development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Compliance assessment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Reform implementation strategies</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Institution Strengthening */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/Spherical-MD.jpg" 
                  alt="Institution Strengthening Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaLightbulb className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Institution Strengthening</h3>
                <p className="text-gray-600 mb-4">
                  Evaluating an organization's strengths and weaknesses to identify areas for improvement.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Organizational assessment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Capacity development planning</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Process improvement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Performance enhancement strategies</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Information Technology (IT) */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/placeholder-product1.jpg" 
                  alt="IT Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaLightbulb className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Information Technology (IT)</h3>
                <p className="text-gray-600 mb-4">
                  Developing IT strategies aligned with business goals and offering consulting services.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>IT strategy development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Business-aligned technology planning</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>IT consulting services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Technology implementation support</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Solar Installation */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="relative h-48 w-full">
                <Image 
                  src="/solar-panel-1.jpg" 
                  alt="Solar Installation Services" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FaSolarPanel className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solar Installation</h3>
                <p className="text-gray-600 mb-4">
                  We design and install high-quality solar power systems for residential, commercial, and industrial applications, helping you reduce energy costs and carbon footprint.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Solar site assessment and system design</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Residential and commercial solar installations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Battery storage solutions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>System monitoring and maintenance</span>
                  </li>
                </ul>
                <Link href="/public/contact" className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Additional Services</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Beyond our core offerings, we provide specialized services to meet your specific needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Consultancy Service */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <FaLightbulb className="text-green-600 text-3xl mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Consultancy Services</h3>
              <p className="text-gray-600">
                Our team of experts provides consultancy services in GIS, remote sensing, and renewable energy to help you make informed decisions for your projects and business operations.
              </p>
            </div>

            {/* Data Analysis Service */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <FaChartLine className="text-green-600 text-3xl mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Data Analysis & Visualization</h3>
              <p className="text-gray-600">
                We transform complex spatial and non-spatial data into meaningful insights through advanced analysis techniques and compelling visualizations that drive decision-making.
              </p>
            </div>

            {/* Training Service */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <FaUsers className="text-green-600 text-3xl mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Training & Capacity Building</h3>
              <p className="text-gray-600">
                We offer customized training programs in GIS, remote sensing, and renewable energy technologies to enhance your team's skills and capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-700 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-green-100 mb-8">
              Contact us today to discuss how our services can benefit your business or project.
            </p>
            <div className="flex justify-center">
              <Link href="/public/contact" className="inline-block bg-white text-green-700 py-3 px-6 rounded-md font-medium hover:bg-gray-100 transition duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}