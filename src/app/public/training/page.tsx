'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaUsers, FaCertificate, FaLaptop, FaChalkboardTeacher, FaClock, FaMapMarkedAlt } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Carousel from '@/components/ui/Carousel';
import { formatNaira } from '@/lib/utils/currency';

export default function TrainingPage() {
  const trainingPrograms = [
    {
      id: 1,
      title: "GIS Fundamentals",
      duration: "5 Days",
      level: "Beginner",
      price: 250000,
      description: "Learn the basics of Geographic Information Systems, including data collection, analysis, and visualization.",
      features: [
        "Introduction to GIS concepts",
        "Spatial data types and formats",
        "Basic mapping and cartography",
        "Hands-on software training",
        "Certificate of completion"
      ]
    },
    {
      id: 2,
      title: "Remote Sensing Applications",
      duration: "7 Days",
      level: "Intermediate",
      price: 375000,
      description: "Advanced training in satellite imagery analysis, change detection, and environmental monitoring.",
      features: [
        "Satellite image processing",
        "Land cover classification",
        "Change detection techniques",
        "Environmental monitoring",
        "Project-based learning"
      ]
    },
    {
      id: 3,
      title: "Solar Installation Training",
      duration: "3 Days",
      level: "Beginner to Intermediate",
      price: 200000,
      description: "Comprehensive training on solar panel installation, system design, and maintenance.",
      features: [
        "Solar system components",
        "Installation best practices",
        "Safety procedures",
        "System maintenance",
        "Certification preparation"
      ]
    },
    {
      id: 4,
      title: "Advanced GIS Analysis",
      duration: "10 Days",
      level: "Advanced",
      price: 600000,
      description: "Master advanced spatial analysis techniques, modeling, and custom application development.",
      features: [
        "Spatial modeling",
        "Network analysis",
        "3D analysis",
        "Custom tool development",
        "Research project"
      ]
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full">
        <Carousel
          items={[
            { src: '/Geo-spatial1.jpeg', alt: 'GIS Training', caption: 'Professional GIS Training Programs', type: 'image' },
            { src: '/Geo-spatial2.jpg', alt: 'Remote Sensing Training', caption: 'Advanced Remote Sensing Courses', type: 'image' },
            { src: '/carousel-3.svg', alt: 'Solar Training', caption: 'Solar Installation Certification', type: 'image' }
          ]}
          className="h-[500px]"
        />
      </section>

      {/* Training Overview */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Training Programs</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enhance your skills with our comprehensive training programs in GIS, Remote Sensing, and Solar Installation. 
              Led by industry experts with hands-on practical experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChalkboardTeacher className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry professionals with years of practical experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLaptop className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hands-on Learning</h3>
              <p className="text-gray-600">Practical exercises and real-world projects to reinforce learning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCertificate className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600">Receive industry-recognized certificates upon successful completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Training Programs</h2>
            <p className="text-lg text-gray-600">Choose from our range of specialized training courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainingPrograms.map((program) => (
              <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                    <span className="text-2xl font-bold text-green-600">{formatNaira(program.price)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      {program.duration}
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      {program.level}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">What you'll learn:</h4>
                    <ul className="space-y-1">
                      {program.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link 
                      href="/public/contact" 
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 text-center"
                    >
                      Enroll Now
                    </Link>
                    <Link 
                      href="/public/contact" 
                      className="flex-1 border border-green-600 text-green-600 py-2 px-4 rounded-md hover:bg-green-50 transition duration-300 text-center"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Training */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Custom Training Solutions</h2>
            <p className="text-lg text-gray-600 mb-8">
              Need specialized training for your organization? We offer customized training programs 
              tailored to your specific requirements and delivered at your location.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <FaMapMarkedAlt className="text-green-600 text-3xl mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">On-site Training</h3>
                <p className="text-gray-600 text-sm">We come to your location with all necessary equipment</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <FaUsers className="text-green-600 text-3xl mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Group Discounts</h3>
                <p className="text-gray-600 text-sm">Special rates for organizations training multiple employees</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <FaCertificate className="text-green-600 text-3xl mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Custom Curriculum</h3>
                <p className="text-gray-600 text-sm">Training content adapted to your industry and use cases</p>
              </div>
            </div>
            
            <Link 
              href="/public/contact" 
              className="inline-block bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition duration-300 font-medium"
            >
              Request Custom Training
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}