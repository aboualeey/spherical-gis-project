'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';
import AdminLayout from '@/components/layout/AdminLayout';
import UserForm from '@/components/admin/UserForm';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { toast } from 'react-hot-toast';

type UserRole = 'managing_director' | 'admin' | 'inventory_manager' | 'cashier' | 'report_viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { handleError } = useErrorHandler();
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Simulate API call with mock data
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@sphericalgis.com',
        role: 'managing_director',
        isActive: true,
        lastLogin: '2023-11-15T08:30:00',
        createdAt: '2023-01-01T00:00:00',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@sphericalgis.com',
        role: 'admin',
        isActive: true,
        lastLogin: '2023-11-14T16:45:00',
        createdAt: '2023-01-15T00:00:00',
      },
      {
        id: '3',
        name: 'Michael Brown',
        email: 'michael.brown@sphericalgis.com',
        role: 'inventory_manager',
        isActive: true,
        lastLogin: '2023-11-15T09:15:00',
        createdAt: '2023-02-01T00:00:00',
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily.davis@sphericalgis.com',
        role: 'cashier',
        isActive: true,
        lastLogin: '2023-11-14T14:20:00',
        createdAt: '2023-03-01T00:00:00',
      },
      {
        id: '5',
        name: 'David Wilson',
        email: 'david.wilson@sphericalgis.com',
        role: 'report_viewer',
        isActive: false,
        lastLogin: '2023-10-30T11:10:00',
        createdAt: '2023-04-01T00:00:00',
      },
    ];

    setUsers(mockUsers);
  }, []);

  // Filter users based on role and status
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) || 
      (filterStatus === 'inactive' && !user.isActive);
    
    return matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      setIsAddModalOpen(false);
    } catch (error) {
      handleError(error, 'Failed to create user');
      throw error;
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
      setIsEditModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      handleError(error, 'Failed to update user');
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, { 
          method: 'DELETE' 
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete user');
        }
        
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        handleError(error, 'Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    // In a real app, this would make an API call
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const getRoleName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
      managing_director: 'Managing Director',
      admin: 'Administrator',
      inventory_manager: 'Inventory Manager',
      cashier: 'Cashier',
      report_viewer: 'Report Viewer',
    };
    
    return roleNames[role];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <FaPlus className="mr-2" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
            >
              <option value="all">All Roles</option>
              <option value="managing_director">Managing Director</option>
              <option value="admin">Administrator</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="cashier">Cashier</option>
              <option value="report_viewer">Report Viewer</option>
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <FaLock size={16} /> : <FaUnlock size={16} />}
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit User"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                        disabled={user.role === 'managing_director'}
                      >
                        <FaTrash size={16} className={user.role === 'managing_director' ? 'opacity-30 cursor-not-allowed' : ''} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <UserForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUser}
        title="Add New User"
      />

      {/* Edit User Modal */}
      <UserForm
        user={currentUser || undefined}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentUser(null);
        }}
        onSubmit={handleUpdateUser}
        title={`Edit User: ${currentUser?.name || ''}`}
      />
    </AdminLayout>
  );
}