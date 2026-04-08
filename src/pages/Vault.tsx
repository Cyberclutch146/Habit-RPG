import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';
import { AnimatedText } from '../components/animations/AnimatedText';
import { SpotlightCard } from '../components/animations/SpotlightCard';

export const Vault: React.FC = () => {
  const user = useUserStore(state => state.user);

  return (
    <>
      <TopBar />
      
      <main className="pt-20 pb-32 px-6 w-full flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-on-surface">
             <AnimatedText text="The Vault" />
          </h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">Your hard-earned relics and active multipliers.</p>
        </div>

        {/* Multipliers */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Active Multipliers</h2>
          {user && user.level >= 5 ? (
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-lg border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">Level 5 Resonance</p>
                  <p className="text-xs text-on-surface-variant">+10% Base XP</p>
                </div>
              </div>
              <span className="text-primary font-black">ACTIVE</span>
            </div>
          ) : (
             <div className="p-4 border border-dashed border-outline-variant/30 rounded-lg text-center text-on-surface-variant text-sm">
                Unlock your first multiplier at Level 5.
             </div>
          )}
        </section>

        {/* Consumables (Streak Shields) */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-secondary/20 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-sm font-bold tracking-widest text-secondary uppercase">Streak Shields</h2>
             <span className="text-xs font-mono text-secondary-dim bg-secondary/10 px-2 py-0.5 rounded">{user?.streakShields || 0}/2</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(slot => {
              const isActive = (user?.streakShields || 0) >= slot;
              return (
                <SpotlightCard key={slot} className="w-full h-full rounded-xl">
                  <div className={`w-full h-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${isActive ? 'bg-secondary/10 border-secondary/50 shadow-[0_0_15px_rgba(214,116,255,0.2)]' : 'bg-surface-container-lowest border-outline-variant/20 opacity-50'}`}>
                    <span className={`material-symbols-outlined text-3xl ${isActive ? 'text-secondary' : 'text-outline-variant'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      shield
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                      {isActive ? "Ready" : "Empty"}
                    </span>
                  </div>
                </SpotlightCard>
              )
            })}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-4 text-center">Shields are unlocked at 7 and 30 day streaks. They automatically protect your streak if you miss a day.</p>
        </section>

        {/* Badges */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-surface-bright/20">
          <h2 className="text-sm font-bold tracking-widest text-on-surface-variant uppercase mb-4">Milestone Badges</h2>
          <div className="flex items-center justify-center p-8 border border-dashed border-outline-variant/30 rounded-lg text-center text-on-surface-variant text-sm">
             Keep grinding to unlock unique badges.
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};
