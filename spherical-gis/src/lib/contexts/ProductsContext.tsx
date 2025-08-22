'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  specifications: string;
  inStock: boolean;
}

interface ProductsContextType {
  products: Product[];
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  isLoading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface ProductsProviderProps {
  children: ReactNode;
}

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial product data
  const initialProducts: Product[] = [
    {
      id: 1,
      name: "Monocrystalline Solar Panels",
      description: "High-efficiency monocrystalline solar panels from leading manufacturers, designed for optimal performance in various environmental conditions.",
      price: 125000,
      category: "Solar Panels",
      imageUrl: "/solar-panel-1.jpg",
      specifications: "Various sizes available",
      inStock: true
    },
    {
      id: 2,
      name: "Polycrystalline Solar Panels",
      description: "Cost-effective polycrystalline solar panels offering reliable performance for residential and commercial applications.",
      price: 100000,
      category: "Solar Panels",
      imageUrl: "/solar-panel-200W.jpg",
      specifications: "Multiple wattages",
      inStock: true
    },
    {
      id: 3,
      name: "String Inverters",
      description: "High-performance string inverters that convert DC electricity from solar panels into AC electricity for home or business use.",
      price: 400000,
      category: "Inverters",
      imageUrl: "/hybrid-inverter.jpeg",
      specifications: "5kW - 50kW capacity",
      inStock: true
    },
    {
      id: 4,
      name: "Microinverters",
      description: "Advanced microinverters for panel-level optimization and monitoring, maximizing energy harvest.",
      price: 75000,
      category: "Inverters",
      imageUrl: "/off-grid-solar-power-system-15-30kw-4.jpg",
      specifications: "250W - 400W per unit",
      inStock: true
    },
    {
      id: 5,
      name: "Lithium-ion Battery Storage",
      description: "High-capacity lithium-ion battery systems for storing excess solar energy for use during nighttime or power outages.",
      price: 600000,
      category: "Battery Storage",
      imageUrl: "/lithium-lon battery.jpeg",
      specifications: "10kWh - 100kWh capacity",
      inStock: true
    },
    {
      id: 6,
      name: "Lead-acid Battery Storage",
      description: "Reliable and cost-effective lead-acid battery solutions for solar energy storage applications.",
      price: 200000,
      category: "Battery Storage",
      imageUrl: "/afriipower-220ah12v-tall-tubular-battery.jpg",
      specifications: "Various capacities",
      inStock: false
    },
    {
      id: 7,
      name: "Roof Mounting Systems",
      description: "Durable roof mounting systems designed for different roof types including tile, metal, and flat roofs.",
      price: 150000,
      category: "Mounting Systems",
      imageUrl: "/solar-panel-1.jpg",
      specifications: "Custom solutions available",
      inStock: true
    },
    {
      id: 8,
      name: "Ground Mounting Systems",
      description: "Robust ground mounting solutions for large-scale solar installations and ground-mounted arrays.",
      price: 250000,
      category: "Mounting Systems",
      imageUrl: "/solar-panel-200W.jpg",
      specifications: "Adjustable tilt angles",
      inStock: true
    },
    {
      id: 9,
      name: "MPPT Charge Controllers",
      description: "Maximum Power Point Tracking charge controllers for optimal battery charging efficiency.",
      price: 90000,
      category: "Charge Controllers",
      imageUrl: "/charge-controller-msc-01.jpg",
      specifications: "20A - 100A capacity",
      inStock: true
    },
    {
      id: 10,
      name: "PWM Charge Controllers",
      description: "Pulse Width Modulation charge controllers offering reliable and cost-effective battery charging.",
      price: 40000,
      category: "Charge Controllers",
      imageUrl: "/charge-controller-msc-01.jpg",
      specifications: "10A - 60A capacity",
      inStock: true
    },
    {
      id: 11,
      name: "Solar Cables & Connectors",
      description: "High-quality UV-resistant cables and MC4 connectors for reliable solar panel connections.",
      price: 25000,
      category: "Accessories",
      imageUrl: "/battery.png",
      specifications: "Various lengths",
      inStock: true
    },
    {
      id: 12,
      name: "Monitoring Systems",
      description: "Advanced monitoring systems to track solar system performance and energy production in real-time.",
      price: 175000,
      category: "Accessories",
      imageUrl: "/hybrid-inverter.jpeg",
      specifications: "WiFi & cellular options",
      inStock: true
    }
  ];

  useEffect(() => {
    // Initialize products from localStorage or use default data
    const savedProducts = localStorage.getItem('spherical_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Error parsing saved products:', error);
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }

    // Listen for storage changes (real-time sync between tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spherical_products' && e.newValue) {
        try {
          setProducts(JSON.parse(e.newValue));
          toast.success('Products updated in real-time');
        } catch (error) {
          console.error('Error parsing updated products:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProducts = products.map(product => 
        product.id === id ? { ...product, ...updates } : product
      );
      
      setProducts(updatedProducts);
      
      // Save to localStorage for persistence and real-time sync
      localStorage.setItem('spherical_products', JSON.stringify(updatedProducts));
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { productId: id, updates } 
      }));
      
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate new ID
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      const newProduct: Product = { ...productData, id: newId };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      
      // Save to localStorage for persistence and real-time sync
      localStorage.setItem('spherical_products', JSON.stringify(updatedProducts));
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { productId: newId, updates: newProduct } 
      }));
      
      toast.success('Product added successfully');
    } catch (error) {
      toast.error('Failed to add product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      
      // Save to localStorage for persistence and real-time sync
      localStorage.setItem('spherical_products', JSON.stringify(updatedProducts));
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { productId: id, updates: null } 
      }));
      
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from API
      // For now, we'll just reload from localStorage
      const savedProducts = localStorage.getItem('spherical_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } catch (error) {
      toast.error('Failed to refresh products');
    } finally {
      setIsLoading(false);
    }
  };

  const value: ProductsContextType = {
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    refreshProducts,
    isLoading
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}

export type { Product };