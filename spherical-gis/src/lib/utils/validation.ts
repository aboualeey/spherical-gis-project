import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['managing_director', 'admin', 'inventory_manager', 'cashier', 'report_viewer']),
  isActive: z.boolean().default(true),
});

// Public registration schema (no role required)
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  price: z.number().positive('Price must be a positive number'),
  costPrice: z.number().positive('Cost price must be a positive number'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  imageUrl: z.string().optional(),
});

// Inventory validation schema
export const inventorySchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  minStockLevel: z.number().int().nonnegative('Minimum stock level must be a non-negative integer'),
});

// Sale validation schema
export const saleItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
});

export const saleSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
  customerEmail: z.string().email('Invalid email address').optional(),
  customerPhone: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'mobile_money']),
  discount: z.number().nonnegative('Discount must be a non-negative number').default(0),
  tax: z.number().nonnegative('Tax must be a non-negative number').default(0),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Quote request validation schema
export const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  company: z.string().optional(),
  serviceType: z.enum(['gis_mapping', 'remote_sensing', 'solar_installation', 'consultancy', 'other']),
  otherServiceType: z.string().optional(),
  projectDescription: z.string().min(20, 'Project description must be at least 20 characters'),
  budget: z.enum(['less_than_5000', '5000_to_10000', '10000_to_50000', 'more_than_50000', 'not_sure']),
  timeframe: z.enum(['immediate', 'within_1_month', '1_to_3_months', '3_to_6_months', 'more_than_6_months']),
  additionalInfo: z.string().optional(),
}).refine(
  (data) => !(data.serviceType === 'other' && !data.otherServiceType),
  {
    message: 'Please specify the other service type',
    path: ['otherServiceType'],
  }
);