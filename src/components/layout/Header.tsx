'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/spherical-logo.svg"
            alt="Spherical GIS & RS Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
            priority
            unoptimized
          />
          <span className="text-2xl font-bold text-green-600"></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
            Home
          </Link>
          <Link href="/public/about" className="text-gray-700 hover:text-green-600 font-medium">
            About Us
          </Link>
          <Link href="/public/services" className="text-gray-700 hover:text-green-600 font-medium">
            Services
          </Link>
          <Link href="/public/products" className="text-gray-700 hover:text-green-600 font-medium">
            Products
          </Link>
          <Link href="/public/training" className="text-gray-700 hover:text-green-600 font-medium">
            Training
          </Link>
          <Link href="/public/blogs" className="text-gray-700 hover:text-green-600 font-medium">
            Blogs
          </Link>
          <Link href="/public/contact" className="text-gray-700 hover:text-green-600 font-medium">
            Contact
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/public/about" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/public/services" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/public/products" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              href="/public/training" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Training
            </Link>
            <Link 
              href="/public/blogs" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
            <Link 
              href="/public/contact" 
              className="text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;