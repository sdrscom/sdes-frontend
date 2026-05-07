import React from 'react';

interface WaveSeparatorProps {
  topColor?: string;
  bottomColor?: string;
  flip?: boolean;
}

const WaveSeparator: React.FC<WaveSeparatorProps> = ({ 
  topColor = '#262f61', 
  bottomColor = '#1a2347',
  flip = false 
}) => {
  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ 
        backgroundColor: topColor,
        transform: flip ? 'rotate(180deg)' : 'none'
      }}
    >
      {/* Main Wave */}
      <svg
        className="w-full h-20 sm:h-24 md:h-28 lg:h-32"
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Shadow Layer */}
        {/* <path
          d="M0,48 C320,80 640,80 960,48 C1120,32 1280,32 1440,48 L1440,120 L0,120 Z"
          fill="rgba(0,0,0,0.1)"
        /> */}
        
        {/* Middle Wave with Gradient */}
        <path
          d="M0,56 C320,88 640,88 960,56 C1120,40 1280,40 1440,56 L1440,120 L0,120 Z"
          fill="url(#waveGradient)"
        />
        
        {/* Top Wave */}
        {/* <path
          d="M0,64 C320,96 640,96 960,64 C1120,48 1280,48 1440,64 L1440,120 L0,120 Z"
          fill={bottomColor}
        /> */}
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2D3B76', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: bottomColor, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Optional Decorative Pattern - Reversed Diagonal Lines */}
      <div className="absolute inset-0 opacity-[10%] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="wave-diagonal"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,0 L40,40"
                stroke="#4A5578"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M-20,0 L20,40"
                stroke="#4A5578"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M20,0 L60,40"
                stroke="#4A5578"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave-diagonal)" />
        </svg>
      </div>
    </div>
  );
};

export default WaveSeparator;

// <WaveSeparator topColor="#262f61" bottomColor="#1a2347" />
