'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/utils/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { FaUserCog, FaCog, FaDatabase, FaSave, FaShieldAlt, FaUsers, FaBell, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';
import { formatNaira } from '@/lib/utils/currency';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  currency: string;
  taxRate: number;
  enableNotifications: boolean;
  enableBackups: boolean;
  backupFrequency: string;
  maxLoginAttempts: number;
  sessionTimeout: number;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Spherical GIS',
    siteDescription: 'Advanced Geographic Information System',
    contactEmail: 'contact@spherical.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Tech Street, Innovation City, IC 12345',
    timezone: 'UTC',
    currency: 'NGN',
    taxRate: 7.5,
    enableNotifications: true,
    enableBackups: true,
    backupFrequency: 'daily',
    maxLoginAttempts: 5,
    sessionTimeout: 30
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== ROLES.MANAGING_DIRECTOR) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only the Managing Director can access system settings.</p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'staff', label: 'Staff Management', icon: FaUsers },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'system', label: 'System', icon: FaDatabase },
    { id: 'notifications', label: 'Notifications', icon: FaBell }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <Input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <Input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <Input
            type="tel"
            value={settings.contactPhone}
            onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">Greenwich Mean Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="NGN">NGN - Nigerian Naira</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <Input
            type="number"
            step="0.1"
            value={settings.taxRate}
            onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={settings.address}
          onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <FaUsers className="mx-auto text-blue-500 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Staff Management</h3>
        <p className="text-gray-600 mb-6">
          Manage staff members, roles, and permissions from the dedicated staff management page.
        </p>
        <Link href="/admin/staff-management">
          <Button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
            <FaUserCog />
            Go to Staff Management
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">Total Staff</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">10</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">4</div>
          <div className="text-sm text-gray-600">Different Roles</div>
        </Card>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <Input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <Input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Security Features</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Two-Factor Authentication</span>
            <Button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Password Encryption</span>
            <Button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
              Active
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>SSL Certificate</span>
            <Button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
              Valid
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable Automatic Backups</h3>
            <p className="text-sm text-gray-600">Automatically backup system data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableBackups}
              onChange={(e) => setSettings(prev => ({ ...prev, enableBackups: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {settings.enableBackups && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Database Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Connected</span>
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Server Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Online</span>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable System Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications about system events</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      {settings.enableNotifications && (
        <div className="space-y-3">
          <h4 className="font-medium">Notification Types</h4>
          <div className="space-y-2">
            {[
              'New user registrations',
              'System errors',
              'Backup completions',
              'Security alerts',
              'Low inventory warnings'
            ].map((type, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'staff':
        return renderStaffManagement();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Manage system configuration and preferences</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <FaSave />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
}