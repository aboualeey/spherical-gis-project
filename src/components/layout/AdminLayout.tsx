'use client'

import React from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
          </div>
          <nav className="mt-6">
            <div className="px-6 py-2">
              <a href="/admin/services" className="block text-gray-700 hover:text-blue-600">
                Services Management
              </a>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm">
            <div className="px-6 py-4">
              <h1 className="text-lg font-medium text-gray-900">Dashboard</h1>
            </div>
          </header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}