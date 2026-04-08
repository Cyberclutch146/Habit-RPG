import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  return (
    <nav className="sticky bottom-0 w-full z-50 mt-auto flex justify-around items-center px-4 pt-3 pb-8 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-2xl">
      <NavLink 
        to="/dashboard"
        className={({ isActive }) => `flex flex-col items-center justify-center transition-all active:scale-90 duration-200 ${isActive ? "text-red-400" : "text-neutral-500 hover:text-red-400"}`}
      >
        <span className="material-symbols-outlined">swords</span>
        <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Quests</span>
      </NavLink>
      
      <NavLink 
        to="/boss"
        className={({ isActive }) => `flex flex-col items-center justify-center rounded-md px-4 py-1 active:scale-90 duration-200 ${isActive ? "bg-red-600 text-white shadow-[0_0_20px_rgba(209,54,57,0.3)]" : "text-neutral-500 bg-neutral-800"}`}
      >
        <span className="material-symbols-outlined">castle</span>
        <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Boss</span>
      </NavLink>

      <NavLink 
        to="/stats"
        className={({ isActive }) => `flex flex-col items-center justify-center transition-all active:scale-90 duration-200 ${isActive ? "text-red-400" : "text-neutral-500 hover:text-red-400"}`}
      >
        <span className="material-symbols-outlined">leaderboard</span>
        <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Stats</span>
      </NavLink>

      <NavLink 
        to="/vault"
        className={({ isActive }) => `flex flex-col items-center justify-center transition-all active:scale-90 duration-200 ${isActive ? "text-primary" : "text-neutral-500 hover:text-primary"}`}
      >
        <span className="material-symbols-outlined">shield</span>
        <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Vault</span>
      </NavLink>
    </nav>
  );
};
