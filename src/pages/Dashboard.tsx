import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { LevelCard } from '../components/dashboard/LevelCard';
import { QuestCard } from '../components/dashboard/QuestCard';
import { useHabitStore } from '../store/useHabitStore';
import { useUserStore } from '../store/useUserStore';
import { FAB } from '../components/dashboard/FAB';
import { AddHabitModal } from '../components/dashboard/AddHabitModal';
import { gameEngine } from '../lib/gameEngine';
import { AnimatedText } from '../components/animations/AnimatedText';

export const Dashboard: React.FC = () => {
  const habits = useHabitStore(state => state.habits);
  const loading = useHabitStore(state => state.loading);
  const getTodayCompletedHabits = useHabitStore(state => state.getTodayCompletedHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useUserStore(state => state.user);
  
  const completedIds = getTodayCompletedHabits();

  return (
    <div className="flex flex-col flex-1 relative bg-background min-h-screen">
      <TopBar />
      
      <main className="flex-1 pb-32 px-5 pt-2 space-y-8 relative z-0">
        <LevelCard />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black font-label tracking-[0.2em] text-primary uppercase drop-shadow-sm">
              <AnimatedText text="Daily Quests" />
            </h2>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Resets at midnight</span>
          </div>
          
          <div className="flex flex-col w-full relative z-10">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container h-40 rounded-2xl mb-4 animate-[pulse_1.5s_infinite] opacity-50 border border-outline-variant/10" />
              ))
            ) : (
              habits.length === 0 ? (
                <div className="text-center p-8 bg-surface-container-high border border-outline-variant/30 rounded-2xl text-on-surface-variant text-sm italic font-medium">
                  No quests active. Tap + to begin your journey.
                </div>
              ) : (
                habits.map(habit => (
                  <QuestCard 
                    key={habit.id} 
                    habit={habit} 
                    completed={completedIds.includes(habit.id)} 
                  />
                ))
              )
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 pb-12">
          {/* Static Stats for parity currently, dynamic where possible */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Rank</span>
            <span className="text-lg font-black italic text-primary drop-shadow-sm uppercase">{user ? gameEngine.getUserRank(user.level) : "UNRANKED"}</span>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Win Rate</span>
            <span className="text-lg font-black italic text-on-surface drop-shadow-sm">100%</span>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Missions</span>
            <span className="text-lg font-black italic text-on-surface drop-shadow-sm">{user ? Math.floor(user.xp / 10) : 0}</span>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Shields</span>
            <span className="text-lg font-black italic text-on-surface drop-shadow-sm">{user?.streakShields || 0} / 2</span>
          </div>
        </section>
      </main>

      <FAB onClick={() => setIsModalOpen(true)} />
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <BottomNav />
    </div>
  );
};
