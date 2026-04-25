"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useHabitStore } from '../../store/useHabitStore';
import { gameEngine } from '../../lib/gameEngine';
import { m, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ClassSelector } from '../../components/rpg/ClassSelector';
import { MorningReport } from '../../components/rpg/MorningReport';
import { HabitModal } from '../../components/dashboard/HabitModal';
import { QuestCard } from '../../components/dashboard/QuestCard';
import { Habit } from '../../lib/db';
import { useMissionStore } from '../../store/useMissionStore';

export default function Dashboard() {
  const user = useUserStore(state => state.user);
  const userLoading = useUserStore(state => state.loading);
  const authInitialized = useAuthStore(state => state.initialized);
  const habits = useHabitStore(state => state.habits);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'active'|'completed'>('active');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayCompleted = useHabitStore(state => state.getTodayCompletedHabits());
  const auditDailyProgress = useHabitStore(state => state.auditDailyProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && authInitialized && !userLoading && !user) {
      router.push('/login');
    }
  }, [mounted, user, authInitialized, userLoading, router]);

  useEffect(() => {
    if (user && mounted) {
      auditDailyProgress();
    }
  }, [user, mounted, auditDailyProgress]);

  const { openBoard: openMissionBoard, missions, refreshMissions } = useMissionStore();
  const claimableMissions = missions.filter(m => m.status === 'claimable').length;
  const activeMissionCount = missions.filter(m => m.status === 'active').length;

  useEffect(() => {
    if (user && mounted) refreshMissions();
  }, [user, mounted, habits.length]);

  if (!mounted || !authInitialized || userLoading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    );
  }
  
  if (!user) return null;

  const activeQuests = habits.filter(h => !todayCompleted.includes(h.id));
  const completedQuests = habits.filter(h => todayCompleted.includes(h.id));
  const totalQuests = habits.length;
  const completedCount = completedQuests.length;
  const progressPercent = totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;
  const xpPercent = Math.min((user.xp / gameEngine.getXPForNextLevel(user.level)) * 100, 100);

  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dash-page">
      <ClassSelector />
      <MorningReport />
      <HabitModal 
        isOpen={isHabitModalOpen} 
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }} 
        editingHabit={editingHabit}
      />

      <div className="dash-container">

        {/* ── Hero Greeting ── */}
        <section className="dash-hero">
          <div className="dash-hero-left">
            <div className="dash-avatar-wrap">
              <span className="material-symbols-outlined dash-avatar-icon" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <div className="dash-avatar-level">Lv.{user.level}</div>
            </div>
            <div className="dash-hero-text">
              <p className="dash-greeting">{greetingText()},</p>
              <h1 className="dash-hero-name">{user.name}</h1>
            </div>
          </div>
          <div className="dash-hero-stats">
            <div className="dash-hero-stat">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#f43f5e', fontSize: '18px' }}>local_fire_department</span>
              <div>
                <span className="dash-hero-stat-val">{user.streak}</span>
                <span className="dash-hero-stat-label">day streak</span>
              </div>
            </div>
            <div className="dash-hero-divider" />
            <div className="dash-hero-stat">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#f59e0b', fontSize: '18px' }}>monetization_on</span>
              <div>
                <span className="dash-hero-stat-val">{user.gold.toLocaleString()}</span>
                <span className="dash-hero-stat-label">gold</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── XP Progress ── */}
        <div className="dash-xp-row">
          <div className="dash-xp-info">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981', fontSize: '16px' }}>star</span>
            <span className="dash-xp-text">{user.xp} / {gameEngine.getXPForNextLevel(user.level)} XP</span>
          </div>
          <div className="dash-xp-track">
            <m.div 
              className="dash-xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── Mission Board Banner ── */}
        <m.button 
          className="dash-mission-banner"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={openMissionBoard}
        >
          <div className="dash-mission-glow" />
          <div className="dash-mission-left">
            <div className="dash-mission-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>assignment</span>
            </div>
            <div>
              <span className="dash-mission-title">Mission Board</span>
              <span className="dash-mission-sub">
                {claimableMissions > 0 
                  ? <span className="dash-mission-claim">{claimableMissions} reward{claimableMissions > 1 ? 's' : ''} ready!</span>
                  : `${activeMissionCount} active mission${activeMissionCount !== 1 ? 's' : ''}`
                }
              </span>
            </div>
          </div>
          <div className="dash-mission-right">
            {claimableMissions > 0 && <span className="dash-mission-pulse" />}
            <span className="material-symbols-outlined dash-mission-chevron">chevron_right</span>
          </div>
        </m.button>

        {/* ── Main Content Grid ── */}
        <div className="dash-grid">
          
          {/* Left: Quest Feed */}
          <div className="dash-quest-feed">
            {/* Toggle + Progress header */}
            <div className="dash-feed-header">
              <div className="dash-toggle">
                <button 
                  onClick={() => setViewMode('active')}
                  className={`dash-toggle-btn ${viewMode === 'active' ? 'dash-toggle-active' : ''}`}
                >
                  Active ({activeQuests.length})
                </button>
                <button 
                  onClick={() => setViewMode('completed')}
                  className={`dash-toggle-btn ${viewMode === 'completed' ? 'dash-toggle-active' : ''}`}
                >
                  Done ({completedCount})
                </button>
              </div>
              {totalQuests > 0 && (
                <span className="dash-feed-progress">{progressPercent}%</span>
              )}
            </div>

            {/* Quest list */}
            <div className="dash-quest-list">
              <AnimatePresence mode="popLayout">
                {viewMode === 'active' && activeQuests.length === 0 && habits.length > 0 && (
                  <m.div 
                    key="all-done"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="dash-empty-state"
                  >
                    <span className="material-symbols-outlined dash-empty-icon" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                    <h3 className="dash-empty-title">All Clear!</h3>
                    <p className="dash-empty-desc">Every quest conquered today. Rest up, champion.</p>
                  </m.div>
                )}

                {viewMode === 'active' && habits.length === 0 && (
                  <m.div 
                    key="no-habits"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="dash-empty-state dash-empty-hero"
                  >
                    <div className="dash-empty-icon-stack">
                      <div className="dash-empty-icon-main">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '36px' }}>rocket_launch</span>
                      </div>
                      <div className="dash-empty-icon-badge">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>star</span>
                      </div>
                    </div>
                    <h3 className="dash-empty-title">Begin Your Quest!</h3>
                    <p className="dash-empty-desc">Every legendary journey starts with a single step. Create your first habit to start earning XP.</p>
                    <button
                      onClick={() => { setEditingHabit(null); setIsHabitModalOpen(true); }}
                      className="dash-empty-cta"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                      Create First Habit
                    </button>
                  </m.div>
                )}

                {viewMode === 'completed' && completedQuests.length === 0 && (
                  <m.div
                    key="no-completed" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="dash-empty-state"
                  >
                    <span className="material-symbols-outlined dash-empty-icon">history</span>
                    <h3 className="dash-empty-title">No conquests yet</h3>
                    <p className="dash-empty-desc">Complete some quests to see them here.</p>
                  </m.div>
                )}

                {viewMode === 'active' && activeQuests.map(quest => (
                  <m.div
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <QuestCard 
                      habit={quest} 
                      completed={false} 
                      onEdit={() => {
                        setEditingHabit(quest);
                        setIsHabitModalOpen(true);
                      }}
                    />
                  </m.div>
                ))}

                {viewMode === 'completed' && completedQuests.map(quest => (
                  <m.div
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <QuestCard 
                      habit={quest} 
                      completed={true} 
                      onEdit={() => {
                        setEditingHabit(quest);
                        setIsHabitModalOpen(true);
                      }}
                    />
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Sidebar widgets */}
          <div className="dash-sidebar">
            {/* Daily Progress Ring */}
            <div className="dash-progress-card">
              <span className="dash-card-label">Today's Progress</span>
              <div className="dash-ring-wrap">
                <svg viewBox="0 0 100 100" className="dash-ring-svg">
                  <circle className="dash-ring-bg" cx="50" cy="50" r="42" />
                  <m.circle 
                    className="dash-ring-fill"
                    cx="50" cy="50" r="42"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * progressPercent / 100) }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="dash-ring-center">
                  <span className="dash-ring-value">{progressPercent}</span>
                  <span className="dash-ring-percent">%</span>
                </div>
              </div>
              <div className="dash-ring-meta">
                <span>{completedCount}/{totalQuests} quests</span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="dash-streak-card">
              <div className="dash-streak-glow" />
              <span className="dash-card-label dash-streak-label">Current Streak</span>
              <div className="dash-streak-value-row">
                <span className="dash-streak-number">{user.streak}</span>
                <span className="dash-streak-unit">Days</span>
              </div>
              <p className="dash-streak-flavor">
                {user.streak === 0 
                  ? 'Start your streak today!' 
                  : user.streak < 7 
                    ? 'Building momentum...' 
                    : 'Unstoppable! Keep it going!'}
              </p>
            </div>

            {/* Quick Class Info */}
            {user.class && user.class !== 'none' && (
              <div className="dash-class-card">
                <div className="dash-class-icon">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>
                    {user.class === 'warrior' ? 'shield' : user.class === 'mage' ? 'auto_fix_high' : 'stealth'}
                  </span>
                </div>
                <div>
                  <span className="dash-class-name">{user.class.charAt(0).toUpperCase() + user.class.slice(1)}</span>
                  <span className="dash-class-bonus">+50% bonus damage</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="dash-fab-wrap">
        <m.button 
          onClick={() => { setEditingHabit(null); setIsHabitModalOpen(true); }}
          className="dash-fab"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.92 }}
        >
          <span className="material-symbols-outlined dash-fab-icon">add</span>
        </m.button>
      </div>
    </div>
  );
}
