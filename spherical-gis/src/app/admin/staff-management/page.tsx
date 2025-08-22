'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/utils/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { FaUserPlus, FaEdit, FaTrash, FaUserCog, FaEye, FaEyeSlash, FaUsers, FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function StaffManagementPage() {
  const { user, loading } = useAuth();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: ROLES.CASHIER,
    permissions: [] as string[],
    password: '',
    confirmPassword: ''
  });

  const [showPermissions, setShowPermissions] = useState(false);

  // Mock staff data - in real app, this would come from API
  useEffect(() => {
    const mockStaff: StaffMember[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@spherical.com',
        role: ROLES.ADMIN,
        permissions: [PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.MANAGE_USERS],
        isActive: true,
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@spherical.com',
        role: ROLES.INVENTORY_MANAGER,
        permissions: [PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.EDIT_PRODUCTS],
        isActive: true,
        createdAt: '2024-01-10',
        lastLogin: '2024-01-19'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@spherical.com',
        role: ROLES.CASHIER,
        permissions: [PERMISSIONS.VIEW_PRODUCTS],
        isActive: false,
        createdAt: '2024-01-05',
        lastLogin: '2024-01-15'
      }
    ];
    setStaffMembers(mockStaff);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access staff management.</p>
        </div>
      </div>
    );
  }

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password || !newStaff.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newStaff.password !== newStaff.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newStaff.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaff.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const staffMember: StaffMember = {
        id: Date.now().toString(),
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        permissions: newStaff.permissions,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setStaffMembers(prev => [...prev, staffMember]);
      setNewStaff({ name: '', email: '', role: ROLES.CASHIER, permissions: [], password: '', confirmPassword: '' });
      setShowAddForm(false);
      setShowPermissions(false);
      toast.success('Staff member added successfully!');
    } catch (error) {
      toast.error('Failed to add staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<StaffMember>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStaffMembers(prev => 
        prev.map(staff => 
          staff.id === id ? { ...staff, ...updates } : staff
        )
      );
      setEditingStaff(null);
      toast.success('Staff member updated successfully!');
    } catch (error) {
      toast.error('Failed to update staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStaffMembers(prev => prev.filter(staff => staff.id !== id));
      toast.success('Staff member deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStaffStatus = (id: string) => {
    const staff = staffMembers.find(s => s.id === id);
    if (staff) {
      handleUpdateStaff(id, { isActive: !staff.isActive });
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const availableRoles = [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.CASHIER, ROLES.REPORT_VIEWER];
  const availablePermissions = Object.values(PERMISSIONS);

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case ROLES.ADMIN:
        return [PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.MANAGE_USERS, PERMISSIONS.EDIT_PRODUCTS];
      case ROLES.INVENTORY_MANAGER:
        return [PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.EDIT_PRODUCTS, PERMISSIONS.VIEW_REPORTS];
      case ROLES.CASHIER:
        return [PERMISSIONS.VIEW_PRODUCTS];
      case ROLES.REPORT_VIEWER:
        return [PERMISSIONS.VIEW_REPORTS];
      default:
        return [];
    }
  };

  const handleRoleChange = (role: string) => {
    const defaultPermissions = getRolePermissions(role);
    setNewStaff(prev => ({ ...prev, role, permissions: defaultPermissions }));
  };

  const togglePermission = (permission: string) => {
    setNewStaff(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">Manage staff members, roles, and permissions</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaUserPlus />
          Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Add Staff Form */}
      {showAddForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUserPlus className="text-blue-600" />
            Add New Staff Member
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <Input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={newStaff.confirmPassword}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                value={newStaff.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            {/* Permissions Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                <button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <FaShieldAlt />
                  {showPermissions ? 'Hide' : 'Customize'} Permissions
                </button>
              </div>
              
              {showPermissions && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Default permissions for {newStaff.role} role are selected. You can customize them below:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStaff.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {!showPermissions && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <FaShieldAlt className="inline mr-1" />
                    Default permissions for <strong>{newStaff.role}</strong>: {getRolePermissions(newStaff.role).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 justify-end">
            <Button
              onClick={() => {
                setShowAddForm(false);
                setShowPermissions(false);
                setNewStaff({ name: '', email: '', role: ROLES.CASHIER, permissions: [], password: '', confirmPassword: '' });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStaff}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Add Staff Member
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Staff List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            Staff Members ({filteredStaff.length})
          </h2>
          <div className="text-sm text-gray-500">
            Active: {filteredStaff.filter(s => s.isActive).length} | 
            Inactive: {filteredStaff.filter(s => !s.isActive).length}
          </div>
        </div>
        
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No staff members found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || selectedRole !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first staff member'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStaff.map(staff => (
              <div key={staff.id} className="border rounded-lg p-5 hover:shadow-lg transition-all duration-200 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{staff.name}</h3>
                        <p className="text-gray-600 text-sm">{staff.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        staff.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {staff.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-blue-500" />
                        <span className="text-gray-500">Role:</span>
                        <span className="font-medium text-gray-900">{staff.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Joined:</span>
                        <span className="font-medium text-gray-900">{staff.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Last Login:</span>
                        <span className="font-medium text-gray-900">{staff.lastLogin || 'Never'}</span>
                      </div>
                    </div>
                    
                    {staff.permissions && staff.permissions.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-500 mb-1 block">Permissions:</span>
                        <div className="flex flex-wrap gap-1">
                          {staff.permissions.slice(0, 3).map(permission => (
                            <span key={permission} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border">
                              {permission}
                            </span>
                          ))}
                          {staff.permissions.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border">
                              +{staff.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => toggleStaffStatus(staff.id)}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        staff.isActive
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {staff.isActive ? (
                        <><FaEyeSlash className="w-3 h-3" /> Deactivate</>
                      ) : (
                        <><FaEye className="w-3 h-3" /> Activate</>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => setEditingStaff(staff)}
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 font-medium transition-colors flex items-center gap-2"
                    >
                      <FaEdit className="w-3 h-3" /> Edit
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 font-medium transition-colors flex items-center gap-2"
                    >
                      <FaTrash className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaEdit className="text-blue-600" />
              Edit Staff Member
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff(prev => prev ? { 
                    ...prev, 
                    role: e.target.value,
                    permissions: getRolePermissions(e.target.value)
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              {/* Permissions Section for Edit */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  <button
                    type="button"
                    onClick={() => setShowPermissions(!showPermissions)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <FaShieldAlt />
                    {showPermissions ? 'Hide' : 'Customize'} Permissions
                  </button>
                </div>
                
                {showPermissions && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      Customize permissions for {editingStaff.role} role:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availablePermissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingStaff.permissions?.includes(permission) || false}
                            onChange={() => {
                              const currentPermissions = editingStaff.permissions || [];
                              const updatedPermissions = currentPermissions.includes(permission)
                                ? currentPermissions.filter(p => p !== permission)
                                : [...currentPermissions, permission];
                              setEditingStaff(prev => prev ? { ...prev, permissions: updatedPermissions } : null);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {!showPermissions && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <FaShieldAlt className="inline mr-1" />
                      Current permissions: {(editingStaff.permissions || []).join(', ') || 'Default role permissions'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setEditingStaff(null);
                  setShowPermissions(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateStaff(editingStaff.id, editingStaff)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Update Staff Member
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}