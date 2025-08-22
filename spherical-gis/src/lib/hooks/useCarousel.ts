'use client'

import { useState, useEffect } from 'react';

interface CarouselItem {
  src: string;
  alt: string;
  caption?: string;
  type: 'image' | 'video';
}

export function useCarousel(page: string): CarouselItem[] {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        
        // First try to fetch from database API
        const response = await fetch(`/api/carousel?page=${page}`);
        if (response.ok) {
          const data = await response.json();
          const carouselItems = data.map((item: any) => ({
            src: item.src,
            alt: item.alt,
            caption: item.caption,
            type: item.type
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
            .filter((item: any) => item.isActive)
            .sort((a: any, b: any) => a.order - b.order)
            .map((item: any) => ({
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
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, [page]);

  return items;
}