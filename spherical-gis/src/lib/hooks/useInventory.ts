'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  sku: string;
  imageUrl?: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  location: string;
  minStockLevel: number;
  lastUpdated: Date;
}

export function useInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all inventory items
  const getInventoryItems = async (): Promise<InventoryItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      // For now, we'll return mock data
      const response = await fetch('/api/inventory');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching inventory items';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  };

  // Get a single inventory item by ID
  const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/inventory/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory item');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the inventory item';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Create a new inventory item
  const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create inventory item');
      }
      
      const data = await response.json();
      setIsLoading(false);
      router.refresh();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the inventory item';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Update an existing inventory item
  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inventory item');
      }
      
      const data = await response.json();
      setIsLoading(false);
      router.refresh();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the inventory item';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Delete an inventory item
  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete inventory item');
      }
      
      setIsLoading(false);
      router.refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the inventory item';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Get low stock items
  const getLowStockItems = async (): Promise<InventoryItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/inventory/low-stock');
      
      if (!response.ok) {
        throw new Error('Failed to fetch low stock items');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching low stock items';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  };

  return {
    isLoading,
    error,
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems,
  };
}