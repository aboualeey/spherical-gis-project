'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar, FaUser, FaTag, FaSearch } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: 1,
      title: "The Future of GIS Technology in Urban Planning",
      excerpt: "Explore how Geographic Information Systems are revolutionizing urban planning and smart city development.",
      content: "Full blog content here...",
      imageUrl: "/Geo-spatial1.jpeg",
      author: "Dr. Sarah Johnson",
      publishedAt: "2024-01-15",
      category: "GIS",
      tags: ["GIS", "Urban Planning", "Smart Cities"]
    },
    {
      id: 2,
      title: "Remote Sensing Applications in Agriculture",
      excerpt: "Discover how satellite imagery and remote sensing are transforming modern agriculture practices.",
      content: "Full blog content here...",
      imageUrl: "/Geo-spatial2.jpg",
      author: "Prof. Michael Chen",
      publishedAt: "2024-01-10",
      category: "Remote Sensing",
      tags: ["Remote Sensing", "Agriculture", "Satellite Imagery"]
    },
    {
      id: 3,
      title: "Solar Energy Installation Best Practices",
      excerpt: "A comprehensive guide to solar panel installation, maintenance, and optimization for maximum efficiency.",
      content: "Full blog content here...",
      imageUrl: "/carousel-3.svg",
      author: "Engineer David Wilson",
      publishedAt: "2024-01-05",
      category: "Solar Energy",
      tags: ["Solar", "Installation", "Renewable Energy"]
    },
    {
      id: 4,
      title: "Climate Change Monitoring with Satellite Data",
      excerpt: "How remote sensing technology helps scientists track and understand climate change patterns globally.",
      content: "Full blog content here...",
      imageUrl: "/Geo-spatial1.jpeg",
      author: "Dr. Emily Rodriguez",
      publishedAt: "2023-12-28",
      category: "Remote Sensing",
      tags: ["Climate Change", "Satellite Data", "Environmental Monitoring"]
    },
    {
      id: 5,
      title: "GIS in Emergency Response and Disaster Management",
      excerpt: "Learn how GIS technology plays a crucial role in emergency response, disaster preparedness, and recovery efforts.",
      content: "Full blog content here...",
      imageUrl: "/Geo-spatial2.jpg",
      author: "Captain Lisa Thompson",
      publishedAt: "2023-12-20",
      category: "GIS",
      tags: ["GIS", "Emergency Response", "Disaster Management"]
    },
    {
      id: 6,
      title: "The Economics of Solar Energy: ROI and Savings",
      excerpt: "Analyzing the financial benefits of solar energy installation and long-term return on investment.",
      content: "Full blog content here...",
      imageUrl: "/carousel-3.svg",
      author: "Financial Analyst Mark Davis",
      publishedAt: "2023-12-15",
      category: "Solar Energy",
      tags: ["Solar", "Economics", "ROI", "Savings"]
    }
  ];

  const categories = ['all', 'GIS', 'Remote Sensing', 'Solar Energy'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Stay updated with the latest insights, trends, and innovations in GIS, Remote Sensing, and Solar Energy
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search blog posts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md font-medium transition duration-300 ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-300'
                  }`}
                >
                  {category === 'all' ? 'All Posts' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No blog posts found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <FaCalendar className="mr-1" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        {post.author}
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaTag className="text-gray-400" />
                        <span className="text-sm text-gray-600">{post.category}</span>
                      </div>
                      
                      <Link
                        href={`/public/blogs/${post.id}`}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        Read More →
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-green-700 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-green-100 mb-8">
              Subscribe to our newsletter to receive the latest blog posts and industry insights directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-md sm:rounded-r-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-800 text-white px-6 py-3 rounded-r-md sm:rounded-l-none rounded-l-md hover:bg-green-900 transition duration-300 mt-2 sm:mt-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}