import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useHabitStore } from '../store/useHabitStore';

export const Boss: React.FC = () => {
  const getWeeklyProgress = useHabitStore(state => state.getWeeklyProgress);
  const weeklyProgress = getWeeklyProgress();
  
  // Weekly progress is just an example. 
  // Let's say the goal is 20 completed habits per week
  const goal = 20;
  const current = weeklyProgress;
  const progressPercent = Math.min(100, Math.round((current / goal) * 100));

  return (
    <>
      <TopBar />
      
      <main className="flex-grow pt-24 pb-32 px-6 kinetic-bg relative overflow-hidden min-h-screen">
        {/* Background Decor */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          
          {/* Boss Identity Header */}
          <div className="text-center space-y-2">
            <span className="font-label text-sm tracking-[0.2em] text-primary font-bold uppercase">Legendary Encounter</span>
            <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase text-on-surface">The Sloth Demon</h2>
            <div className="flex items-center justify-center gap-2 text-neutral-500 font-label text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>skull</span>
              WEEKLY BOSS
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>skull</span>
            </div>
          </div>

          {/* Kinetic Boss Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary-container/20 blur-xl group-hover:bg-primary-container/30 transition-all duration-500 rounded-xl"></div>
            <div className="relative bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/20 shadow-[0_0_60px_rgba(209,54,57,0.2)]">
              <div className="aspect-[16/9] md:aspect-[21/9] relative">
                <img 
                  alt="The Sloth Demon" 
                  className="w-full h-full object-cover scale-105 transition-transform duration-1000" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNMdVhAtmmQqxrnOQWrAHF8YRWwIKDNWotl9JFbFniXEuI_LP2AKbyowpXo8bOsHbciAdhTnC6k33nBFYPVkbHnVNNP_ZrCh9CbU_mqYpAzGe6ycA4Q-iN4_hS7_IYe8pLRPWxjYFRRtVx18GythakiZ7efVlOa0USaIMGjfxkUzSroHiPP1tZgZsDPpkVbQsSOwnk8OFsgDotACku0aU5wul9AdWGbN3ualAt7Fvtwf6Zqh4APWAoo9cQsyIQhjw52kOXx9n5Fd4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent"></div>
                <div className="absolute inset-0 border-[4px] border-primary/20 opacity-40 mix-blend-overlay"></div>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="font-label text-xs tracking-widest text-secondary uppercase">Damage Inflicted</div>
                    <div className="text-2xl font-black italic text-primary-container font-headline">{progressPercent}%</div>
                  </div>
                  <div className="h-4 w-full bg-surface-container-lowest rounded-full p-1 shadow-inner overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full relative transition-all duration-1000" style={{ width: `${progressPercent}%` }}>
                      <div className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-sm animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 font-body italic text-center">Complete {goal - Math.min(current, goal)} more habits this week to execute the finisher move.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <div>
                <div className="text-2xl font-black text-on-surface">1,250</div>
                <div className="font-label text-[10px] tracking-widest text-neutral-500 uppercase">XP Drop</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-amber-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <div className="text-sm font-black text-on-surface uppercase tracking-tight">Sloth Slayer</div>
                <div className="font-label text-[10px] tracking-widest text-neutral-500 uppercase">Legendary Title</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </>
  );
};
