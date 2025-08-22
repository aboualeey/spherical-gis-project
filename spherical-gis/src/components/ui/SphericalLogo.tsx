'use client';

import React from 'react';

interface SphericalLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SphericalLogo: React.FC<SphericalLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer sphere */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          className="animate-pulse"
        />
        
        {/* Inner sphere with gradient */}
        <defs>
          <radialGradient id="sphereGradient" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="url(#sphereGradient)"
        />
        
        {/* Latitude lines */}
        <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        <ellipse cx="50" cy="50" rx="35" ry="25" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
        <line x1="15" y1="50" x2="85" y2="50" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
        
        {/* Longitude lines */}
        <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        <ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
        <line x1="50" y1="15" x2="50" y2="85" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
        
        {/* Center point */}
        <circle cx="50" cy="50" r="2" fill="#ffffff" />
        
        {/* Orbital ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="5,5"
          className="animate-spin"
          style={{ animationDuration: '10s' }}
        />
      </svg>
    </div>
  );
};

export default SphericalLogo;