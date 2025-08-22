'use client';

import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEdit, FaImage, FaVideo, FaSearch, FaFilter } from 'react-icons/fa';
import Image from 'next/image';
import FileUpload from '@/components/ui/FileUpload';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  uploader: {
    name: string;
    email: string;
  };
}

interface MediaLibraryProps {
  onSelect?: (media: MediaFile) => void;
  category?: string;
  multiple?: boolean;
}

export default function MediaLibrary({ onSelect, category, multiple = false }: MediaLibraryProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(category || 'all');
  const [showUpload, setShowUpload] = useState(false);

  const categories = ['all', 'product', 'carousel', 'blog', 'general'];

  useEffect(() => {
    fetchMediaFiles();
  }, [filterCategory]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      
      const response = await fetch(`/api/upload?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (url: string) => {
    await fetchMediaFiles(); // Refresh the list
    setShowUpload(false);
  };

  const handleSelect = (media: MediaFile) => {
    if (multiple) {
      const newSelection = selectedFiles.includes(media.id)
        ? selectedFiles.filter(id => id !== media.id)
        : [...selectedFiles, media.id];
      setSelectedFiles(newSelection);
    } else {
      onSelect?.(media);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this media file?')) {
      try {
        const response = await fetch(`/api/upload/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchMediaFiles();
        }
      } catch (error) {
        console.error('Error deleting media file:', error);
      }
    }
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.alt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <FaUpload size={16} />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <FileUpload
            onUpload={handleUpload}
            className="mb-4"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading media files...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedFiles.includes(file.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelect(file)}
            >
              <div className="aspect-square relative">
                {file.mimeType.startsWith('image/') ? (
                  <Image
                    src={file.url}
                    alt={file.alt}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaVideo className="text-4xl text-gray-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* File Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.category}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-8">
          <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No media files found</p>
        </div>
      )}
    </div>
  );
}