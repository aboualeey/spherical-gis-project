import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image 
                src="/spherical-logo.svg" 
                alt="Spherical GIS Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">Spherical GIS</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              ©2024 Spherical GIS Ltd. All Rights Reserved.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Powered by the latest geospatial technologies.
            </p>
            <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                  <FaFacebook size={20} />
                </Link>
                <Link href="#" className="text-pink-500 hover:text-pink-600 transition-colors">
                  <FaInstagram size={20} />
                </Link>
                <Link href="#" className="text-blue-400 hover:text-blue-500 transition-colors">
                  <FaTwitter size={20} />
                </Link>
              </div>
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about/company-history" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Company History
                </Link>
              </li>
              <li>
                <Link href="/about/team" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link href="/about/employee-handbook" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Employee Handbook
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/gis" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Geographical Information System
                </Link>
              </li>
              <li>
                <Link href="/services/remote-sensing" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Remote Sensing (RS)
                </Link>
              </li>
              <li>
                <Link href="/services/it" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Information Technology (IT)
                </Link>
              </li>
              <li>
                <Link href="/services/capacity-building" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Capacity Building
                </Link>
              </li>
              <li>
                <Link href="/services/institution-strengthening" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Institution Strengthening
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                 <FaEnvelope className="text-green-400 mt-1 flex-shrink-0" size={16} />
                <a href="mailto:info@sphericalgis.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                  info@sphericalgis.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                 <FaPhone className="text-green-400 mt-1 flex-shrink-0" size={16} />
                <a href="tel:+2348067162388" className="text-gray-300 hover:text-white transition-colors text-sm">
                  +2348067162388
                </a>
              </div>
              <div className="flex items-start space-x-3">
                 <FaMapMarkerAlt className="text-green-400 mt-1 flex-shrink-0" size={16} />
                <address className="text-gray-300 text-sm not-italic leading-relaxed">
                  Royal Plaza, No. 12 Fria Close,<br />
                  Off Ademola Adetokunbo<br />
                  Crescent, Wuse II, Abuja.
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2022 Spherical GIS. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;