'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFileInvoice, FaTrash } from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatNaira } from '@/lib/utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Sale {
  id: string;
  date: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<'new-sale' | 'history'>('new-sale');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [historySortBy, setHistorySortBy] = useState<'date' | 'amount'>('date');
  const [historySortOrder, setHistorySortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Simulate API call with mock data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Solar Panel 400W',
        price: 250,
        stockQuantity: 15,
        imageUrl: '/placeholder-product1.jpg',
      },
      {
        id: '2',
        name: 'Inverter 5kW',
        price: 1200,
        stockQuantity: 8,
        imageUrl: '/placeholder-product2.jpg',
      },
      {
        id: '3',
        name: 'Lithium Battery 48V',
        price: 2500,
        stockQuantity: 4,
        imageUrl: '/placeholder-product3.jpg',
      },
      {
        id: '4',
        name: 'Charge Controller 60A',
        price: 350,
        stockQuantity: 12,
        imageUrl: '/placeholder-product2.jpg',
      },
      {
        id: '5',
        name: 'Solar Cable 6mm²',
        price: 2.5,
        stockQuantity: 200,
        imageUrl: '/placeholder-product1.jpg',
      },
    ];

    setProducts(mockProducts);

    // Mock sales history
    const mockSales: Sale[] = [
      {
        id: 'S001',
        date: '2023-11-15T10:30:00',
        customerName: 'John Doe',
        items: [
          { productId: '1', productName: 'Solar Panel 400W', quantity: 2, unitPrice: 250 },
          { productId: '4', productName: 'Charge Controller 60A', quantity: 1, unitPrice: 350 },
        ],
        totalAmount: 850,
        paymentMethod: 'cash',
        status: 'completed',
      },
      {
        id: 'S002',
        date: '2023-11-14T14:15:00',
        customerName: 'Jane Smith',
        items: [
          { productId: '2', productName: 'Inverter 5kW', quantity: 1, unitPrice: 1200 },
          { productId: '3', productName: 'Lithium Battery 48V', quantity: 1, unitPrice: 2500 },
        ],
        totalAmount: 3700,
        paymentMethod: 'bank transfer',
        status: 'completed',
      },
      {
        id: 'S003',
        date: '2023-11-13T09:45:00',
        customerName: 'Robert Johnson',
        items: [
          { productId: '5', productName: 'Solar Cable 6mm²', quantity: 50, unitPrice: 2.5 },
        ],
        totalAmount: 125,
        paymentMethod: 'cash',
        status: 'completed',
      },
    ];

    setSalesHistory(mockSales);
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity if already in cart
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Update item quantity in cart
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    // In a real app, this would make an API call
    const newSale: Sale = {
      id: `S${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      date: new Date().toISOString(),
      customerName,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalAmount: calculateTotal(),
      paymentMethod,
      status: 'completed',
    };

    setSalesHistory([newSale, ...salesHistory]);
    
    // Reset form
    setCart([]);
    setCustomerName('');
    setPaymentMethod('cash');
    
    alert('Sale completed successfully!');
  };

  // Sort sales history
  const sortedSalesHistory = [...salesHistory].sort((a, b) => {
    if (historySortBy === 'date') {
      return historySortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return historySortOrder === 'asc'
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    }
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sales Management</h1>
        <p className="text-gray-600">Process sales and view sales history</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 font-medium text-sm ${activeTab === 'new-sale' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('new-sale')}
            >
              New Sale
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('history')}
            >
              Sales History
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'new-sale' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Products</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-md p-4 flex items-center">
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-700">{formatNaira(product.price)}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stockQuantity}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stockQuantity === 0}
                    className={`ml-4 p-2 rounded-full ${product.stockQuantity === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                  >
                    <FaPlus />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Cart</h2>
            
            {/* Customer Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank transfer">Bank Transfer</option>
                <option value="mobile money">Mobile Money</option>
              </select>
            </div>
            
            {/* Cart Items */}
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-md" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium">{item.name}</h4>
                          <span className="text-sm text-gray-500">{formatNaira(item.price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          disabled={item.quantity >= item.stockQuantity}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold">{formatNaira(calculateTotal())}</span>
            </div>
            
            {/* Complete Sale Button */}
            <button
              onClick={completeSale}
              disabled={cart.length === 0}
              className={`w-full py-2 rounded-md font-medium ${cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Complete Sale
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Sales History</h2>
            
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-600 mr-2">Sort by:</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={historySortBy}
                  onChange={(e) => setHistorySortBy(e.target.value as 'date' | 'amount')}
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mr-2">Order:</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={historySortOrder}
                  onChange={(e) => setHistorySortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSalesHistory.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.items.length} items</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatNaira(sale.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FaFileInvoice size={18} title="View Invoice" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}