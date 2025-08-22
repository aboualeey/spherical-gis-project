'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'managing_director' | 'admin' | 'inventory_manager' | 'cashier' | 'report_viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all users
  const getUsers = async (): Promise<User[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching users';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  };

  // Get a single user by ID
  const getUser = async (id: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/users/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the user';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Create a new user
  const createUser = async (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const data = await response.json();
      setIsLoading(false);
      router.refresh();
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the user';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Update an existing user
  const updateUser = async (id: string, user: Partial<Omit<User, 'id' | 'createdAt' | 'lastLogin'>> & { password?: string }): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const data = await response.json();
      setIsLoading(false);
      router.refresh();
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the user';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Delete a user
  const deleteUser = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setIsLoading(false);
      router.refresh();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the user';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (id: string, isActive: boolean): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }
      
      const data = await response.json();
      setIsLoading(false);
      router.refresh();
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while toggling user status';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
}