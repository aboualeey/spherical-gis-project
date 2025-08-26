/**
 * Currency formatting utilities for Nigerian Naira (NGN)
 */

/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatNaira(amount: number, options?: {
  showSymbol?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options || {};

  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits,
    maximumFractionDigits
  });

  if (showSymbol) {
    return formatter.format(amount);
  } else {
    // Return without currency symbol
    return formatter.format(amount).replace(/₦|NGN/g, '').trim();
  }
}

/**
 * Format a number as Nigerian Naira with custom symbol
 * @param amount - The amount to format
 * @param symbol - Custom symbol to use (default: ₦)
 * @returns Formatted currency string
 */
export function formatNairaCustom(amount: number, symbol: string = '₦'): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${symbol}${formatted}`;
}

/**
 * Parse a formatted currency string back to a number
 * @param currencyString - The formatted currency string
 * @returns Parsed number
 */
export function parseNaira(currencyString: string): number {
  // Remove currency symbols and parse
  const cleanString = currencyString.replace(/[₦,\s]/g, '');
  return parseFloat(cleanString) || 0;
}

/**
 * Format currency for display in tables or lists
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export function formatNairaCompact(amount: number): string {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatNaira(amount);
  }
}