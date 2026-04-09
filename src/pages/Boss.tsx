import React, { useMemo, useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useHabitStore } from '../store/useHabitStore';
import { useUserStore } from '../store/useUserStore';
import { GlitchText } from '../components/animations/GlitchText';
import { AuroraBackground } from '../components/animations/AuroraBackground';
import { StarBorder } from '../components/animations/StarBorder';
import { DecryptedText } from '../components/animations/DecryptedText';
import { BOSS_ROSTER } from '../lib/gameEngine';

export const Boss: React.FC = () => {
  const logs = useHabitStore(state => state.logs);
  const user = useUserStore(state => state.user);
  const [showRoster, setShowRoster] = useState(false);
  const [previewBossId, setPreviewBossId] = useState<string | null>(null);
  
  // Calculate active boss and full progression
  const { currentBoss, currentBossIndex, bossDamagePercent, activeHp, totalDamage, defeatedCount } = useMemo(() => {
    const totalDmg = logs.reduce((sum, log) => sum + (log.damageDealt || 10), 0);
    
    let cumulativeHp = 0;
    let activeBoss = BOSS_ROSTER[BOSS_ROSTER.length - 1];
    let currentBossStartHp = 0;
    let bossIndex = BOSS_ROSTER.length - 1;
    let deflated = 0;

    for (let i = 0; i < BOSS_ROSTER.length; i++) {
      const boss = BOSS_ROSTER[i];
      if (totalDmg < cumulativeHp + boss.maxHp) {
        activeBoss = boss;
        currentBossStartHp = cumulativeHp;
        bossIndex = i;
        deflated = i;
        break;
      }
      cumulativeHp += boss.maxHp;
    }

    const damageOnCurrentBoss = Math.max(0, totalDmg - currentBossStartHp);
    const progressPercent = Math.min(100, Math.round((damageOnCurrentBoss / activeBoss.maxHp) * 100));
    
    return {
      currentBoss: activeBoss,
      currentBossIndex: bossIndex,
      bossDamagePercent: progressPercent,
      activeHp: damageOnCurrentBoss,
      totalDamage: totalDmg,
      defeatedCount: deflated
    };
  }, [logs]);

  const recentCrits = useMemo(() => {
    return logs.filter(l => l.isCritical).slice(-3);
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
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="bg-primary-container/20 text-primary text-[9px] border border-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                Boss {currentBossIndex + 1} of {BOSS_ROSTER.length}
              </span>
              {defeatedCount > 0 && (
                <span className="bg-amber-500/10 text-amber-500 text-[9px] border border-amber-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                  {defeatedCount} Vanquished
                </span>
              )}
            </div>
            <span className="font-label text-sm tracking-[0.2em] text-primary font-bold uppercase">Epic Encounter</span>
            <div className="flex justify-center w-full">
              <GlitchText text={currentBoss.name} className="text-3xl md:text-5xl font-headline font-black tracking-tighter uppercase text-on-surface" />
            </div>
            <div className="flex items-center justify-center gap-2 text-neutral-500 font-label text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              VULNERABILITY: {currentBoss.weakness.toUpperCase()} (+50% DMG)
              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
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
                  
                  {/* HP badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-red-500/50 px-3 py-1.5 rounded-lg">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Boss HP</p>
                    <p className="text-white font-black text-sm">{Math.max(0, currentBoss.maxHp - activeHp).toLocaleString()} / {currentBoss.maxHp.toLocaleString()}</p>
                  </div>

                  {/* Crit badge */}
                  {recentCrits.length > 0 && (
                    <div className="absolute top-4 right-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 px-3 py-1.5 rounded-lg">
                      <p className="text-yellow-400 text-[9px] font-black uppercase tracking-widest">💥 Crit Hits</p>
                      <p className="text-white font-black text-sm">{recentCrits.length}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="font-label text-xs tracking-widest text-secondary uppercase">HP DELETED: {activeHp.toLocaleString()}/{currentBoss.maxHp.toLocaleString()}</div>
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

          {/* Combat Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-1 hover:bg-surface-container-high transition-colors shadow-lg">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
              <div className="text-xl font-black text-on-surface">{totalDamage.toLocaleString()}</div>
              <div className="font-label text-[9px] tracking-widest text-neutral-500 uppercase">Lifetime DMG</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-1 hover:bg-surface-container-high transition-colors shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-full blur-xl animate-pulse"></div>
              <span className="material-symbols-outlined text-amber-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <div className="text-sm font-black text-on-surface uppercase tracking-tight">{currentBoss.title}</div>
              <div className="font-label text-[9px] tracking-widest text-neutral-500 uppercase">On Defeat</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex flex-col items-center justify-center text-center space-y-1 hover:bg-surface-container-high transition-colors shadow-lg">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <div className="text-xl font-black text-on-surface">{logs.filter(l => l.isCritical).length}</div>
              <div className="font-label text-[9px] tracking-widest text-neutral-500 uppercase">Total Crits</div>
            </div>
          </div>

          {/* Class Bonus Banner */}
          {user?.class && user.class !== 'none' && (
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              (user.class === 'warrior' && currentBoss.weakness === 'Workout') ||
              (user.class === 'mage' && currentBoss.weakness === 'Custom') ||
              (user.class === 'rogue' && currentBoss.weakness === 'Steps')
                ? 'bg-green-900/30 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                : 'bg-surface-container-low border-outline-variant/10'
            }`}>
              <span className="material-symbols-outlined text-2xl text-green-400">military_tech</span>
              <div>
                <p className="font-black text-on-surface uppercase text-xs tracking-widest">
                  {user.class.toUpperCase()} Class Active
                </p>
                <p className="text-[10px] text-secondary mt-0.5">
                  {(user.class === 'warrior' && currentBoss.weakness === 'Workout') ||
                   (user.class === 'mage' && currentBoss.weakness === 'Custom') ||
                   (user.class === 'rogue' && currentBoss.weakness === 'Steps')
                    ? '⚡ CLASS BONUS APPLIES — You deal +50% damage to this boss!'
                    : 'Class bonus does not apply to this boss\'s weakness.'}
                </p>
              </div>
            </div>
          )}

          {/* Boss Roster Preview */}
          <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 shadow-xl">
            <button
              onClick={() => setShowRoster(!showRoster)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-high transition-colors"
            >
              <h2 className="text-sm font-black text-on-surface uppercase tracking-widest flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-primary text-sm">format_list_bulleted</span>
                Boss Gauntlet — {BOSS_ROSTER.length} Enemies
              </h2>
              <span className="material-symbols-outlined text-secondary transition-transform" style={{ transform: showRoster ? 'rotate(180deg)' : 'none' }}>
                expand_more
              </span>
            </button>

            {showRoster && (
              <div className="px-5 pb-5 space-y-2">
                {BOSS_ROSTER.map((boss, idx) => {
                  const isDefeated = idx < currentBossIndex;
                  const isActive = idx === currentBossIndex;
                  const isUpcoming = idx > currentBossIndex;
                  const isPreviewing = previewBossId === boss.id;

                  return (
                    <div key={boss.id} className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          if (!isActive) {
                            setPreviewBossId(isPreviewing ? null : boss.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          isActive
                            ? 'bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(209,54,57,0.15)] cursor-default'
                            : isDefeated
                            ? 'bg-surface-container-lowest border-outline-variant/5 opacity-60 hover:opacity-100 hover:bg-surface-container-low cursor-pointer'
                            : 'bg-surface-container-low border-outline-variant/10 hover:border-outline-variant/30 cursor-pointer'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-xs font-black ${
                          isDefeated ? 'bg-green-900/40 text-green-400' : isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-secondary'
                        }`}>
                          {isDefeated ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className={`font-black text-xs uppercase tracking-tight truncate font-headline ${isActive ? 'text-on-surface' : 'text-secondary'}`}>{boss.name}</p>
                          <p className="text-[9px] text-outline font-mono uppercase tracking-widest truncate">
                            {boss.maxHp.toLocaleString()} HP · Weak to {boss.weakness}
                          </p>
                        </div>
                        {isActive && (
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse shrink-0">FIGHTING</span>
                        )}
                        {isDefeated && !isPreviewing && (
                          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest shrink-0">SLAIN</span>
                        )}
                        {!isActive && !isDefeated && !isPreviewing && (
                          <span className="material-symbols-outlined text-secondary text-sm shrink-0">visibility</span>
                        )}
                        {isPreviewing && (
                          <span className="material-symbols-outlined text-primary text-sm shrink-0">visibility_off</span>
                        )}
                      </button>
                      
                      {/* Preview Panel */}
                      {isPreviewing && (
                        <div className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-2 animate-in slide-in-from-top-2 fade-in duration-200">
                           <div className="aspect-[21/9] relative rounded-md overflow-hidden bg-black flex items-center justify-center group/preview">
                             <img 
                               src={boss.imagePath} 
                               alt={boss.name}
                               className={`w-full h-full object-cover transition-all duration-1000 ${isUpcoming ? "grayscale opacity-30 group-hover/preview:opacity-60 blur-sm group-hover/preview:blur-0" : "opacity-80"}`}
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                               <p className="text-white font-headline text-lg uppercase font-black tracking-tight">{boss.name}</p>
                               <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/20 self-start px-2 py-0.5 rounded border border-primary/30 mt-1">
                                 {boss.title}
                               </span>
                             </div>
                             {isUpcoming && <div className="absolute inset-0 flex items-center justify-center font-headline text-white/40 tracking-[0.3em] font-black uppercase text-xl rotate-[-5deg] mix-blend-overlay">UNDISCOVERED</div>}
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <BottomNav />
    </>
  );
};
