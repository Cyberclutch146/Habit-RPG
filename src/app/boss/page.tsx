"use client";
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useUserStore } from '../../store/useUserStore';
import { BOSS_ROSTER } from '../../lib/gameEngine';
import { m } from 'framer-motion';

export default function BossPage() {
  const user = useUserStore(state => state.user);
  const userLoading = useUserStore(state => state.loading);
  const authInitialized = useAuthStore(state => state.initialized);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const logs = useHabitStore(state => state.logs);
  const [expandedBossId, setExpandedBossId] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && authInitialized && !userLoading && !user) {
      router.push('/login');
    }
  }, [mounted, user, authInitialized, userLoading, router]);

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

  if (!mounted || !authInitialized || userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) return null;

  const bossHpRemaining = Math.max(0, currentBoss.maxHp - activeHp);
  const classBonus = (user.class === 'warrior' && currentBoss.weakness === 'Workout') ||
    (user.class === 'mage' && currentBoss.weakness === 'Custom') ||
    (user.class === 'rogue' && currentBoss.weakness === 'Steps');

  return (
    <div className="boss-page">
      {/* Ambient glow behind boss art */}
      <div className="boss-ambient-glow" />

      <div className="boss-container">

        {/* ── Active Boss Hero Section ── */}
        <section className="boss-hero">
          {/* Boss image with cinematic overlay */}
          <div className="boss-hero-art">
            <img 
              src={currentBoss.imagePath} 
              alt={currentBoss.name}
              className="boss-hero-img"
            />
            <div className="boss-hero-gradient" />
            
            {/* Boss identity overlay */}
            <div className="boss-hero-identity">
              <div className="boss-hero-tags">
                <span className="boss-tag boss-tag-encounter">
                  Encounter {currentBossIndex + 1}/{BOSS_ROSTER.length}
                </span>
                {defeatedCount > 0 && (
                  <span className="boss-tag boss-tag-vanquished">
                    <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {defeatedCount} Slain
                  </span>
                )}
              </div>
              <h1 className="boss-hero-name">{currentBoss.name}</h1>
              <p className="boss-hero-weakness">
                <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
                Weak to {currentBoss.weakness}
                {classBonus && <span className="boss-hero-bonus"> · CLASS BONUS ACTIVE</span>}
              </p>
            </div>

            {/* Boss HP overlay — top right */}
            <div className="boss-hero-hp-badge">
              <span className="boss-hp-label">HP</span>
              <span className="boss-hp-value">{bossHpRemaining.toLocaleString()}</span>
              <span className="boss-hp-max">/ {currentBoss.maxHp.toLocaleString()}</span>
            </div>
          </div>

          {/* HP Bar below image */}
          <div className="boss-hp-section">
            <div className="boss-hp-bar-track">
              <m.div 
                initial={{ width: 0 }}
                animate={{ width: `${bossDamagePercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="boss-hp-bar-fill"
              />
            </div>
            <div className="boss-hp-bar-meta">
              <span className="boss-hp-dmg-dealt">{activeHp.toLocaleString()} damage dealt</span>
              <span className="boss-hp-percent">{bossDamagePercent}%</span>
            </div>
          </div>
        </section>

        {/* ── Combat Stats Row ── */}
        <section className="boss-stats-row">
          <div className="boss-stat-card">
            <div className="boss-stat-icon-wrap boss-stat-icon-dmg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
            </div>
            <div className="boss-stat-data">
              <span className="boss-stat-number">{totalDamage.toLocaleString()}</span>
              <span className="boss-stat-label">Lifetime DMG</span>
            </div>
          </div>
          
          <div className="boss-stat-card">
            <div className="boss-stat-icon-wrap boss-stat-icon-crit">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div className="boss-stat-data">
              <span className="boss-stat-number">{logs.filter(l => l.isCritical).length}</span>
              <span className="boss-stat-label">Critical Hits</span>
            </div>
          </div>

          <div className="boss-stat-card boss-stat-reward">
            <div className="boss-stat-icon-wrap boss-stat-icon-reward">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div className="boss-stat-data">
              <span className="boss-stat-reward-title">{currentBoss.title}</span>
              <span className="boss-stat-label">On Defeat</span>
            </div>
          </div>
        </section>

        {/* ── Class Synergy Banner ── */}
        {user?.class && user.class !== 'none' && (
          <section className={`boss-class-banner ${classBonus ? 'boss-class-synergy' : ''}`}>
            <div className={`boss-class-icon ${classBonus ? 'boss-class-icon-active' : ''}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <div>
              <p className="boss-class-name">{user.class.toUpperCase()} CLASS</p>
              <p className="boss-class-desc">
                {classBonus
                  ? 'Your class exploits this boss\'s weakness — +50% damage bonus applied!'
                  : 'Class bonus does not apply to this boss\'s weakness.'}
              </p>
            </div>
            {classBonus && (
              <div className="boss-class-badge">+50%</div>
            )}
          </section>
        )}

        {/* ── Boss Gauntlet List ── */}
        <section className="boss-gauntlet">
          <h2 className="boss-gauntlet-title">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>format_list_bulleted</span>
            Boss Gauntlet
            <span className="boss-gauntlet-count">{BOSS_ROSTER.length}</span>
          </h2>
          
          <div className="boss-gauntlet-list">
            {BOSS_ROSTER.map((boss, idx) => {
              const isDefeated = idx < currentBossIndex;
              const isActive = idx === currentBossIndex;
              const isUpcoming = idx > currentBossIndex;
              const isExpanded = expandedBossId === boss.id;

              return (
                <div key={boss.id} className="boss-gauntlet-entry">
                  <button
                    onClick={() => !isActive && setExpandedBossId(isExpanded ? null : boss.id)}
                    className={`boss-gauntlet-row ${isActive ? 'boss-row-active' : ''} ${isDefeated ? 'boss-row-defeated' : ''} ${isUpcoming ? 'boss-row-upcoming' : ''}`}
                  >
                    <div className={`boss-row-index ${isDefeated ? 'boss-idx-defeated' : ''} ${isActive ? 'boss-idx-active' : ''}`}>
                      {isDefeated ? (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    
                    <div className="boss-row-info">
                      <span className="boss-row-name">{boss.name}</span>
                      <span className="boss-row-meta">{boss.maxHp.toLocaleString()} HP · {boss.weakness}</span>
                    </div>

                    {isActive && (
                      <span className="boss-row-badge boss-badge-fighting">
                        <span className="boss-badge-dot" />
                        Fighting
                      </span>
                    )}
                    {isDefeated && (
                      <span className="boss-row-badge boss-badge-slain">Slain</span>
                    )}
                    {isUpcoming && (
                      <span className="material-symbols-outlined boss-row-peek">visibility</span>
                    )}
                  </button>
                  
                  {/* Expanded Preview */}
                  {isExpanded && !isActive && (
                    <div className="boss-preview-panel">
                      <div className="boss-preview-art">
                        <img 
                          src={boss.imagePath} 
                          alt={boss.name}
                          className={`boss-preview-img ${isUpcoming ? 'boss-preview-locked' : ''}`}
                        />
                        <div className="boss-preview-overlay">
                          <p className="boss-preview-name">{boss.name}</p>
                          <p className="boss-preview-title">{boss.title}</p>
                        </div>
                        {isUpcoming && <div className="boss-preview-lock-text">UNDISCOVERED</div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
