'use client'

import { useState, useEffect } from 'react';

// Database carousel item structure
interface DatabaseCarouselItem {
  id: string;
  title: string;
  caption?: string;
  page: string;
  order: number;
  isActive: boolean;
  mediaId?: string;
  media?: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  };
  externalUrl?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Fallback JSON structure
interface FallbackCarouselItem {
  title: string;
  caption?: string;
  imageUrl: string;
  type: string;
  isActive: boolean;
  order: number;
}

// Final processed carousel item
interface CarouselItem {
  src: string;
  alt: string;
  caption?: string;
  type: 'image' | 'video';
}

export function useCarousel(page: string): CarouselItem[] {
  const [items, setItems] = useState<CarouselItem[]>([]);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {

        
        // First try to fetch from database API
        const response = await fetch(`/api/carousel?page=${page}`);
        if (response.ok) {
          const data = await response.json();
          const carouselItems = data.map((item: DatabaseCarouselItem) => ({
            src: item.media?.url || item.externalUrl || '',
            alt: item.title,
            caption: item.caption,
            type: item.type as 'image' | 'video'
          }));
          
          if (carouselItems.length > 0) {
            setItems(carouselItems);
            return;
          }
        }
        
        // Fallback to JSON file if database is empty or fails
        const fallbackResponse = await fetch('/config/carousel.json');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const pageItems = fallbackData[page] || [];
          
          const carouselItems = pageItems
            .filter((item: FallbackCarouselItem) => item.isActive)
            .sort((a: FallbackCarouselItem, b: FallbackCarouselItem) => a.order - b.order)
            .map((item: FallbackCarouselItem) => ({
              src: item.imageUrl,
              alt: item.title,
              caption: item.caption,
              type: item.type
            }));
          
          setItems(carouselItems);
        } else {
          // Final fallback to hardcoded items
          setItems([
            { src: '/Geo-spatial1.jpeg', alt: 'Spherical GIS Solutions', caption: 'Innovative Geospatial Technology', type: 'image' },
            { src: '/Geo-spatial2.jpg', alt: 'GIS & Remote Sensing', caption: 'Advanced Spatial Analysis', type: 'image' },
            { src: '/carousel-3.svg', alt: 'Solar Energy Solutions', caption: 'Sustainable Power for the Future', type: 'image' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching carousel data:', error);
        // Fallback to default items
        setItems([
          { src: '/Geo-spatial1.jpeg', alt: 'Spherical GIS Solutions', caption: 'Innovative Geospatial Technology', type: 'image' },
          { src: '/Geo-spatial2.jpg', alt: 'GIS & Remote Sensing', caption: 'Advanced Spatial Analysis', type: 'image' },
          { src: '/carousel-3.svg', alt: 'Solar Energy Solutions', caption: 'Sustainable Power for the Future', type: 'image' }
        ]);
      }
    };

    fetchCarouselData();
  }, [page]);

  return items;
}