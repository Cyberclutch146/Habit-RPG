import React, { useState } from 'react';
import { Habit } from '../../lib/db';
import { useHabitStore } from '../../store/useHabitStore';
import { m } from 'framer-motion';

interface Props {
  habit: Habit;
  completed: boolean;
}

export const QuestCard: React.FC<Props> = ({ habit, completed }) => {
  const completeHabit = useHabitStore(state => state.completeHabit);
  const [isClicking, setIsClicking] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "Workout": return "fitness_center";
      case "Diet": return "restaurant";
      case "Steps": return "footprint";
      default: return "star";
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    if (completed || isClicking) return;
    setIsClicking(true);
    await completeHabit(habit.id, { clientX: e.clientX, clientY: e.clientY });
    setIsClicking(false);
  };

  return (
    <m.div 
      onClick={handleComplete}
      layout
      whileTap={!completed ? { scale: 0.96, rotate: -1 } : {}}
      className={`group relative overflow-hidden rounded-2xl p-5 mb-4 border transition-colors duration-500 ${
        completed 
          ? "bg-surface-container border-outline/10 opacity-60 cursor-default" 
          : "bg-surface-container-high border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-lg shadow-surface-dim/20"
      }`}
    >
      {/* Premium Spotlight / Glow internal effect */}
      {!completed && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
      )}

      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl transition-colors duration-500 ${completed ? "bg-secondary-container text-on-secondary-container" : "bg-primary-container/20 text-primary group-hover:bg-primary-container/30"}`}>
          <span className="material-symbols-outlined text-[24px]">
            {getIcon(habit.type)}
          </span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded border transition-colors duration-500 ${completed ? "bg-surface-container-highest text-on-surface-variant border-outline-variant/20" : "bg-inverse-surface text-inverse-on-surface shadow-sm border-outline-variant/20"}`}>
          +{habit.xpReward} XP
        </span>
      </div>
      
      <div className="relative z-10">
        <m.h3 layout="position" className={`font-bold text-lg mb-1 leading-tight tracking-tight transition-colors duration-500 ${completed ? "text-on-surface-variant line-through decoration-outline/50" : "text-on-surface group-hover:text-primary"}`}>
          {habit.title}
        </m.h3>
        <p className="text-[10px] text-on-surface-variant mb-5 font-bold tracking-widest uppercase">{habit.difficulty}</p>
        
        <div className="flex items-center gap-3 bg-surface-container-lowest p-1.5 rounded-full border border-outline-variant/10">
          <div className="flex-grow h-[4px] bg-surface-container-highest rounded-full overflow-hidden ml-1 relative">
            <m.div 
              initial={false}
              animate={{ width: completed ? "100%" : "0%" }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_12px_rgba(var(--color-primary),0.8)]" 
            />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 transition-colors duration-500 ${completed ? "text-primary" : "text-on-surface-variant"}`}>
            {completed ? "Done" : "Todo"}
          </span>
        </div>
      </div>
    </m.div>
  );
};
