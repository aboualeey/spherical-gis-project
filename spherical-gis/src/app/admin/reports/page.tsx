'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaCalendar } from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatNaira } from '@/lib/utils/currency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  date: string;
  amount: number;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
}

interface ProductData {
  name: string;
  stock: number;
  value: number;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<CategoryData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [inventoryValue, setInventoryValue] = useState<CategoryData[]>([]);

  useEffect(() => {
    // Simulate API calls with mock data
    generateMockData(dateRange);
  }, [dateRange]);

  const generateMockData = (range: 'week' | 'month' | 'quarter' | 'year') => {
    // Generate sales data based on date range
    const sales: SalesData[] = [];
    const now = new Date();
    let days = 0;
    
    switch (range) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'quarter':
        days = 90;
        break;
      case 'year':
        days = 365;
        break;
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Generate random sales amount between 500 and 5000
      const amount = Math.floor(Math.random() * 4500) + 500;
      
      sales.push({
        date: date.toISOString().split('T')[0],
        amount,
      });
    }
    
    setSalesData(sales);
    
    // Generate category sales data
    const categories = ['Solar Panels', 'Inverters', 'Batteries', 'Charge Controllers', 'Accessories'];
    const categoryData: CategoryData[] = categories.map(category => ({
      category,
      amount: Math.floor(Math.random() * 50000) + 10000,
      count: Math.floor(Math.random() * 100) + 10,
    }));
    
    setCategorySalesData(categoryData);
    
    // Generate top products data
    const products = [
      'Solar Panel 400W',
      'Inverter 5kW',
      'Lithium Battery 48V',
      'Charge Controller 60A',
      'Solar Cable 6mm²',
    ];
    
    const productData: ProductData[] = products.map(name => ({
      name,
      stock: Math.floor(Math.random() * 50) + 5,
      value: Math.floor(Math.random() * 5000) + 500,
    }));
    
    setTopProducts(productData);
    
    // Generate inventory value data
    setInventoryValue(categoryData);
  };

  // Prepare data for charts
  const salesChartData = {
    labels: salesData.map(data => data.date),
    datasets: [
      {
        label: 'Sales Amount ($)',
        data: salesData.map(data => data.amount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const categorySalesChartData = {
    labels: categorySalesData.map(data => data.category),
    datasets: [
      {
        label: 'Sales Amount ($)',
        data: categorySalesData.map(data => data.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const inventoryValueChartData = {
    labels: inventoryValue.map(data => data.category),
    datasets: [
      {
        label: 'Inventory Value ($)',
        data: inventoryValue.map(data => data.amount / 2), // Just for demonstration
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topProductsChartData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Stock Level',
        data: topProducts.map(product => product.stock),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Value ($)',
        data: topProducts.map(product => product.value / 10), // Scaled for visualization
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">View sales and inventory performance metrics</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <FaCalendar className="text-gray-500 mr-2" />
          <span className="text-gray-700 font-medium">Date Range:</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-md ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-md ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRange('quarter')}
            className={`px-4 py-2 rounded-md ${dateRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Quarter
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-md ${dateRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Year
          </button>
        </div>
        <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300">
          <FaDownload className="mr-2" /> Export Report
        </button>
      </div>

      {/* Sales Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
        <div className="h-80">
          <Line options={lineChartOptions} data={salesChartData} />
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <div className="h-80">
            <Pie options={pieChartOptions} data={categorySalesChartData} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Inventory Value by Category</h2>
          <div className="h-80">
            <Pie options={pieChartOptions} data={inventoryValueChartData} />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Top Products</h2>
        <div className="h-80">
          <Bar options={barChartOptions} data={topProductsChartData} />
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Category Performance Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorySalesData.map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNaira(category.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNaira(category.amount / category.count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNaira(category.amount / 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}