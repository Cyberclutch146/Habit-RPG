import React, { useState } from 'react';
import { Habit } from '../../lib/db';
import { useHabitStore } from '../../store/useHabitStore';

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

  const handleComplete = async () => {
    if (completed || isClicking) return;
    setIsClicking(true);
    await completeHabit(habit.id);
    setIsClicking(false);
  };

  return (
    <div 
      onClick={handleComplete}
      className={`group bg-surface-container-high rounded-lg p-5 border-l-4 transition-all ${completed ? "border-green-600 opacity-60 cursor-default" : "border-red-600 hover:bg-surface-bright cursor-pointer active:scale-95"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined text-3xl ${completed ? "text-green-500" : "text-red-500"}`}>
          {getIcon(habit.type)}
        </span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${completed ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
          +{habit.xpReward} XP
        </span>
      </div>
      <h3 className={`font-bold text-lg mb-1 transition-colors ${completed ? "text-green-500" : "group-hover:text-red-400"}`}>
        {habit.title}
      </h3>
      <p className="text-xs text-secondary mb-4 line-clamp-2">{habit.difficulty} difficulty</p>
      
      <div className="flex items-center gap-3">
        <div className="flex-grow h-1.5 bg-neutral-900 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${completed ? "bg-green-600 w-full" : "bg-red-600 w-0"}`} 
          />
        </div>
        <span className={`text-[10px] font-bold uppercase ${completed ? "text-green-500" : "text-neutral-500"}`}>
          {completed ? "Done" : "Ready"}
        </span>
      </div>
    </div>
  );
};
