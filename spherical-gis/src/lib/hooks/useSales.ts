'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
}

interface SaleItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  createdAt: Date;
  createdBy: string;
}

export function useSales() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all sales
  const getSales = async (): Promise<Sale[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/sales');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching sales');
      setIsLoading(false);
      return [];
    }
  };

  // Get a single sale by ID
  const getSale = async (id: string): Promise<Sale | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(`/api/sales/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sale');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the sale');
      setIsLoading(false);
      return null;
    }
  };

  // Create a new sale
  const createSale = async (sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create sale');
      }
      
      const data = await response.json();
      setIsLoading(false);
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the sale');
      setIsLoading(false);
      return null;
    }
  };

  // Calculate sale totals
  const calculateSaleTotals = (items: SaleItem[], discount: number = 0, tax: number = 0): {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
  } => {
    // Calculate subtotal
    const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    
    // Calculate discount amount
    const discountAmount = (subtotal * discount) / 100;
    
    // Calculate amount after discount
    const afterDiscount = subtotal - discountAmount;
    
    // Calculate tax amount
    const taxAmount = (afterDiscount * tax) / 100;
    
    // Calculate final amount
    const finalAmount = afterDiscount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      finalAmount,
    };
  };

  // Get sales by date range
  const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<Sale[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch(
        `/api/sales/by-date?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales by date range');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching sales by date range');
      setIsLoading(false);
      return [];
    }
  };

  // Get sales summary (for dashboard)
  const getSalesSummary = async (): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageSaleValue: number;
    salesByCategory: { category: string; count: number; amount: number }[];
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would be an API call
      const response = await fetch('/api/sales/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales summary');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching sales summary');
      setIsLoading(false);
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageSaleValue: 0,
        salesByCategory: [],
      };
    }
  };

  return {
    isLoading,
    error,
    getSales,
    getSale,
    createSale,
    calculateSaleTotals,
    getSalesByDateRange,
    getSalesSummary,
  };
}