'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatNaira } from '@/lib/utils/currency';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  lowStockAlert: number;
  imageUrl: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Categories for filtering
  const categories = ['all', 'Solar Panels', 'Inverters', 'Batteries', 'Charge Controllers', 'Accessories'];

  useEffect(() => {
    // Simulate API call with mock data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Solar Panel 400W',
        description: 'High-efficiency monocrystalline solar panel',
        category: 'Solar Panels',
        price: 250,
        stockQuantity: 15,
        lowStockAlert: 5,
        imageUrl: '/placeholder-product1.jpg',
      },
      {
        id: '2',
        name: 'Inverter 5kW',
        description: 'Pure sine wave inverter for solar systems',
        category: 'Inverters',
        price: 1200,
        stockQuantity: 8,
        lowStockAlert: 3,
        imageUrl: '/placeholder-product2.jpg',
      },
      {
        id: '3',
        name: 'Lithium Battery 48V',
        description: 'Lithium-ion battery for energy storage',
        category: 'Batteries',
        price: 2500,
        stockQuantity: 4,
        lowStockAlert: 2,
        imageUrl: '/placeholder-product3.jpg',
      },
      {
        id: '4',
        name: 'Charge Controller 60A',
        description: 'MPPT charge controller for solar systems',
        category: 'Charge Controllers',
        price: 350,
        stockQuantity: 12,
        lowStockAlert: 4,
        imageUrl: '/placeholder-product2.jpg',
      },
      {
        id: '5',
        name: 'Solar Cable 6mm²',
        description: 'UV-resistant solar cable',
        category: 'Accessories',
        price: 2.5,
        stockQuantity: 200,
        lowStockAlert: 50,
        imageUrl: '/placeholder-product1.jpg',
      },
    ];

    setProducts(mockProducts);
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    // In a real app, this would make an API call
    setProducts(products.filter(product => product.id !== productId));
  };

  const isLowStock = (product: Product) => {
    return product.stockQuantity <= product.lowStockAlert;
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 flex items-center"
        >
          <FaPlus className="mr-2" /> Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
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

          <div className="w-full md:w-1/4">
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} width={40} height={40} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNaira(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isLowStock(product) && (
                        <FaExclamationTriangle className="text-yellow-500 mr-2" title="Low Stock" />
                      )}
                      <span className={`text-sm ${isLowStock(product) ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                        {product.stockQuantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placeholder for modals - in a real app, these would be implemented as separate components */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <p className="mb-4 text-gray-600">Form would go here in the actual implementation</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Product: {currentProduct.name}</h2>
            <p className="mb-4 text-gray-600">Form would go here in the actual implementation</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}