import React from 'react';
import { useHabitStore } from '../../store/useHabitStore';

export const TopBar: React.FC = () => {
  const user = useHabitStore(state => state.user);
  
  // Dummy data if offline or unloaded
  const streak = user?.streak || 0;
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-neutral-950/80 backdrop-blur-lg shadow-[0_10px_40px_rgba(209,54,57,0.08)] flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-red-600 overflow-hidden">
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBroGboYbDeiZF1X4DUDDHb91465SjdGSpNW_9gceBWsK5QDprKP8np2o2VpwJfKk6iocrbv5P6vcPr9tLOFpotw-FbrErXoD78SZRgA1kIJrlW8dbRH2stIoTRBFf2O-NkUehEWpnPwtt3sWozKxrrCcqyyEW-RjMgJc0RWMpRCEmfWnN9C0z0bTHvxwwTzryVvoSSushyAWL8q8RqA0SE0GlKabicWEmlEPMaSr0UOzLnBRyf5x1QL7eTSEerQEE_3Qm9cZw78eI"
          />
        </div>
        <span className="text-2xl font-black italic tracking-tighter text-red-600 uppercase font-headline">ASCEND</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/20">
          <span className="material-symbols-outlined text-red-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-xs font-bold font-label tracking-widest uppercase">{streak} DAY STREAK</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-neutral-400">settings</span>
        </button>
      </div>
    </header>
  );
};
