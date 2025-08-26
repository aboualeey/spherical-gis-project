'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';

interface CarouselItem {
  src: string;
  alt: string;
  caption?: string;
  type: 'image' | 'video';
}

interface CarouselProps {
  items: CarouselItem[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  className?: string;
}

export default function Carousel({
  items,
  autoSlide = true,
  autoSlideInterval = 5000,
  showIndicators = true,
  showArrows = true,
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (!autoSlide) return;

    const slideInterval = setInterval(goToNext, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval]);

  // Handle video playback when slide changes
  useEffect(() => {
    const currentItem = items[currentIndex];
    if (currentItem?.type === 'video') {
      const videos = document.querySelectorAll('video');
      videos.forEach((video, index) => {
        if (index === currentIndex) {
          video.currentTime = 0;
          video.play().catch(err => {
            console.error('Video autoplay failed:', err);
          });
        } else {
          video.pause();
        }
      });
    }
  }, [currentIndex, items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Main carousel container */}
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {item.type === 'image' ? (
              <div className="relative w-full h-full">
                <Image
                  src={item.src || '/placeholder-hero.jpg'}
                  alt={item.alt}
                  fill
                  className="object-cover w-full h-full"
                  priority={index === 0}
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  onError={(e) => {
                    console.error('Image loading error:', e);
                    console.error('Image src:', item.src);
                    // Set fallback image
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder-hero.jpg') {
                      target.src = '/placeholder-hero.jpg';
                    }
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', item.src);
                  }}
                />
              </div>
            ) : (
              <video
                key={`video-${index}-${currentIndex}`}
                className="w-full h-full object-cover"
                autoPlay={index === currentIndex}
                muted
                loop
                playsInline
                controls={false}
                preload="auto"
                poster=""
                onError={(e) => {
                  console.error('Video loading error:', e);
                  console.error('Video src:', item.src);
                }}
                onLoadStart={() => {
                  console.log('Video loading started:', item.src);
                }}
                onCanPlay={(e) => {
                  console.log('Video can play:', item.src);
                  if (index === currentIndex) {
                    e.currentTarget.play().catch(err => {
                      console.error('Video play failed:', err);
                    });
                  }
                }}
                onLoadedData={(e) => {
                  console.log('Video data loaded:', item.src);
                  if (index === currentIndex) {
                    e.currentTarget.play().catch(err => {
                      console.error('Video play failed:', err);
                    });
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
              >
                <source src={item.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            
            {/* Caption overlay */}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 sm:p-4 z-20">
                <p className="text-center text-sm sm:text-lg font-medium px-2">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 sm:p-3 text-white hover:bg-opacity-75 focus:outline-none transition-all touch-manipulation"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="w-3 h-3 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 sm:p-3 text-white hover:bg-opacity-75 focus:outline-none transition-all touch-manipulation"
            aria-label="Next slide"
          >
            <FaChevronRight className="w-3 h-3 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 flex justify-center space-x-1 sm:space-x-2 px-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all touch-manipulation ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}