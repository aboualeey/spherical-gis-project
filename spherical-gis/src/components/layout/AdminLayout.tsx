'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ROLES } from '@/lib/utils/auth';
import {
  FaHome,
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaCog,
  FaFileAlt,
  FaImages,
  FaQuestionCircle,
  FaStar,
  FaBlog,
  FaTools,
  FaEnvelope,
  FaQuoteLeft,
  FaBars,
  FaTimes,
  FaGraduationCap,
  FaSlidersH,
  FaFeatherAlt,
  FaSignOutAlt,
  FaUserCog,
  FaEdit,
  FaUser,
  FaCamera,
  FaUpload
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const target = event.target as Element;
        if (!target.closest('[data-profile-menu]')) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const userRole = session?.user?.role;

  const allMenuItems = [
    { href: '/admin', icon: FaHome, label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR, ROLES.INVENTORY_MANAGER, ROLES.CASHIER, ROLES.REPORT_VIEWER] },
    {
      label: 'Content Management',
      roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR],
      items: [
        { href: '/admin/content-management', icon: FaEdit, label: 'Unified Content Management', roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR] },
        { href: '/admin/carousel', icon: FaImages, label: 'Carousel Management', roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR] },
        { href: '/admin/pages', icon: FaFileAlt, label: 'Pages Management', roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR] },
      ]
    },

    {
        label: 'User & Product Management',
        roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR, ROLES.INVENTORY_MANAGER],
        items: [
          { href: '/admin/users', icon: FaUsers, label: 'User Management', roles: [ROLES.ADMIN] },
          { href: '/admin/products', icon: FaBoxes, label: 'Product Management', roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR, ROLES.INVENTORY_MANAGER] },
          { href: '/admin/product-features', icon: FaFeatherAlt, label: 'Product Features', roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER] },
        ]
      },
    {
      label: 'System & Reports',
      roles: [ROLES.ADMIN, ROLES.MANAGING_DIRECTOR, ROLES.REPORT_VIEWER],
      items: [
        { href: '/admin/reports', icon: FaChartLine, label: 'Reports & Analytics', roles: [ROLES.ADMIN, ROLES.REPORT_VIEWER] },
        { href: '/admin/settings', icon: FaCog, label: 'Settings', roles: [ROLES.MANAGING_DIRECTOR] },
      ]
    }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (item.href) {
      return item.roles?.includes(userRole as keyof typeof ROLES);
    } else {
      // For grouped items, check if user has access to any sub-item
      const hasAccessToSubItems = item.items?.some(subItem => 
        subItem.roles?.includes(userRole as keyof typeof ROLES)
      );
      return hasAccessToSubItems && item.roles?.includes(userRole as keyof typeof ROLES);
    }
  }).map(item => {
    if (item.items) {
      // Filter sub-items based on user role
      return {
        ...item,
        items: item.items.filter(subItem => 
          subItem.roles?.includes(userRole as keyof typeof ROLES)
        )
      };
    }
    return item;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/spherical-logo.svg"
                alt="Spherical GIS Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <nav className="mt-8 px-4 flex-1 flex flex-col">
          <div className="flex-1">
            {menuItems.map((item, index) => (
              <div key={index} className="mb-6">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3" size={16} />
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {item.label}
                    </h3>
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg mb-1 ${
                          pathname === subItem.href
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <subItem.icon className="mr-3" size={16} />
                        {subItem.label}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Logout Button */}
          <div className="mt-auto mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-3" size={16} />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-md hover:bg-gray-100"
                aria-label="Open sidebar"
              >
                <FaBars size={20} />
              </button>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-6 h-6 relative">
                  <Image
                    src="/spherical-logo.svg"
                    alt="Spherical GIS Logo"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-800">Spherical GIS</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-sm text-gray-600">
                Welcome, {session?.user?.name || 'User'}
              </span>
              
              {/* Profile Image Field */}
               <div className="relative" data-profile-menu>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                  aria-label="Profile menu"
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-200 group-hover:from-blue-600 group-hover:to-purple-700">
                      <FaUser className="text-white text-lg" />
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <FaCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={14} />
                  </div>
                </button>
                
                {/* Profile Menu Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">{session?.user?.role}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                    >
                      <FaUpload size={14} />
                      <span>Upload Photo</span>
                    </button>
                    
                    {profileImage && (
                      <button
                        onClick={() => {
                          setProfileImage(null);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                      >
                        <FaTimes size={14} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                      >
                        <FaSignOutAlt size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile image"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}