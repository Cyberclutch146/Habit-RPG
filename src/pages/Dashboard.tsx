import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { LevelCard } from '../components/dashboard/LevelCard';
import { QuestCard } from '../components/dashboard/QuestCard';
import { useHabitStore } from '../store/useHabitStore';
import { FAB } from '../components/dashboard/FAB';
import { AddHabitModal } from '../components/dashboard/AddHabitModal';

export const Dashboard: React.FC = () => {
  const habits = useHabitStore(state => state.habits);
  const loading = useHabitStore(state => state.loading);
  const getTodayCompletedHabits = useHabitStore(state => state.getTodayCompletedHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const completedIds = getTodayCompletedHabits();

  return (
    <div className="flex flex-col flex-1 relative">
      <TopBar />
      
      <main className="flex-1 pb-32 px-5 pt-6 space-y-8 relative z-0">
        <LevelCard />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black font-label tracking-[0.2em] text-red-500 uppercase drop-shadow-sm">Daily Quests</h2>
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Resets at midnight</span>
          </div>
          
          <div className="flex flex-col w-full relative z-10">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container-high h-40 rounded-2xl mb-4 animate-pulse opacity-50" />
              ))
            ) : (
              habits.length === 0 ? (
                <div className="text-center p-8 bg-black/40 border border-white/5 rounded-2xl text-neutral-500 text-sm italic">
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
          {/* Static Stats for parity currently, will be dynamic later */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Rank</span>
            <span className="text-xl font-black italic text-red-500 drop-shadow-md">ELITE II</span>
          </div>
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Win Rate</span>
            <span className="text-xl font-black italic text-white drop-shadow-md">68.4%</span>
          </div>
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Missions</span>
            <span className="text-xl font-black italic text-white drop-shadow-md">142</span>
          </div>
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Global</span>
            <span className="text-xl font-black italic text-white drop-shadow-md">#4,212</span>
          </div>
        </section>
      </main>

      <FAB onClick={() => setIsModalOpen(true)} />
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <BottomNav />
    </div>
  );
};
