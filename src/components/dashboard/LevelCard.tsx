import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import { gameEngine } from '../../lib/gameEngine';
import { m } from 'framer-motion';

export const LevelCard: React.FC = () => {
  const user = useUserStore(state => state.user);
  
  if (!user) return <div className="h-40 bg-surface-container-low rounded-2xl animate-pulse m-6" />; // Skeleton

  const nextXp = gameEngine.getXPForNextLevel(user.level);
  const progressPercent = Math.min(100, Math.floor((user.xp / nextXp) * 100));
  const currentRank = gameEngine.getUserRank(user.level);

  return (
    <m.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-2xl bg-surface-container-high p-6 m-4 mt-6 border border-outline-variant/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
    >
      {/* Background RPG Accent */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-primary">
        <span className="material-symbols-outlined text-[140px] rotate-12">shield</span>
      </div>
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />

      <div className="relative z-10 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <m.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-20 h-20 rounded-2xl border-2 border-primary-container p-1 shadow-lg shadow-primary/20 bg-background overflow-hidden"
          >
            <img 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-xl" 
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4"
            />
          </m.div>
          <div className="absolute -bottom-3 -right-2 bg-primary text-on-primary font-black text-xs px-2.5 py-1 rounded-lg border-2 border-surface-container-high shadow-md">
            LVL {user.level}
          </div>
        </div>
        
        <div className="flex-grow space-y-2">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-on-surface leading-none mb-1">{user.name}</h1>
            <span className="text-xs font-bold text-primary tracking-[0.1em] uppercase">{currentRank}</span>
          </div>
          
          <div className="space-y-1.5 pt-1">
             <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Experience</span>
                <span className="text-[10px] font-bold font-mono text-on-surface-variant">{user.xp.toLocaleString()} / {nextXp.toLocaleString()}</span>
             </div>
            <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden p-0.5 relative">
              <m.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--color-primary),0.8)] relative overflow-hidden" 
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
              </m.div>
            </div>
          </div>
        </div>
      </div>
    </m.section>
  );
};
