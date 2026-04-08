import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  active?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '', active = true }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!active) return;
    
    // Trigger random glitch spasms
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 100 + Math.random() * 200);
      
      const nextGlitch = Math.random() * 3000 + 1000;
      timeoutId = setTimeout(triggerGlitch, nextGlitch);
    };

    let timeoutId = setTimeout(triggerGlitch, 1000);
    return () => clearTimeout(timeoutId);
  }, [active]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      
      {isGlitching && (
        <>
          <m.span 
            className="absolute top-0 left-[2px] text-primary mix-blend-screen z-0"
            animate={{ x: [-2, 2, -1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
          >
            {text}
          </m.span>
          <m.span 
            className="absolute top-0 -left-[2px] text-secondary mix-blend-screen z-0"
            animate={{ x: [2, -2, 1, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatType: "mirror" }}
            style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' }}
          >
            {text}
          </m.span>
        </>
      )}
    </div>
  );
};
