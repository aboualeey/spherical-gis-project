'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts, Product } from '@/lib/contexts/ProductsContext';
import { hasPermission, PERMISSIONS } from '@/lib/utils/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaImage, FaSync, FaPlus, FaTrash, FaHistory, FaDownload, FaUpload, FaWarehouse, FaChartLine } from 'react-icons/fa';
import { formatNaira } from '@/lib/utils/currency';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';

interface EditingProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  specifications: string;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  specifications: string;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
}

interface PriceHistory {
  id: number;
  productId: number;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changeReason: string;
  timestamp: string;
}

interface InventoryLog {
  id: number;
  productId: number;
  type: 'adjustment' | 'sale' | 'restock' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  userId: string;
}

export default function AdminProductsPage() {
  const { user } = useAuth();
  const { products, updateProduct, addProduct, deleteProduct, refreshProducts, isLoading: contextLoading } = useProducts();
  const [editingProducts, setEditingProducts] = useState<{ [key: number]: EditingProduct }>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: 0,
    category: 'Solar Panels',
    imageUrl: '',
    specifications: '',
    inStock: true,
    stockQuantity: 0,
    lowStockThreshold: 10,
    sku: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<number | null>(null);
  const [showInventoryLog, setShowInventoryLog] = useState<number | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showInventoryAdjustment, setShowInventoryAdjustment] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [inventoryAdjustment, setInventoryAdjustment] = useState({
    quantity: 0,
    reason: '',
    type: 'adjustment' as 'adjustment' | 'sale' | 'restock' | 'return'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingUploadingImage, setEditingUploadingImage] = useState<{ [key: number]: boolean }>({});
  const [editingSelectedFile, setEditingSelectedFile] = useState<{ [key: number]: File | null }>({});

  // Check if user has permission to edit products
  const canEditProducts = user && (
    hasPermission(user.role, PERMISSIONS.EDIT_PRODUCTS) ||
    hasPermission(user.role, PERMISSIONS.MANAGE_PRODUCTS)
  );

  useEffect(() => {
    // Listen for real-time product updates
    const handleProductUpdate = (event: CustomEvent) => {
      const { productId, updates } = event.detail;
      if (updates) {
        toast.success(`Product ${productId} updated in real-time`);
      }
    };

    window.addEventListener('productsUpdated', handleProductUpdate as EventListener);
    return () => {
      window.removeEventListener('productsUpdated', handleProductUpdate as EventListener);
    };
  }, []);

  const startEditing = (product: Product) => {
    if (!canEditProducts) {
      toast.error('You do not have permission to edit products');
      return;
    }
    
    setEditingProducts(prev => ({
      ...prev,
      [product.id]: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        specifications: product.specifications,
        inStock: product.inStock
      }
    }));
  };

  const cancelEditing = (productId: number) => {
    setEditingProducts(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const updateEditingProduct = (productId: number, field: keyof EditingProduct, value: string | number | boolean) => {
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const saveProduct = async (productId: number) => {
    if (!canEditProducts) {
      toast.error('You do not have permission to save product changes');
      return;
    }

    const editingProduct = editingProducts[productId];
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      await updateProduct(productId, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        imageUrl: editingProduct.imageUrl,
        specifications: editingProduct.specifications,
        inStock: editingProduct.inStock
      });
      
      // Remove from editing state
      cancelEditing(productId);
      
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!canEditProducts) {
      toast.error('You do not have permission to delete products');
      return;
    }

    setIsLoading(true);
    try {
      await deleteProduct(productId);
      setDeleteConfirm(null);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!canEditProducts) {
      toast.error('You do not have permission to add products');
      return;
    }

    // Validation
    if (!newProduct.name.trim() || !newProduct.description.trim() || newProduct.price <= 0) {
      toast.error('Please fill in all required fields with valid data');
      return;
    }

    setIsLoading(true);
    try {
      await addProduct(newProduct);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: 'Solar Panels',
        imageUrl: '',
        specifications: '',
        inStock: true
      });
      setShowAddForm(false);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsLoading(false);
    }
  };

  const updateNewProduct = (field: keyof NewProduct, value: string | number | boolean) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'products');
      formData.append('alt', `Product image: ${file.name}`);

      // Upload file using the API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.url;
      
      // Update the image URL in the new product form
      setNewProduct(prev => ({ ...prev, imageUrl }));
      setSelectedFile(file);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      // Fallback: create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      updateNewProduct('imageUrl', localUrl);
      setSelectedFile(file);
      toast.success('Image selected for preview (upload will happen on save)');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleEditingFileUpload = async (file: File, productId: number) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setEditingUploadingImage(prev => ({ ...prev, [productId]: true }));
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'products');
      formData.append('alt', `Product image: ${file.name}`);

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Upload failed');
       }

       const data = await response.json();
       const imageUrl = data.url;
      
      // Update the image URL in the editing form
      updateEditingProduct(productId, 'imageUrl', imageUrl);
      setEditingSelectedFile(prev => ({ ...prev, [productId]: file }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      // Fallback: create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      updateEditingProduct(productId, 'imageUrl', localUrl);
      setEditingSelectedFile(prev => ({ ...prev, [productId]: file }));
      toast.success('Image selected for preview (upload will happen on save)');
    } finally {
      setEditingUploadingImage(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleEditingFileSelect = (event: React.ChangeEvent<HTMLInputElement>, productId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      handleEditingFileUpload(file, productId);
    }
  };

  // Price History Management
  const fetchPriceHistory = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/price-history`);
      if (response.ok) {
        const history = await response.json();
        setPriceHistory(history);
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const updateProductPrice = async (productId: number, newPrice: number, reason: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products/${productId}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPrice: product.price,
          newPrice,
          changeReason: reason,
          changedBy: user?.email || 'Unknown'
        })
      });

      if (response.ok) {
        await refreshProducts();
        await fetchPriceHistory(productId);
        toast.success('Price updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  // Inventory Management
  const fetchInventoryLogs = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/inventory-logs`);
      if (response.ok) {
        const logs = await response.json();
        setInventoryLogs(logs);
      }
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
    }
  };

  const adjustInventory = async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products/${productId}/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inventoryAdjustment.type,
          quantity: inventoryAdjustment.quantity,
          reason: inventoryAdjustment.reason,
          userId: user?.email || 'Unknown'
        })
      });

      if (response.ok) {
        await refreshProducts();
        await fetchInventoryLogs(productId);
        setShowInventoryAdjustment(null);
        setInventoryAdjustment({ quantity: 0, reason: '', type: 'adjustment' });
        toast.success('Inventory updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  // Bulk Import/Export
  const handleBulkImport = async () => {
    if (!bulkImportFile) {
      toast.error('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkImportFile);

    try {
      setIsLoading(true);
      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        await refreshProducts();
        setShowBulkImport(false);
        setBulkImportFile(null);
        toast.success(`Successfully imported ${result.imported} products`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Import failed');
      }
    } catch (error) {
      toast.error('Failed to import products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      const response = await fetch('/api/products/bulk-export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Products exported successfully!');
      }
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  const generateSKU = () => {
    const prefix = newProduct.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${timestamp}-${randomNum}`;
  };

  const categories = ['all', 'Solar Panels', 'Inverters', 'Battery Storage', 'Mounting Systems', 'Charge Controllers', 'Accessories'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!canEditProducts) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You do not have permission to access product management.</p>
            <p className="text-sm text-gray-500 mt-2">Contact your administrator for access.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage product information with full CRUD operations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAddForm(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              <FaPlus />
              Add Product
            </Button>
            <Button
              onClick={() => setShowBulkImport(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              <FaUpload />
              Bulk Import
            </Button>
            <Button
              onClick={handleBulkExport}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              <FaDownload />
              Export
            </Button>
            <Button
              onClick={refreshProducts}
              disabled={contextLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <FaSync className={contextLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Role: {user?.role}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Full Access
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {products.length} Products
              </span>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <Card className="p-6 bg-white border-2 border-green-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <Button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <Input
                  type="text"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) => updateNewProduct('name', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) => updateNewProduct('price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => updateNewProduct('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Product SKU"
                    value={newProduct.sku}
                    onChange={(e) => updateNewProduct('sku', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => updateNewProduct('sku', generateSKU())}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProduct.stockQuantity}
                  onChange={(e) => updateNewProduct('stockQuantity', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={newProduct.lowStockThreshold}
                  onChange={(e) => updateNewProduct('lowStockThreshold', parseInt(e.target.value) || 10)}
                  min="0"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <Input
                  type="text"
                  placeholder="/image-name.jpg"
                  value={newProduct.imageUrl}
                  onChange={(e) => updateNewProduct('imageUrl', e.target.value)}
                  className="w-full"
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload Image</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploadingImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    {uploadingImage && (
                      <div className="text-sm text-blue-600">Uploading...</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-green-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  placeholder="Enter product description"
                  value={newProduct.description}
                  onChange={(e) => updateNewProduct('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                <Input
                  type="text"
                  placeholder="Enter specifications"
                  value={newProduct.specifications}
                  onChange={(e) => updateNewProduct('specifications', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProduct.inStock}
                    onChange={(e) => updateNewProduct('inStock', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => setShowAddForm(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Import Products</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">CSV should include columns:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>name, description, price, category</li>
                    <li>imageUrl, specifications, stockQuantity</li>
                    <li>lowStockThreshold, sku, inStock</li>
                  </ul>
                </div>
                {bulkImportFile && (
                  <div className="text-sm text-green-600">
                    Selected: {bulkImportFile.name}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkImportFile(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={isLoading || !bulkImportFile}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  {isLoading ? 'Importing...' : 'Import'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Price History Modal */}
        {showPriceHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Price History</h3>
                <Button
                  onClick={() => setShowPriceHistory(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </Button>
              </div>
              <div className="space-y-3">
                {priceHistory.length > 0 ? (
                  priceHistory.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {formatNaira(entry.oldPrice)} → {formatNaira(entry.newPrice)}
                          </p>
                          <p className="text-sm text-gray-600">{entry.changeReason}</p>
                          <p className="text-xs text-gray-500">
                            By {entry.changedBy} on {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.newPrice > entry.oldPrice 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.newPrice > entry.oldPrice ? 'Increase' : 'Decrease'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No price history available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Adjustment Modal */}
        {showInventoryAdjustment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Adjust Inventory</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={inventoryAdjustment.type}
                    onChange={(e) => setInventoryAdjustment(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'adjustment' | 'sale' | 'restock' | 'return' 
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="adjustment">Manual Adjustment</option>
                    <option value="restock">Restock</option>
                    <option value="sale">Sale</option>
                    <option value="return">Return</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Change
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter quantity (+ for increase, - for decrease)"
                    value={inventoryAdjustment.quantity}
                    onChange={(e) => setInventoryAdjustment(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) || 0 
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    placeholder="Enter reason for adjustment"
                    value={inventoryAdjustment.reason}
                    onChange={(e) => setInventoryAdjustment(prev => ({ 
                      ...prev, 
                      reason: e.target.value 
                    }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  onClick={() => {
                    setShowInventoryAdjustment(null);
                    setInventoryAdjustment({ quantity: 0, reason: '', type: 'adjustment' });
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => adjustInventory(showInventoryAdjustment)}
                  disabled={isLoading || !inventoryAdjustment.reason}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Adjusting...' : 'Adjust Inventory'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Logs Modal */}
        {showInventoryLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Inventory Logs</h3>
                <Button
                  onClick={() => setShowInventoryLog(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </Button>
              </div>
              <div className="space-y-3">
                {inventoryLogs.length > 0 ? (
                  inventoryLogs.map((log) => (
                    <div key={log.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">
                            {log.type}: {log.quantity > 0 ? '+' : ''}{log.quantity} units
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock: {log.previousStock} → {log.newStock}
                          </p>
                          <p className="text-sm text-gray-600">{log.reason}</p>
                          <p className="text-xs text-gray-500">
                            By {log.userId} on {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.quantity > 0 ? 'Increase' : 'Decrease'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No inventory logs available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isEditing = editingProducts[product.id];
            const editingData = editingProducts[product.id];
            
            return (
              <Card key={product.id} className="overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300">
                {/* Product Image */}
                <div className="relative h-48 w-full">
                  {isEditing ? (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4 w-full">
                        <FaImage className="mx-auto text-gray-400 mb-2" size={24} />
                        <Input
                          type="text"
                          placeholder="Image URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                          value={editingData?.imageUrl || ''}
                          onChange={(e) => updateEditingProduct(product.id, 'imageUrl', e.target.value)}
                        />
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Or Upload New Image</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleEditingFileSelect(e, product.id)}
                              disabled={editingUploadingImage[product.id]}
                              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                            {editingUploadingImage[product.id] && (
                              <div className="text-xs text-blue-600">Uploading...</div>
                            )}
                          </div>
                          {editingSelectedFile[product.id] && (
                            <div className="mt-1 text-xs text-green-600">
                              Selected: {editingSelectedFile[product.id]?.name}
                            </div>
                          )}
                        </div>
                        {editingData?.imageUrl && (
                          <div className="mt-2 h-20 w-full relative">
                            <Image 
                              src={editingData.imageUrl} 
                              alt="Preview" 
                              fill
                              className="object-cover rounded"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {!product.inStock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    {isEditing ? (
                      <Input
                        type="text"
                        className="flex-1 mr-2 font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={editingData?.name || ''}
                        onChange={(e) => updateEditingProduct(product.id, 'name', e.target.value)}
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
                    )}
                    {isEditing ? (
                      <Input
                        type="number"
                        className="w-20 text-right font-bold text-green-600 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={editingData?.price || 0}
                        onChange={(e) => updateEditingProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span className="text-xl font-bold text-green-600">{formatNaira(product.price)}</span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <select
                      value={editingData?.category || ''}
                      onChange={(e) => updateEditingProduct(product.id, 'category', e.target.value)}
                      className="w-full mb-2 text-sm text-gray-500 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  )}
                  
                  {isEditing ? (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-vertical mb-2"
                      rows={3}
                      value={editingData?.description || ''}
                      onChange={(e) => updateEditingProduct(product.id, 'description', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Specifications and Stock Status */}
                  <div className="space-y-2 mb-4">
                    {isEditing ? (
                      <Input
                        type="text"
                        className="w-full text-green-600 font-semibold text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={editingData?.specifications || ''}
                        onChange={(e) => updateEditingProduct(product.id, 'specifications', e.target.value)}
                        placeholder="Specifications"
                      />
                    ) : (
                      <span className="text-green-600 font-semibold text-sm block">{product.specifications}</span>
                    )}
                    
                    {/* SKU and Stock Information */}
                    <div className="flex justify-between items-center text-xs">
                      {isEditing ? (
                        <Input
                          type="text"
                          className="flex-1 mr-2 text-gray-600 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={editingData?.sku || ''}
                          onChange={(e) => updateEditingProduct(product.id, 'sku', e.target.value)}
                          placeholder="SKU"
                        />
                      ) : (
                        <span className="text-gray-600">SKU: {product.sku || 'N/A'}</span>
                      )}
                      
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            className="w-16 text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={editingData?.stockQuantity || 0}
                            onChange={(e) => updateEditingProduct(product.id, 'stockQuantity', parseInt(e.target.value) || 0)}
                            min="0"
                            placeholder="Stock"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingData?.inStock || false}
                              onChange={(e) => updateEditingProduct(product.id, 'inStock', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">Active</span>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            (product.stockQuantity || 0) <= (product.lowStockThreshold || 10)
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Stock: {product.stockQuantity || 0}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Low Stock Warning */}
                    {!isEditing && (product.stockQuantity || 0) <= (product.lowStockThreshold || 10) && product.inStock && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-yellow-800 text-xs font-medium flex items-center">
                          <FaWarehouse className="mr-1" />
                          Low Stock Alert: {product.stockQuantity || 0} units remaining
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Management Buttons */}
                    {!isEditing && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => {
                            setShowPriceHistory(product.id);
                            fetchPriceHistory(product.id);
                          }}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
                        >
                          <FaHistory className="text-xs" />
                          Price History
                        </Button>
                        <Button
                          onClick={() => {
                            setShowInventoryAdjustment(product.id);
                          }}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
                        >
                          <FaWarehouse className="text-xs" />
                          Adjust Stock
                        </Button>
                        <Button
                          onClick={() => {
                            setShowInventoryLog(product.id);
                            fetchInventoryLogs(product.id);
                          }}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
                        >
                          <FaChartLine className="text-xs" />
                          Stock Logs
                        </Button>
                        <Button
                          onClick={() => startEditing(product)}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </Button>
                      </div>
                    )}
                    
                    {/* Primary Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => cancelEditing(product.id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                          >
                            <FaTimes className="text-xs" />
                            Cancel
                          </Button>
                          <Button
                            onClick={() => saveProduct(product.id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            <FaSave className="text-xs" />
                            {isLoading ? 'Saving...' : 'Save'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setDeleteConfirm(product.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}