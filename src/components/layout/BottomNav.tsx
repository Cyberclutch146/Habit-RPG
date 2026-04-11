import React from 'react';
import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';
import { Magnet } from '../animations/Magnet';
import { StarBorder } from '../animations/StarBorder';
import { useSoundEffects } from '../../hooks/useSoundEffects';

export const BottomNav: React.FC = () => {
  const { playClick } = useSoundEffects();

  return (
    <nav className="sticky bottom-0 w-full z-50 mt-auto flex justify-around items-center px-4 pt-3 pb-8 bg-surface-container-high/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl">
      <NavLink 
        to="/dashboard"
        onClick={() => playClick()}
        className="flex flex-col items-center justify-center outline-none"
      >
        {({ isActive }) => (
          <Magnet strength={20}>
            <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
              <span className={`material-symbols-outlined ${isActive && "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>swords</span>
              <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Quests</span>
            </m.div>
          </Magnet>
        )}
      </NavLink>
      
      <NavLink 
        to="/boss"
        onClick={() => playClick()}
        className="flex flex-col items-center justify-center outline-none"
      >
        {({ isActive }) => (
          <Magnet strength={20}>
            <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
              {isActive ? (
                <div className="flex flex-col items-center relative">
                  <span className="absolute inset-0 bg-primary/20 blur-md rounded-full"></span>
                  <span className="material-symbols-outlined text-[24px] drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>castle</span>
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Boss</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">castle</span>
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Boss</span>
                </>
              )}
            </m.div>
          </Magnet>
        )}
      </NavLink>

      <NavLink 
        to="/stats"
        onClick={() => playClick()}
        className="flex flex-col items-center justify-center outline-none"
      >
        {({ isActive }) => (
          <Magnet strength={20}>
            <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
               <span className={`material-symbols-outlined ${isActive && "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>leaderboard</span>
               <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Stats</span>
            </m.div>
          </Magnet>
        )}
      </NavLink>

      <NavLink 
        to="/vault"
        onClick={() => playClick()}
        className="flex flex-col items-center justify-center outline-none"
      >
         {({ isActive }) => (
          <Magnet strength={20}>
            <m.div whileTap={{ scale: 0.9 }} className={`flex flex-col items-center transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary/80"}`}>
               <span className={`material-symbols-outlined ${isActive && "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>shield</span>
               <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">Vault</span>
            </m.div>
          </Magnet>
        )}
      </NavLink>
    </nav>
  );
};
