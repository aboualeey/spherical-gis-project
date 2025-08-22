'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaSave, FaImage, FaList, FaVideo, FaUpload, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorHandler, useApiCall } from '@/lib/hooks/useErrorHandler';
import { useFormValidation, commonRules } from '@/lib/hooks/useFormValidation';

interface CarouselItem {
  id: string;
  title: string;
  caption?: string;
  page: string;
  order: number;
  isActive: boolean;
  src: string;
  alt: string;
  type: 'image' | 'video';
}

interface PageContent {
  id: string;
  page: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

interface MediaFile {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  type: 'image' | 'video';
}

const PAGES = [
  { value: 'home', label: 'Home Page' },
  { value: 'services', label: 'Services Page' },
  { value: 'products', label: 'Products Page' },
  { value: 'training', label: 'Training Page' },
  { value: 'about', label: 'About Page' },
  { value: 'contact', label: 'Contact Page' }
];

const SECTIONS = {
  home: ['carousel', 'featured_products', 'hero_section', 'services_preview'],
  services: ['carousel', 'services_list', 'testimonials'],
  products: ['carousel', 'solar_materials', 'quote_section'],
  training: ['carousel', 'training_programs', 'certification_info'],
  about: ['carousel', 'company_info', 'team_section'],
  contact: ['carousel', 'contact_form', 'location_info']
};

export default function UnifiedContentManagement() {
  const [activeTab, setActiveTab] = useState<'carousel' | 'content'>('carousel');
  const [selectedPage, setSelectedPage] = useState('home');
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [pageContent, setPageContent] = useState<PageContent[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | PageContent | null>(null);
  const [modalType, setModalType] = useState<'carousel' | 'content'>('carousel');
  
  const [carouselFormData, setCarouselFormData] = useState({
    title: '',
    caption: '',
    page: 'home',
    order: 0,
    isActive: true,
    mediaId: '',
    externalUrl: '',
    type: 'image' as 'image' | 'video'
  });

  const [contentFormData, setContentFormData] = useState({
    page: 'home',
    section: 'hero_section',
    title: '',
    content: '',
    imageUrl: '',
    order: 0,
    isActive: true
  });

  const { handleError } = useErrorHandler();
  const { callApi } = useApiCall();

  useEffect(() => {
    fetchCarouselItems();
    fetchPageContent();
    fetchMediaFiles();
  }, [selectedPage]);

  const fetchCarouselItems = async () => {
    try {
      const response = await fetch(`/api/carousel?page=${selectedPage}`);
      if (response.ok) {
        const data = await response.json();
        setCarouselItems(data);
      } else {
        // Fallback to mock data
        setCarouselItems([
          {
            id: '1',
            title: 'GIS Solutions',
            caption: 'Advanced Geographic Information Systems',
            page: selectedPage,
            order: 1,
            isActive: true,
            src: '/Geo-spatial1.jpeg',
            alt: 'GIS Solutions',
            type: 'image'
          }
        ]);
      }
    } catch (error) {
      handleError(error, 'Failed to fetch carousel items');
    }
  };

  const fetchPageContent = async () => {
    try {
      const response = await fetch(`/api/page-content?page=${selectedPage}`);
      if (response.ok) {
        const data = await response.json();
        setPageContent(data);
      } else {
        // Fallback to mock data
        setPageContent([
          {
            id: '1',
            page: selectedPage,
            section: 'hero_section',
            title: 'Welcome to Spherical GIS',
            content: 'Advanced geospatial solutions for your business needs.',
            order: 1,
            isActive: true
          }
        ]);
      }
    } catch (error) {
      handleError(error, 'Failed to fetch page content');
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data);
      } else {
        // Fallback to mock data
        setMediaFiles([
          {
            id: '1',
            url: '/Geo-spatial1.jpeg',
            alt: 'GIS Solutions',
            mimeType: 'image/jpeg',
            type: 'image'
          },
          {
            id: '2',
            url: '/01-gis-location.mp4',
            alt: 'GIS Location Video',
            mimeType: 'video/mp4',
            type: 'video'
          }
        ]);
      }
    } catch (error) {
      handleError(error, 'Failed to fetch media files');
    }
  };

  const handleSaveCarousel = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/carousel/${editingItem.id}` : '/api/carousel';
      
      const selectedMedia = mediaFiles.find(m => m.id === carouselFormData.mediaId);
      const itemData = {
        ...carouselFormData,
        src: selectedMedia?.url || carouselFormData.externalUrl,
        alt: selectedMedia?.alt || carouselFormData.title,
        type: selectedMedia?.type || carouselFormData.type
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        toast.success(editingItem ? 'Carousel item updated!' : 'Carousel item created!');
        fetchCarouselItems();
        resetCarouselForm();
        setShowModal(false);
      } else {
        throw new Error('Failed to save carousel item');
      }
    } catch (error) {
      handleError(error, 'Failed to save carousel item');
    }
  };

  const handleSaveContent = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/page-content/${editingItem.id}` : '/api/page-content';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentFormData)
      });

      if (response.ok) {
        toast.success(editingItem ? 'Content updated!' : 'Content created!');
        fetchPageContent();
        resetContentForm();
        setShowModal(false);
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      handleError(error, 'Failed to save content');
    }
  };

  const handleDelete = async (id: string, type: 'carousel' | 'content') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const url = type === 'carousel' ? `/api/carousel/${id}` : `/api/page-content/${id}`;
      const response = await fetch(url, { method: 'DELETE' });

      if (response.ok) {
        toast.success('Item deleted successfully!');
        if (type === 'carousel') {
          fetchCarouselItems();
        } else {
          fetchPageContent();
        }
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      handleError(error, 'Failed to delete item');
    }
  };

  const resetCarouselForm = () => {
    setCarouselFormData({
      title: '',
      caption: '',
      page: selectedPage,
      order: 0,
      isActive: true,
      mediaId: '',
      externalUrl: '',
      type: 'image'
    });
    setEditingItem(null);
  };

  const resetContentForm = () => {
    setContentFormData({
      page: selectedPage,
      section: 'hero_section',
      title: '',
      content: '',
      imageUrl: '',
      order: 0,
      isActive: true
    });
    setEditingItem(null);
  };

  const handleEditCarousel = (item: CarouselItem) => {
    setCarouselFormData({
      title: item.title,
      caption: item.caption || '',
      page: item.page,
      order: item.order,
      isActive: item.isActive,
      mediaId: '',
      externalUrl: item.src,
      type: item.type
    });
    setEditingItem(item);
    setModalType('carousel');
    setShowModal(true);
  };

  const handleEditContent = (item: PageContent) => {
    setContentFormData({
      page: item.page,
      section: item.section,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      order: item.order,
      isActive: item.isActive
    });
    setEditingItem(item);
    setModalType('content');
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Unified Content Management</h1>
          <button
            onClick={() => {
              if (activeTab === 'carousel') {
                resetCarouselForm();
                setModalType('carousel');
              } else {
                resetContentForm();
                setModalType('content');
              }
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus size={16} />
            <span>Add {activeTab === 'carousel' ? 'Carousel Item' : 'Content'}</span>
          </button>
        </div>

        {/* Page Selector */}
        <div className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Page to Manage
          </label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGES.map(page => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <SectionErrorBoundary>
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('carousel')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'carousel'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaImage className="inline mr-2" />
                  Carousel Management
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'content'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaList className="inline mr-2" />
                  Page Content
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'carousel' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Carousel Items for {PAGES.find(p => p.value === selectedPage)?.label}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carouselItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border">
                        <div className="relative h-48">
                          {item.type === 'video' ? (
                            <video
                              src={item.src}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                          ) : (
                            <Image
                              src={item.src}
                              alt={item.alt}
                              className="w-full h-full object-cover"
                              fill
                            />
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                              {item.type === 'video' ? <FaVideo /> : <FaImage />}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                          {item.caption && (
                            <p className="text-gray-600 text-sm mb-3">{item.caption}</p>
                          )}
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                            <span>Order: {item.order}</span>
                            <span>Page: {item.page}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCarousel(item)}
                              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center space-x-1"
                            >
                              <FaEdit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'carousel')}
                              className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center space-x-1"
                            >
                              <FaTrash size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {carouselItems.length === 0 && (
                    <div className="text-center py-8">
                      <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No carousel items found for {selectedPage} page</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Page Content for {PAGES.find(p => p.value === selectedPage)?.label}
                  </h2>
                  
                  <div className="space-y-4">
                    {pageContent.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow-md border p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span>Section: {item.section}</span>
                              <span>Order: {item.order}</span>
                              <span className={`px-2 py-1 rounded ${
                                item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4">{item.content}</p>
                            {item.imageUrl && (
                              <div className="mb-4">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-32 h-20 object-cover rounded"
                                  width={128}
                                  height={80}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditContent(item)}
                              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center space-x-1"
                            >
                              <FaEdit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'content')}
                              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center space-x-1"
                            >
                              <FaTrash size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pageContent.length === 0 && (
                    <div className="text-center py-8">
                      <FaList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No content found for {selectedPage} page</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SectionErrorBoundary>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'carousel' ? 'Carousel Item' : 'Page Content'}
              </h2>
              
              {modalType === 'carousel' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={carouselFormData.title}
                        onChange={(e) => setCarouselFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                      <input
                        type="text"
                        value={carouselFormData.caption}
                        onChange={(e) => setCarouselFormData(prev => ({ ...prev, caption: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter caption"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                      <select
                        value={carouselFormData.page}
                        onChange={(e) => setCarouselFormData(prev => ({ ...prev, page: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {PAGES.map(page => (
                          <option key={page.value} value={page.value}>{page.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <input
                        type="number"
                        value={carouselFormData.order}
                        onChange={(e) => setCarouselFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={carouselFormData.type}
                        onChange={(e) => setCarouselFormData(prev => ({ ...prev, type: e.target.value as 'image' | 'video' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={carouselFormData.externalUrl}
                        onChange={(e) => setCarouselFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter media URL"
                      />
                      <button
                        onClick={() => setShowMediaLibrary(true)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center space-x-1"
                      >
                        <FaUpload size={14} />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="carousel-active"
                      checked={carouselFormData.isActive}
                      onChange={(e) => setCarouselFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="carousel-active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select
                        value={contentFormData.section}
                        onChange={(e) => setContentFormData(prev => ({ ...prev, section: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {SECTIONS[selectedPage as keyof typeof SECTIONS]?.map(section => (
                          <option key={section} value={section}>{section.replace('_', ' ').toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <input
                        type="number"
                        value={contentFormData.order}
                        onChange={(e) => setContentFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={contentFormData.title}
                      onChange={(e) => setContentFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={contentFormData.content}
                      onChange={(e) => setContentFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter content"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                    <input
                      type="url"
                      value={contentFormData.imageUrl}
                      onChange={(e) => setContentFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter image URL"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="content-active"
                      checked={contentFormData.isActive}
                      onChange={(e) => setContentFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="content-active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetCarouselForm();
                    resetContentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={modalType === 'carousel' ? handleSaveCarousel : handleSaveContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                >
                  <FaSave size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Library Modal */}
        {showMediaLibrary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Media Library</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {mediaFiles.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => {
                      setCarouselFormData(prev => ({
                        ...prev,
                        mediaId: media.id,
                        externalUrl: media.url,
                        type: media.type
                      }));
                      setShowMediaLibrary(false);
                    }}
                    className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                  >
                    {media.type === 'video' ? (
                      <video
                        src={media.url}
                        className="w-full h-24 object-cover"
                        muted
                      />
                    ) : (
                      <Image
                        src={media.url}
                        alt={media.alt}
                        className="w-full h-24 object-cover"
                        width={200}
                        height={96}
                      />
                    )}
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate">{media.alt}</p>
                      <p className="text-xs text-gray-400">{media.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}