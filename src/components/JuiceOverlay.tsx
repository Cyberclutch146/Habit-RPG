import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useJuiceStore } from '../store/useJuiceStore';

export const JuiceOverlay: React.FC = () => {
  const floatingNumbers = useJuiceStore(state => state.floatingNumbers);
  const levelUpToasts = useJuiceStore(state => state.levelUpToasts);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden sm:max-w-md sm:mx-auto">
      {/* Floating XP Numbers */}
      <AnimatePresence>
        {floatingNumbers.map((num) => (
          <m.div
            key={num.id}
            initial={{ opacity: 1, y: num.y, x: num.x, scale: 0.5 }}
            animate={{ opacity: 0, y: num.y - 120, x: num.x + (Math.random() * 40 - 20), scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute font-black text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${num.color || 'text-primary'}`}
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.4)' 
            }}
          >
            +{num.value}
          </m.div>
        ))}
      </AnimatePresence>

      {/* Level Up Toasts */}
      <div className="absolute top-24 left-0 right-0 flex flex-col items-center justify-start pointer-events-none space-y-4">
        <AnimatePresence>
          {levelUpToasts.map((toast) => (
             <m.div
               key={toast.id}
               initial={{ opacity: 0, y: -50, scale: 0.8, rotateX: -20 }}
               animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: -20 }}
               transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
               className="bg-black/80 backdrop-blur-md border-2 border-primary p-6 rounded-2xl shadow-[0_0_40px_rgba(255,107,107,0.5)] flex flex-col items-center text-center w-3/4 pointer-events-auto"
             >
               <span className="material-symbols-outlined text-5xl text-primary mb-2 drop-shadow-[0_0_15px_rgba(255,107,107,1)]">
                 stat_3
               </span>
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
                 Level Up!
               </h2>
               <p className="text-primary-variant font-bold text-lg">
                 You reached Level {toast.level}
               </p>
             </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
