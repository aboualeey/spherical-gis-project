'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSolarPanel, FaTools, FaChartLine, FaDatabase, FaSearch, FaFilter } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Carousel from '@/components/ui/Carousel';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { useProducts } from '@/lib/contexts/ProductsContext';
import { formatNaira } from '@/lib/utils/currency';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  // Use dynamic carousel items from admin panel
  const carouselItems = useCarousel('products');
  const { products: solarProducts } = useProducts();

  const fallbackProducts = [
    {
      id: 1,
      name: "Monocrystalline Solar Panels",
      description: "High-efficiency monocrystalline solar panels from leading manufacturers, designed for optimal performance in various environmental conditions.",
      price: 125000,
      category: "Solar Panels",
      imageUrl: "/placeholder-product1.jpg.svg",
      specifications: "Various sizes available",
      inStock: true
    },
    {
      id: 2,
      name: "Polycrystalline Solar Panels",
      description: "Cost-effective polycrystalline solar panels offering reliable performance for residential and commercial applications.",
      price: 100000,
      category: "Solar Panels",
      imageUrl: "/placeholder-product1.jpg.svg",
      specifications: "Multiple wattages",
      inStock: true
    },
    {
      id: 3,
      name: "String Inverters",
      description: "High-performance string inverters that convert DC electricity from solar panels into AC electricity for home or business use.",
      price: 400000,
      category: "Inverters",
      imageUrl: "/placeholder-product2.jpg.svg",
      specifications: "5kW - 50kW capacity",
      inStock: true
    },
    {
      id: 4,
      name: "Microinverters",
      description: "Advanced microinverters for panel-level optimization and monitoring, maximizing energy harvest.",
      price: 75000,
      category: "Inverters",
      imageUrl: "/placeholder-product2.jpg.svg",
      specifications: "250W - 400W per unit",
      inStock: true
    },
    {
      id: 5,
      name: "Lithium-ion Battery Storage",
      description: "High-capacity lithium-ion battery systems for storing excess solar energy for use during nighttime or power outages.",
      price: 600000,
      category: "Battery Storage",
      imageUrl: "/placeholder-product3.jpg.svg",
      specifications: "10kWh - 100kWh capacity",
      inStock: true
    },
    {
      id: 6,
      name: "Lead-acid Battery Storage",
      description: "Reliable and cost-effective lead-acid battery solutions for solar energy storage applications.",
      price: 200000,
      category: "Battery Storage",
      imageUrl: "/placeholder-product3.jpg.svg",
      specifications: "Various capacities",
      inStock: false
    },
    {
      id: 7,
      name: "Roof Mounting Systems",
      description: "Durable roof mounting systems designed for different roof types including tile, metal, and flat roofs.",
      price: 150000,
      category: "Mounting Systems",
      imageUrl: "/placeholder-product1.jpg.svg",
      specifications: "Custom solutions available",
      inStock: true
    },
    {
      id: 8,
      name: "Ground Mounting Systems",
      description: "Robust ground mounting solutions for large-scale solar installations and ground-mounted arrays.",
      price: 250000,
      category: "Mounting Systems",
      imageUrl: "/placeholder-product1.jpg.svg",
      specifications: "Adjustable tilt angles",
      inStock: true
    },
    {
      id: 9,
      name: "MPPT Charge Controllers",
      description: "Maximum Power Point Tracking charge controllers for optimal battery charging efficiency.",
      price: 90000,
      category: "Charge Controllers",
      imageUrl: "/placeholder-product2.jpg.svg",
      specifications: "20A - 100A capacity",
      inStock: true
    },
    {
      id: 10,
      name: "PWM Charge Controllers",
      description: "Pulse Width Modulation charge controllers offering reliable and cost-effective battery charging.",
      price: 40000,
      category: "Charge Controllers",
      imageUrl: "/placeholder-product2.jpg.svg",
      specifications: "10A - 60A capacity",
      inStock: true
    },
    {
      id: 11,
      name: "Solar Cables & Connectors",
      description: "High-quality UV-resistant cables and MC4 connectors for reliable solar panel connections.",
      price: 25000,
      category: "Accessories",
      imageUrl: "/placeholder-product3.jpg.svg",
      specifications: "Various lengths",
      inStock: true
    },
    {
      id: 12,
      name: "Monitoring Systems",
      description: "Advanced monitoring systems to track solar system performance and energy production in real-time.",
      price: 175000,
      category: "Accessories",
      imageUrl: "/placeholder-product3.jpg.svg",
      specifications: "WiFi & cellular options",
      inStock: true
    }
  ];

  const productsToUse = solarProducts.length > 0 ? solarProducts : fallbackProducts;
  const categories = ['all', 'Solar Panels', 'Inverters', 'Battery Storage', 'Mounting Systems', 'Charge Controllers', 'Accessories'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50000', label: '₦0 - ₦50,000' },
    { value: '50001-150000', label: '₦50,001 - ₦150,000' },
    { value: '150001-300000', label: '₦150,001 - ₦300,000' },
    { value: '300001-500000', label: '₦300,001 - ₦500,000' },
    { value: '500001+', label: '₦500,001+' }
  ];

  const filteredProducts = productsToUse.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      if (priceRange === '0-50000') matchesPrice = product.price <= 50000;
      else if (priceRange === '50001-150000') matchesPrice = product.price >= 50001 && product.price <= 150000;
      else if (priceRange === '150001-300000') matchesPrice = product.price >= 150001 && product.price <= 300000;
      else if (priceRange === '300001-500000') matchesPrice = product.price >= 300001 && product.price <= 500000;
      else if (priceRange === '500001+') matchesPrice = product.price >= 500001;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <MainLayout>
      {/* Hero Section with Carousel */}
      <section className="relative h-[500px] w-full">
        <Carousel
          items={carouselItems}
          className="h-[500px]"
        />
      </section>

      {/* Search and Filter Section */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition duration-300 ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    {category === 'all' ? 'All Products' : category}
                  </button>
                ))}
              </div>

              {/* Price Filter */}
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solar Products Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Solar Installation Materials</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We offer a comprehensive range of high-quality solar installation materials for residential and commercial applications.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Showing {filteredProducts.length} of {productsToUse.length} products
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                }}
                className="mt-4 text-green-600 hover:text-green-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="relative h-64 w-full">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {!product.inStock && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                      <span className="text-2xl font-bold text-green-600 ml-2">{formatNaira(product.price)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-green-600 font-semibold text-sm">{product.specifications}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        href={`/public/products/${product.id}`}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 text-center text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GIS Products Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">GIS & Remote Sensing Solutions</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We offer specialized geospatial software and data products to meet your mapping and analysis needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Custom Maps */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
              <div className="flex items-start">
                <div className="mr-4">
                  <FaChartLine className="text-green-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Custom Maps & Visualizations</h3>
                    <span className="text-lg font-bold text-green-600">From ₦250,000</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Professionally designed maps and spatial visualizations tailored to your specific requirements, available in digital and print formats.
                  </p>
                  <Link href="/public/contact" className="text-green-600 hover:text-green-800 font-medium">
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>

            {/* Spatial Databases */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
              <div className="flex items-start">
                <div className="mr-4">
                  <FaDatabase className="text-green-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Spatial Databases</h3>
                    <span className="text-lg font-bold text-green-600">From ₦500,000</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Comprehensive spatial databases with accurate, up-to-date geographic information for various regions and applications.
                  </p>
                  <Link href="/public/contact" className="text-green-600 hover:text-green-800 font-medium">
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-700 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Need Custom Solutions?</h2>
            <p className="text-xl text-green-100 mb-8">
              Contact us today to discuss your specific requirements and get personalized recommendations.
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