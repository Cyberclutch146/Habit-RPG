import React from 'react';
import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';

export const BottomNav: React.FC = () => {
  return (
    <nav className="sticky bottom-0 w-full z-50 mt-auto flex justify-around items-center px-4 pt-3 pb-8 bg-surface-container-high/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl">
      <NavLink 
        to="/dashboard"
        className="flex flex-col items-center justify-center outline-none"
      >
        {({ isActive }) => (
          <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
            <span className={`material-symbols-outlined ${isActive && "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>swords</span>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Quests</span>
          </m.div>
        )}
      </NavLink>
      
      <NavLink 
        to="/boss"
        className="flex flex-col items-center justify-center outline-none -translate-y-4"
      >
        {({ isActive }) => (
          <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 border transition-all duration-300 ${isActive ? "bg-primary text-on-primary border-primary shadow-[0_8px_20px_rgba(var(--color-primary),0.4)]" : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30 shadow-md"}`}>
            <span className="material-symbols-outlined text-[28px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>castle</span>
          </m.div>
        )}
      </NavLink>

      <NavLink 
        to="/stats"
        className="flex flex-col items-center justify-center outline-none"
      >
        {({ isActive }) => (
          <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
             <span className={`material-symbols-outlined ${isActive && "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>leaderboard</span>
             <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Stats</span>
          </m.div>
        )}
      </NavLink>

      <NavLink 
        to="/vault"
        className="flex flex-col items-center justify-center outline-none"
      >
         {({ isActive }) => (
          <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
             <span className={`material-symbols-outlined ${isActive && "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>shield</span>
             <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Vault</span>
          </m.div>
        )}
      </NavLink>
    </nav>
  );
};
