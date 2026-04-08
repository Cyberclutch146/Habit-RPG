import React, { useMemo } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useHabitStore } from '../store/useHabitStore';
import { GlitchText } from '../components/animations/GlitchText';
import { AuroraBackground } from '../components/animations/AuroraBackground';
import { StarBorder } from '../components/animations/StarBorder';
import { DecryptedText } from '../components/animations/DecryptedText';
import { BOSS_ROSTER } from '../lib/gameEngine';

export const Boss: React.FC = () => {
  const logs = useHabitStore(state => state.logs);
  
  // Calculate active boss based on total damage across all habits completed
  const { currentBoss, bossDamagePercent, activeHp, totalDamage } = useMemo(() => {
    const totalDmg = logs.reduce((sum, log) => sum + (log.damageDealt || 10), 0);
    
    let cumulativeHp = 0;
    let activeBoss = BOSS_ROSTER[BOSS_ROSTER.length - 1]; // Default to last
    let currentBossStartHp = 0;

    for (const boss of BOSS_ROSTER) {
      if (totalDmg < cumulativeHp + boss.maxHp) {
        activeBoss = boss;
        currentBossStartHp = cumulativeHp;
        break;
      }
      cumulativeHp += boss.maxHp;
    }

    const damageOnCurrentBoss = Math.max(0, totalDmg - currentBossStartHp);
    const progressPercent = Math.min(100, Math.round((damageOnCurrentBoss / activeBoss.maxHp) * 100));
    
    return {
      currentBoss: activeBoss,
      bossDamagePercent: progressPercent,
      activeHp: damageOnCurrentBoss,
      totalDamage: totalDmg
    };
  }, [logs]);

  return (
    <>
      <TopBar />
      
      <main className="flex-grow pt-24 pb-32 px-6 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 z-0">
          <AuroraBackground />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10 w-full">
          
          {/* Boss Identity Header */}
          <div className="text-center space-y-2">
            <span className="font-label text-sm tracking-[0.2em] text-primary font-bold uppercase">Epic Encounter</span>
            <div className="flex justify-center w-full">
              <GlitchText text={currentBoss.name} className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase text-on-surface" />
            </div>
            <div className="flex items-center justify-center gap-2 text-neutral-500 font-label text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
              VULNERABILITY: {currentBoss.weakness.toUpperCase()} (+50% DMG)
              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
            </div>
          </div>

          {/* Kinetic Boss Card */}
          <div className="relative group w-full flex justify-center">
            <div className="absolute inset-0 bg-primary-container/20 blur-xl group-hover:bg-primary-container/30 transition-all duration-500 rounded-xl" />
            <StarBorder speed="3s" color={currentBoss.themeColor} className="w-full">
              <div className="relative bg-surface-container-high rounded-xl overflow-hidden shadow-[0_0_60px_rgba(209,54,57,0.2)] w-full">
                <div className="aspect-[16/9] md:aspect-[21/9] relative">
                  <img 
                    alt={currentBoss.name} 
                    className="w-full h-full object-cover scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" 
                    src={currentBoss.imagePath}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent"></div>
                  <div className="absolute inset-0 border-[4px] border-primary/20 opacity-40 mix-blend-overlay"></div>
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="font-label text-xs tracking-widest text-secondary uppercase">HP DELETED: {activeHp}/{currentBoss.maxHp}</div>
                      <div className="text-2xl font-black italic text-primary-container font-headline">
                        <DecryptedText text={`${bossDamagePercent}%`} speed={80} />
                      </div>
                    </div>
                  <div className="h-4 w-full bg-surface-container-lowest rounded-full p-1 shadow-inner overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full relative transition-all duration-1000" style={{ width: `${bossDamagePercent}%` }}>
                      <div className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-sm animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </StarBorder>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-surface-container-high transition-colors shadow-lg">
              <span className="material-symbols-outlined text-primary text-4xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
              <div>
                <div className="text-2xl font-black text-on-surface">{totalDamage}</div>
                <div className="font-label text-[10px] tracking-widest text-neutral-500 uppercase">Lifetime Damage</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-2 hover:bg-surface-container-high transition-colors shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl animate-pulse"></div>
              <span className="material-symbols-outlined text-amber-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <div>
                <div className="text-sm font-black text-on-surface uppercase tracking-tight">{currentBoss.title}</div>
                <div className="font-label text-[10px] tracking-widest text-neutral-500 uppercase">Defeat To Unlock</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </>
  );
};
