/**
 * Utility functions for formatting data in the application
 */

import { clsx, type ClassValue } from 'clsx';

// Utility function for merging class names
export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
};

// Format date with time
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-GH').format(num);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Generate a random ID (for temporary client-side IDs)
export const generateTempId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Format phone number (Ghana format)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a Ghana number
  if (cleaned.length === 10) {
    return `+233 ${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('233')) {
    return `+233 ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  
  // Return original if not matching expected format
  return phone;
};

// Calculate discount amount
export const calculateDiscount = (price: number, discountPercentage: number): number => {
  return price * (discountPercentage / 100);
};

// Calculate price after discount
export const calculatePriceAfterDiscount = (price: number, discountPercentage: number): number => {
  return price - calculateDiscount(price, discountPercentage);
};

// Calculate tax amount
export const calculateTax = (price: number, taxPercentage: number): number => {
  return price * (taxPercentage / 100);
};

// Calculate total with tax
export const calculateTotalWithTax = (price: number, taxPercentage: number): number => {
  return price + calculateTax(price, taxPercentage);
};