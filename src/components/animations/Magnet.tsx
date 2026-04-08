import React, { useRef } from 'react';
import { m, useAnimation } from 'framer-motion';

interface MagnetProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const Magnet: React.FC<MagnetProps> = ({ children, className = '', strength = 30 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // We map coordinates without heavy useMotionValue hook recalculations 
  // for better performance on mobile.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const renderX = clientX - (left + width / 2);
    const renderY = clientY - (top + height / 2);
    
    controls.start({
      x: renderX * (strength / 100),
      y: renderY * (strength / 100),
      transition: { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }
    });
  };

  const handleMouseLeave = () => {
    controls.start({
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 20 }
    });
  };

  return (
    <m.div
      ref={ref}
      animate={controls}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </m.div>
  );
};
