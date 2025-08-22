'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaSolarPanel, FaMapMarkedAlt, FaSatellite, FaLightbulb } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Carousel from '@/components/ui/Carousel';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  // Use dynamic carousel items from admin panel
  const carouselItems = useCarousel('home');

  const gisCards = [
    {
      title: "Choosing the right location",
      content: "Make better decisions about business growth or service expansion. Know where your best customers are and discover where to find more of them.\n\nWhen selecting the ideal place for a new retail store, distribution hub, or fire station, GIS can bring together all the information important to your decision. Consider what's nearby, travel times, population numbers, local demographics, site suitability, and competitor locations.",
      video: "/01-gis-location.mp4"
    },
    {
      title: "Finding the best route",
      content: "Make logistics operations more efficient and adaptable. Reduce costs and emissions. Keep drivers safe and customers happy.\n\nSophisticated GIS technology can handle complex routing and logistics scenarios, such as coordinating daily routes for a large fleet of delivery vehicles or managing a global supply chain in real time.",
      video: "/02-gis-route.mp4"
    },
    {
      title: "Keeping track of things",
      content: "Get a better understanding of everything you manage. Respond to issues quickly. Plan preventative maintenance so things don't break down.\n\nRoads, water pipes, streetlights, company vehicles—these are all things GIS can help you take care of throughout their life cycles. GIS tells you where things are and what condition they're in.",
      video: "/03-gis-track.mp4"
    },
    {
      title: "Planning for the future",
      content: "Make predictions and informed decisions that benefit both people and the planet. Model possible scenarios to address complex challenges like climate resilience and sustainability.\n\nGIS analysis can identify where adding green spaces would reduce extreme heat for the most vulnerable, or where expected population growth would support a business expansion.",
      video: "/04-gis-plan.mp4"
    },
    {
      title: "Responding to emergencies",
      content: "Protect people and save lives before, during, and after emergencies such as hurricanes, fires, and earthquakes.\n\nGIS helps responders understand what is happening right now, and where, so they can help where it's needed most. Emergency management teams use GIS before and after emergencies for planning and recovery.",
      video: "/05-gis-respond.mp4"
    }
  ];

  const tabNames = ['Location Selection', 'Route Optimization', 'Asset Tracking', 'Future Planning', 'Emergency Response'];

  return (
    <MainLayout>
      {/* Carousel Section */}
      <section className="relative h-[500px] w-full">
        <Carousel
          items={carouselItems}
          className="h-[500px]"
        />
        {/* <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-40">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              GIS, Remote Sensing & Solar Solutions
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Professional geographic information systems, remote sensing services, and solar installation solutions for residential and commercial needs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                href="/public/services" 
                className="bg-white text-green-600 px-6 py-3 rounded-md font-medium text-lg hover:bg-gray-100 transition duration-300 text-center"
              >
                Our Services
              </Link>

            </div>
          </div>
        </div> */}
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive GIS, Remote Sensing, and Solar solutions to meet your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-green-600 mb-4">
                <FaMapMarkedAlt size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">GIS Services</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive geographic information system solutions for spatial data management and analysis.
              </p>
              <Link 
                href="/public/services#gis" 
                className="text-green-600 font-medium hover:underline"
              >
                Learn More
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-green-600 mb-4">
                <FaSatellite size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Remote Sensing</h3>
              <p className="text-gray-600 mb-4">
                Satellite imagery analysis and interpretation for environmental monitoring and resource management.
              </p>
              <Link 
                href="/public/services#remote-sensing" 
                className="text-green-600 font-medium hover:underline"
              >
                Learn More
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-green-600 mb-4">
                <FaSolarPanel size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Solar Installation</h3>
              <p className="text-gray-600 mb-4">
                Professional solar panel installation for residential and commercial properties.
              </p>
              <Link 
                href="/public/services#solar-installation" 
                className="text-green-600 font-medium hover:underline"
              >
                Learn More
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="text-green-600 mb-4">
                <FaLightbulb size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Consultancy</h3>
              <p className="text-gray-600 mb-4">
                Expert advice on GIS implementation, remote sensing applications, and solar energy solutions.
              </p>
              <Link 
                href="/public/services#consultancy" 
                className="text-green-600 font-medium hover:underline"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our selection of high-quality solar and electrical equipment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
              <div className="relative h-64 w-full">
                <Image 
                  src="/solar-panel-1.jpg" 
                  alt="Solar Panel" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Solar Panels</h3>
                <p className="text-gray-500 mb-4">
                  High-efficiency solar panels for residential and commercial use.
                </p>
                <Link 
                  href="/public/products" 
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 inline-block"
                >
                  View Products
                </Link>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
              <div className="relative h-64 w-full">
                <Image 
                  src="/hybrid-inverter.jpeg" 
                  alt="Inverter" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Inverters</h3>
                <p className="text-gray-600 mb-4">
                  Reliable inverters for converting DC to AC power in solar systems.
                </p>
                <Link 
                  href="/public/products" 
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 inline-block"
                >
                  View Products
                </Link>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
              <div className="relative h-64 w-full">
                <Image 
                  src="/battery.png" 
                  alt="Battery Storage" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Energy Storage</h3>
                <p className="text-gray-600 mb-4">
                  Advanced battery systems for storing solar energy.
                </p>
                <Link 
                  href="/public/products" 
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 inline-block"
                >
                  View Products
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link 
              href="/public/products" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium text-lg hover:bg-blue-700 transition duration-300 inline-block"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      
      {/* How is GIS Used Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How is GIS Used?</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            GIS is embedded in the daily operations of virtually every industry. The following are just a few of the thousands of applications.
          </p>

          <div className="flex flex-col space-y-8">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {tabNames.map((tab, index) => (
                <button
                  key={index}
                  className={`px-8 py-3 rounded-full transition duration-300 font-semibold text-lg shadow-md ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-blue-700 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active Card */}
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-3xl font-extrabold mb-6 text-blue-800 border-l-4 border-green-500 pl-4">{gisCards[activeTab].title}</h3>
                    <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">
                      {gisCards[activeTab].content}
                    </p>
                  </div>
                  <div className="md:w-1/2 relative h-[300px]">
                    <video
                      key={activeTab}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      onError={(e) => {
                        console.error('Video playback error:', e);
                        // Fallback: try to reload the video
                        const video = e.target as HTMLVideoElement;
                        setTimeout(() => {
                          video.load();
                        }, 1000);
                      }}
                      onLoadStart={() => {
                        // Ensure video is ready to play
                        const video = document.querySelector(`video[src*="${gisCards[activeTab].video}"]`) as HTMLVideoElement;
                        if (video) {
                          video.currentTime = 0;
                        }
                      }}
                      onCanPlayThrough={(e) => {
                        // Ensure smooth playback
                        const video = e.target as HTMLVideoElement;
                        video.play().catch(err => console.warn('Video autoplay prevented:', err));
                      }}
                    >
                      <source src={gisCards[activeTab].video} type="video/mp4" />
                      <p className="text-gray-500 p-4">Your browser does not support the video tag.</p>
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your GIS, Remote Sensing, or Solar installation needs.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/public/contact" 
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium text-lg hover:bg-gray-100 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
