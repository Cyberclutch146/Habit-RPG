import React, { ReactNode } from 'react';

interface StarBorderProps {
  children?: ReactNode;
  className?: string;
  as?: React.ElementType;
  color?: string;
  speed?: string;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  children,
  className = '',
  as: Component = 'div',
  color = 'rgba(209,54,57,1)', // primary color
  speed = '4s'
}) => {
  return (
    <Component className={`relative inline-block overflow-hidden rounded-2xl group ${className}`}>
      {/* Animated spinning background */}
      <div 
        className="absolute inset-[-150%] animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
        style={{ 
          animationDuration: speed,
          background: `conic-gradient(transparent, transparent, transparent, ${color})` 
        }} 
      />
      {/* Inner Mask (to hide the center and only show the border) */}
      <div className="absolute inset-[1px] rounded-2xl bg-surface-container-highest z-0" />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </Component>
  );
};
