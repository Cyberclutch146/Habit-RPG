import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';

export const Stats: React.FC = () => {
  const user = useUserStore(state => state.user);

  return (
    <>
      <TopBar />
      
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-8">
        {/* Hero Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-primary-container shadow-xl">
            <p className="font-label text-xs tracking-widest text-secondary uppercase mb-1">Combat Level</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-on-surface tracking-tighter">LVL {user?.level || 1}</span>
              <span className="text-primary font-bold text-sm">EXP: {user?.xp || 0}</span>
            </div>
            <div className="mt-4 w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full shadow-[0_0_10px_rgba(209,54,57,0.5)]" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-primary-container shadow-xl">
            <p className="font-label text-xs tracking-widest text-secondary uppercase mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-on-surface tracking-tighter">{user?.streak || 0} DAYS</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <p className="text-secondary text-xs mt-2 italic">Keep it going to maximize multipliers!</p>
          </div>
          
          <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-primary-container shadow-xl">
            <p className="font-label text-xs tracking-widest text-secondary uppercase mb-1">Global Rank</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-on-surface tracking-tighter">#---</span>
              <span className="text-primary font-bold text-sm">UNRANKED</span>
            </div>
            <p className="text-secondary text-xs mt-2">Leaderboards unlocking soon</p>
          </div>
        </section>

        {/* Kinetic XP Graph (Placeholder for future data viz) */}
        <section className="bg-surface-container rounded-xl overflow-hidden shadow-2xl relative border border-outline-variant/10">
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-lg font-black tracking-tighter uppercase text-on-surface">XP Kinetic Flow</h2>
            <div className="flex gap-2">
              <span className="bg-surface-container-lowest px-3 py-1 text-[10px] font-bold uppercase rounded border border-outline-variant/20">7 Days</span>
              <span className="bg-primary-container text-on-primary-container px-3 py-1 text-[10px] font-bold uppercase rounded">30 Days</span>
            </div>
          </div>
          <div className="h-64 w-full relative px-6 pb-6">
            <div className="absolute inset-x-6 inset-y-0 flex flex-col justify-between opacity-10 pointer-events-none pb-6">
              <div className="border-t border-secondary"></div>
              <div className="border-t border-secondary"></div>
              <div className="border-t border-secondary"></div>
              <div className="border-t border-secondary"></div>
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <p className="text-on-surface-variant font-mono text-sm tracking-widest uppercase">Collecting temporal data...</p>
            </div>
          </div>
        </section>

        {/* Bento Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Habit Heatmap (Left/Large) */}
          <div className="md:col-span-8 bg-surface-container p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black tracking-tighter uppercase text-on-surface">Habit Matrix</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-secondary">
                <span>LESS</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-surface-container-lowest rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary/50 rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary/80 rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary-container rounded-sm"></div>
                </div>
                <span>MORE</span>
              </div>
            </div>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex items-center justify-center p-8 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                 <p className="text-on-surface-variant font-mono text-xs tracking-widest uppercase">Matrix generating...</p>
              </div>
            </div>
          </div>
          
          {/* Streak History (Right/Small) */}
          <div className="md:col-span-4 bg-surface-container p-6 rounded-xl shadow-xl space-y-4">
            <h2 className="text-lg font-black tracking-tighter uppercase text-on-surface">Streak History</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                <div>
                  <p className="font-black text-on-surface">{user?.streak || 0} DAYS</p>
                  <p className="text-[10px] text-secondary uppercase font-bold tracking-widest">Active Streak</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">trending_up</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                <div>
                  <p className="font-black text-on-surface">-- DAYS</p>
                  <p className="text-[10px] text-secondary uppercase font-bold tracking-widest">Historical Best</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-neutral-400 text-sm">trophy</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};
