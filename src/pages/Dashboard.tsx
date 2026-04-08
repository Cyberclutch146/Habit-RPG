import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { LevelCard } from '../components/dashboard/LevelCard';
import { QuestCard } from '../components/dashboard/QuestCard';
import { useHabitStore } from '../store/useHabitStore';

export const Dashboard: React.FC = () => {
  const habits = useHabitStore(state => state.habits);
  const loading = useHabitStore(state => state.loading);
  const getTodayCompletedHabits = useHabitStore(state => state.getTodayCompletedHabits);
  
  const completedIds = getTodayCompletedHabits();

  return (
    <>
      <TopBar />
      
      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-8">
        <LevelCard />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black font-label tracking-[0.2em] text-red-500 uppercase">Daily Quests</h2>
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Resets at midnight</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container-high h-40 rounded-lg animate-pulse" />
              ))
            ) : (
              habits.length === 0 ? (
                <div className="col-span-3 text-center p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-neutral-500 text-sm">
                  No habits assigned for today. Add some to get started!
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

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Static Stats for parity currently, will be dynamic later */}
          <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Rank</span>
            <span className="text-xl font-black italic text-red-500">ELITE II</span>
          </div>
          <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Win Rate</span>
            <span className="text-xl font-black italic text-on-surface">68.4%</span>
          </div>
          <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Missions</span>
            <span className="text-xl font-black italic text-on-surface">142</span>
          </div>
          <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold font-label text-neutral-500 uppercase tracking-widest mb-1">Global</span>
            <span className="text-xl font-black italic text-on-surface">#4,212</span>
          </div>
        </section>

      </main>

      <BottomNav />
    </>
  );
};
