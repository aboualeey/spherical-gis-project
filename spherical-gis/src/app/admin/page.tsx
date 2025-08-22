'use client';

import { useState, useEffect } from 'react';
import { 
  FaBoxes, 
  FaShoppingCart, 
  FaExclamationTriangle, 
  FaChartLine,
  FaUsers,
  FaCalendarAlt
} from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatNaira } from '@/lib/utils/currency';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

export default function AdminDashboard() {
  // In a real app, this data would come from API calls
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalSales: 0,
    lowStockItems: 0,
    recentSales: [],
    salesData: {
      labels: [],
      datasets: []
    },
    inventoryData: {
      labels: [],
      datasets: []
    },
    productCategoryData: {
      labels: [],
      datasets: []
    }
  });

  useEffect(() => {
    // Simulate API call with mock data
    const mockData = {
      totalProducts: 156,
      totalSales: 28500,
      lowStockItems: 12,
      recentSales: [
        { id: 1, date: '2023-08-07', amount: 1250, customer: 'John Doe' },
        { id: 2, date: '2023-08-06', amount: 3450, customer: 'Jane Smith' },
        { id: 3, date: '2023-08-05', amount: 890, customer: 'Robert Johnson' },
        { id: 4, date: '2023-08-04', amount: 2100, customer: 'Emily Davis' },
      ],
      salesData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Sales 2023',
            data: [12000, 19000, 15000, 22000, 18000, 24000, 25000, 28500],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      },
      inventoryData: {
        labels: ['Solar Panels', 'Inverters', 'Batteries', 'Charge Controllers', 'Accessories'],
        datasets: [
          {
            label: 'Stock Levels',
            data: [45, 32, 18, 27, 34],
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
      },
      productCategoryData: {
        labels: ['Solar Panels', 'Inverters', 'Batteries', 'Charge Controllers', 'Accessories'],
        datasets: [
          {
            label: 'Sales by Category',
            data: [12500, 8700, 5300, 2000, 1000],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      },
    };

    setDashboardData(mockData);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaBoxes size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <h3 className="text-2xl font-bold">{dashboardData.totalProducts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaShoppingCart size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <h3 className="text-2xl font-bold">{formatNaira(dashboardData.totalSales)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FaExclamationTriangle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <h3 className="text-2xl font-bold">{dashboardData.lowStockItems}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <div className="h-80">
            <Line 
              data={dashboardData.salesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory by Category</h3>
          <div className="h-80 flex justify-center items-center">
            <div className="w-3/4 h-full">
              <Doughnut 
                data={dashboardData.inventoryData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                  },
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          <div className="h-80">
            <Bar 
              data={dashboardData.productCategoryData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {sale.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatNaira(sale.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}