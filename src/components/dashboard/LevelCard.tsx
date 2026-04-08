import React from 'react';
import { useHabitStore } from '../../store/useHabitStore';
import { gameEngine } from '../../lib/gameEngine';

export const LevelCard: React.FC = () => {
  const user = useHabitStore(state => state.user);
  
  if (!user) return <div className="h-40 bg-surface-container-low rounded-xl animate-pulse" />; // Skeleton

  const nextXp = gameEngine.getXPForNextLevel(user.level);
  const progressPercent = Math.min(100, Math.floor((user.xp / nextXp) * 100));

  return (
    <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 border-b-4 border-red-600 shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[120px]">shield</span>
      </div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary-container p-1 blood-shadow">
            <img 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full bg-neutral-800" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALorwqNhzcei6w9hEX4SyTi2fF35HY_YfsnIMZoT_NlSvxA0Zj6oaQu834EXBcyxQDjEQVQkyKPwnJfH0FVId1Y3U17viIR-AQaWPqL_Q4YAayoSrTHicuq0dYoN2PqSiyEONR5lbt5lR4k6XrslhNzUID_30y_kWn_th8Y02IlDUImNpzZnQGeyuuiXmO3jHRw00JGGlnK_vRvyVgxsAnjkCvevez6ms2dEYpx6LOu204I_ww-7au9w1VnCn7dQmNhiGwrFuP4Pw"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-red-600 text-white font-black text-sm px-2 py-0.5 rounded italic">
            LVL {user.level}
          </div>
        </div>
        <div className="flex-grow space-y-3">
          <div className="flex justify-between items-end">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-on-surface">{user.name}</h1>
            <span className="text-xs font-bold font-label text-neutral-500 tracking-[0.2em]">{user.xp.toLocaleString()} / {nextXp.toLocaleString()} XP</span>
          </div>
          <div className="h-4 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-outline-variant/10 relative">
            <div 
              className="h-full kinetic-gradient rounded-full shadow-[0_0_15px_rgba(209,54,57,0.5)] transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
