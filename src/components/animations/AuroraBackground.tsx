import React, { ReactNode } from 'react';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  colors?: string[]; // hex colors for the gradient
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ 
  children, 
  className = '',
  colors = [
    'rgba(209,54,57,0.4)',  // primary
    'rgba(74,20,38,0.5)',   // surface high
    'rgba(255,180,171,0.3)' // secondary
  ]
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-background ${className}`}>
      {/* Base gradient elements */}
      <div className="absolute inset-0 z-0 opacity-60">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[90px] animate-aurora-1"
          style={{ backgroundColor: colors[0] }}
        />
        <div 
          className="absolute top-[20%] right-[-20%] w-[70%] h-[70%] rounded-full mix-blend-screen filter blur-[120px] animate-aurora-2"
          style={{ backgroundColor: colors[1] }}
        />
        <div 
          className="absolute bottom-[-30%] left-[10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[100px] animate-aurora-3"
          style={{ backgroundColor: colors[2] }}
        />
      </div>
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
