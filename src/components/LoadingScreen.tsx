import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from './animations/ParticleBackground';
import { GlitchText } from './animations/GlitchText';
import { AnimatedText } from './animations/AnimatedText';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState(0);
  
  const phases = [
    "CALIBRATING HUD...",
    "SYNCING OPERATIVE DATA...",
    "INITIALIZING ENVIRONMENT..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p < phases.length - 1 ? p + 1 : p));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <m.div 
      className="fixed inset-0 bg-background flex flex-col items-center justify-center text-primary-container z-[100] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
    >
      <ParticleBackground />
      
      <div className="z-10 flex flex-col items-center">
        <m.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-t-2 border-r-2 border-primary mb-8"
        />
        
        <GlitchText 
          text="HABIT RPG" 
          className="text-4xl font-black tracking-tighter text-on-surface mb-2"
        />
        
        <div className="h-6">
          <AnimatePresence mode="wait">
            <m.div
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="font-mono text-xs uppercase tracking-widest text-primary"
            >
              <AnimatedText text={phases[phase]} />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
             <m.div 
               key={i}
               className={`h-1.5 rounded-full ${i <= phase ? 'w-8 bg-primary' : 'w-4 bg-outline-variant'}`}
               layout
               transition={{ type: 'spring', damping: 15 }}
             />
          ))}
        </div>
      </div>
    </m.div>
  );
};
