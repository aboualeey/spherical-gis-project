'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaVideo, FaEye, FaGripVertical, FaCalendarAlt, FaChartBar, FaClock, FaPlay, FaPause, FaDownload } from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import MediaLibrary from '@/components/admin/MediaLibrary';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  scheduledStart?: string;
  scheduledEnd?: string;
  clickCount?: number;
  impressions?: number;
  ctr?: number;
  lastUpdated?: string;
}

interface MediaFile {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
}

interface CarouselAnalytics {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  topPerformingItems: CarouselItem[];
  performanceByPage: { [key: string]: { impressions: number; clicks: number; ctr: number } };
}

interface ScheduleData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isScheduled: boolean;
}

// Sortable Carousel Item Component - MOVED OUTSIDE
function SortableCarouselItem({ item, viewMode, onEdit, onDelete, onSchedule }: {
  item: CarouselItem;
  viewMode: 'grid' | 'list';
  onEdit: (item: CarouselItem) => void;
  onDelete: (id: string) => void;
  onSchedule: (item: CarouselItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105 z-50' : ''
      } ${viewMode === 'list' ? 'flex' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`bg-gray-100 hover:bg-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-center ${
          viewMode === 'list' ? 'w-12' : 'h-8'
        }`}
      >
        <FaGripVertical className="text-gray-400" />
      </div>

      {/* Media Section */}
      <div className={`relative ${viewMode === 'list' ? 'w-32 h-20' : 'h-48'}`}>
        {item.type === 'image' ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover"
          />
        ) : (
          <video
            src={item.src}
            className="w-full h-full object-cover"
            muted
          />
        )}
        <div className="absolute top-2 right-2">
          {item.type === 'image' ? (
            <FaImage className="text-white bg-black bg-opacity-50 p-1 rounded" size={16} />
          ) : (
            <FaVideo className="text-white bg-black bg-opacity-50 p-1 rounded" size={16} />
          )}
        </div>
        {!item.isActive && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <span className="text-white font-bold text-xs">INACTIVE</span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
          <div className={viewMode === 'list' ? 'flex-1' : ''}>
            <h3 className={`font-bold mb-2 ${viewMode === 'list' ? 'text-base' : 'text-lg'}`}>{item.title}</h3>
            {item.caption && (
              <p className="text-gray-600 text-sm mb-2">{item.caption}</p>
            )}
            
            {/* Status and Analytics */}
            <div className={`text-sm text-gray-500 mb-4 ${viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-1'}`}>
              <span>Order: {item.order}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
              {item.impressions && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.impressions} views
                </span>
              )}
              {item.ctr && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {(item.ctr * 100).toFixed(1)}% CTR
                </span>
              )}
              {item.scheduledStart && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                  <FaClock size={10} />
                  Scheduled
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className={`space-y-2 ${viewMode === 'list' ? 'ml-4' : ''}`}>
            <div className={`grid gap-2 ${viewMode === 'list' ? 'grid-cols-2' : 'grid-cols-2'}`}>
              <button
                onClick={() => onSchedule(item)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 flex items-center justify-center space-x-1 text-xs"
              >
                <FaCalendarAlt size={12} />
                <span>Schedule</span>
              </button>
              <button
                onClick={() => onEdit(item)}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center justify-center space-x-1 text-xs"
              >
                <FaEdit size={12} />
                <span>Edit</span>
              </button>
            </div>
            <button
              onClick={() => onDelete(item.id)}
              className="w-full bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center justify-center space-x-1 text-xs"
            >
              <FaTrash size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarouselManagement() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [selectedPage, setSelectedPage] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [analytics, setAnalytics] = useState<CarouselAnalytics | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    page: 'home',
    order: 0,
    isActive: true,
    mediaId: '',
    externalUrl: '',
    type: 'image' as 'image' | 'video'
  });
  
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isScheduled: false
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const pages = ['home', 'services', 'about', 'contact', 'products'];

  useEffect(() => {
    fetchCarouselItems();
  }, [selectedPage]);

  const fetchCarouselItems = async () => {
    try {
      const response = await fetch(`/api/carousel?page=${selectedPage}`);
      if (response.ok) {
        const data = await response.json();
        setCarouselItems(data);
      }
    } catch (error) {
      console.error('Error fetching carousel items:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = carouselItems.findIndex(item => item.id === active.id);
      const newIndex = carouselItems.findIndex(item => item.id === over?.id);
      
      const newItems = arrayMove(carouselItems, oldIndex, newIndex);
      setCarouselItems(newItems);
      
      // Update order in backend
      try {
        await fetch('/api/carousel/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: newItems.map((item, index) => ({ id: item.id, order: index }))
          }),
        });
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem ? `/api/carousel/${editingItem.id}` : '/api/carousel';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchCarouselItems();
        setShowModal(false);
        setEditingItem(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving carousel item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this carousel item?')) {
      try {
        const response = await fetch(`/api/carousel/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchCarouselItems();
        }
      } catch (error) {
        console.error('Error deleting carousel item:', error);
      }
    }
  };

  const handleEdit = (item: CarouselItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      caption: item.caption || '',
      page: item.page,
      order: item.order,
      isActive: item.isActive,
      mediaId: '',
      externalUrl: item.src,
      type: item.type
    });
    setShowModal(true);
  };

  const handleMediaSelect = (media: MediaFile) => {
    setFormData(prev => ({
      ...prev,
      mediaId: media.id,
      externalUrl: '',
      type: media.mimeType.startsWith('video/') ? 'video' : 'image'
    }));
    setShowMediaLibrary(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      caption: '',
      page: selectedPage,
      order: 0,
      isActive: true,
      mediaId: '',
      externalUrl: '',
      type: 'image'
    });
    setScheduleData({
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      isScheduled: false
    });
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/carousel/analytics?page=${selectedPage}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleScheduleSubmit = async (itemId: string) => {
    try {
      const response = await fetch(`/api/carousel/${itemId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledStart: scheduleData.isScheduled ? `${scheduleData.startDate}T${scheduleData.startTime}` : null,
          scheduledEnd: scheduleData.isScheduled ? `${scheduleData.endDate}T${scheduleData.endTime}` : null,
        }),
      });
      
      if (response.ok) {
        await fetchCarouselItems();
        setShowScheduleModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Page', 'Impressions', 'Clicks', 'CTR'],
      ...Object.entries(analytics.performanceByPage).map(([page, data]) => [
        page,
        data.impressions.toString(),
        data.clicks.toString(),
        `${(data.ctr * 100).toFixed(2)}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carousel-analytics-${selectedPage}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Carousel Management</h1>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                List
              </button>
            </div>
            
            {/* Analytics Button */}
            <button
              onClick={() => {
                fetchAnalytics();
                setShowAnalytics(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <FaChartBar size={16} />
              <span>Analytics</span>
            </button>
            
            {/* Add Item Button */}
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <FaPlus size={16} />
              <span>Add Carousel Item</span>
            </button>
          </div>
        </div>

        {/* Page Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Page:</label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pages.map(page => (
              <option key={page} value={page}>
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Carousel Items with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={carouselItems.map(item => item.id)}
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {carouselItems.map((item) => (
                <SortableCarouselItem 
                  key={item.id} 
                  item={item} 
                  viewMode={viewMode} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                  onSchedule={(item) => {
                    setEditingItem(item);
                    setShowScheduleModal(true);
                  }} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {carouselItems.length === 0 && (
          <div className="text-center py-8">
            <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No carousel items found for {selectedPage} page</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Edit Carousel Item' : 'Add Carousel Item'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page
                  </label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData(prev => ({ ...prev, page: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pages.map(page => (
                      <option key={page} value={page}>
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="mr-2"
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaLibrary(true)}
                      className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-left hover:bg-gray-200"
                    >
                      {formData.mediaId ? 'Media Selected' : 'Select from Media Library'}
                    </button>
                    
                    <div className="text-center text-gray-500">OR</div>
                    
                    <input
                      type="url"
                      placeholder="External URL"
                      value={formData.externalUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value, mediaId: '' }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Media Library Modal */}
        {showMediaLibrary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Select Media</h2>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <MediaLibrary
                onSelect={handleMediaSelect}
                category="carousel"
              />
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Carousel Analytics</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportAnalytics}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center space-x-1 text-sm"
                  >
                    <FaDownload size={12} />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {analytics ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800">Total Impressions</h3>
                      <p className="text-2xl font-bold text-blue-600">{analytics.totalImpressions.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800">Total Clicks</h3>
                      <p className="text-2xl font-bold text-green-600">{analytics.totalClicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-800">Average CTR</h3>
                      <p className="text-2xl font-bold text-purple-600">{(analytics.averageCTR * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                  
                  {/* Performance by Page */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance by Page</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Page</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Impressions</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Clicks</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CTR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(analytics.performanceByPage).map(([page, data]) => (
                            <tr key={page} className="border-t">
                              <td className="px-4 py-2 text-sm font-medium">{page.charAt(0).toUpperCase() + page.slice(1)}</td>
                              <td className="px-4 py-2 text-sm">{data.impressions.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm">{data.clicks.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm">{(data.ctr * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Top Performing Items */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Performing Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analytics.topPerformingItems.map((item) => (
                        <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">{item.title}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Impressions: {item.impressions?.toLocaleString()}</p>
                            <p>Clicks: {item.clickCount?.toLocaleString()}</p>
                            <p>CTR: {item.ctr ? (item.ctr * 100).toFixed(2) : '0'}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Schedule Carousel Item</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isScheduled"
                    checked={scheduleData.isScheduled}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, isScheduled: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isScheduled" className="text-sm font-medium">Enable Scheduling</label>
                </div>
                
                {scheduleData.isScheduled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={scheduleData.startDate}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={scheduleData.startTime}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={scheduleData.endDate}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={scheduleData.endTime}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleScheduleSubmit(editingItem.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}