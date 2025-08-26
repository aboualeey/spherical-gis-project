'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaSave } from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';
import { formatNaira } from '@/lib/utils/currency';

interface ProductFeature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  price?: number;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function ProductFeaturesManagement() {
  const [productFeatures, setProductFeatures] = useState<ProductFeature[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'solar-panels',
    price: 0,
    features: [''],
    isActive: true,
    order: 1
  });

  useEffect(() => {
    fetchProductFeatures();
  }, []);

  const fetchProductFeatures = async () => {
    // Mock data - replace with actual API call
    const mockData: ProductFeature[] = [
      {
        id: '1',
        title: 'High-Efficiency Solar Panels',
        description: 'Premium monocrystalline solar panels with 22% efficiency rating',
        imageUrl: '/solar-panel-1.jpg',
        category: 'solar-panels',
        price: 149995,
        features: ['22% efficiency', 'Monocrystalline technology', '25-year warranty', 'Weather resistant'],
        isActive: true,
        order: 1,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Hybrid Inverter System',
        description: 'Advanced hybrid inverter with battery backup capability',
        imageUrl: '/hybrid-inverter.jpeg',
        category: 'inverters',
        price: 649995,
        features: ['5kW capacity', 'Battery backup', 'Grid-tie capability', 'Smart monitoring'],
        isActive: true,
        order: 2,
        createdAt: '2024-01-16'
      },
      {
        id: '3',
        title: 'Lithium Battery Storage',
        description: 'High-capacity lithium battery for solar energy storage',
        imageUrl: '/battery.png',
        category: 'batteries',
        price: 449995,
        features: ['10kWh capacity', 'Lithium technology', '10-year warranty', 'Compact design'],
        isActive: true,
        order: 3,
        createdAt: '2024-01-17'
      }
    ];
    setProductFeatures(mockData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFeature) {
      // Update existing feature
      const updatedFeatures = productFeatures.map(feature => 
        feature.id === editingFeature.id 
          ? { ...feature, ...formData, id: editingFeature.id, createdAt: editingFeature.createdAt }
          : feature
      );
      setProductFeatures(updatedFeatures);
    } else {
      // Add new feature
      const newFeature: ProductFeature = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProductFeatures([...productFeatures, newFeature]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: 'solar-panels',
      price: 0,
      features: [''],
      isActive: true,
      order: 1
    });
    setEditingFeature(null);
    setShowModal(false);
  };

  const handleEdit = (feature: ProductFeature) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      imageUrl: feature.imageUrl,
      category: feature.category,
      price: feature.price || 0,
      features: feature.features,
      isActive: feature.isActive,
      order: feature.order
    });
    setEditingFeature(feature);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product feature?')) {
      setProductFeatures(productFeatures.filter(feature => feature.id !== id));
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const filteredFeatures = selectedCategory === 'all' 
    ? productFeatures 
    : productFeatures.filter(feature => feature.category === selectedCategory);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Features Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus size={16} />
            <span>Add Product Feature</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="solar-panels">Solar Panels</option>
            <option value="inverters">Inverters</option>
            <option value="batteries">Batteries</option>
            <option value="mounting">Mounting Systems</option>
            <option value="controllers">Charge Controllers</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Product Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 w-full">
                <Image 
                  src={feature.imageUrl || '/placeholder-product1.jpg'} 
                  alt={feature.title} 
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder-product1.jpg') {
                      target.src = '/placeholder-product1.jpg';
                    }
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    feature.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {feature.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Category: {feature.category}</span>
                  {feature.price && (
                    <span className="text-lg font-bold text-green-600">{formatNaira(feature.price)}</span>
                  )}
                </div>
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {feature.features.slice(0, 3).map((feat, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-1">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                    {feature.features.length > 3 && (
                      <li className="text-gray-400">+{feature.features.length - 3} more...</li>
                    )}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Order: {feature.order}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(feature)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingFeature ? 'Edit Product Feature' : 'Add New Product Feature'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="solar-panels">Solar Panels</option>
                      <option value="inverters">Inverters</option>
                      <option value="batteries">Batteries</option>
                      <option value="mounting">Mounting Systems</option>
                      <option value="controllers">Charge Controllers</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/path/to/image.jpg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter feature"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <FaSave size={16} />
                    <span>{editingFeature ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}