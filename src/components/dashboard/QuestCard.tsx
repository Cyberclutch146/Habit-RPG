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
      className={`group relative overflow-hidden rounded-2xl p-5 mb-4 transition-all duration-300 transform ${
        completed 
          ? "bg-neutral-900 border border-green-500/20 opacity-70 cursor-default shadow-none" 
          : "bg-gradient-to-br from-neutral-900 to-neutral-950 border border-red-900/30 hover:border-red-500/50 hover:shadow-[0_8px_30px_rgba(220,38,38,0.15)] cursor-pointer active:scale-[0.98] shadow-lg"
      }`}
    >
      {/* Decorative background glow for incomplete state */}
      {!completed && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
      )}

      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl backdrop-blur-md ${completed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors"}`}>
          <span className="material-symbols-outlined text-2xl drop-shadow-md">
            {getIcon(habit.type)}
          </span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded bg-black/40 border ${completed ? "text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)] border-green-500/20" : "text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)] border-amber-500/20"}`}>
          +{habit.xpReward} XP
        </span>
      </div>
      
      <div className="relative z-10">
        <h3 className={`font-bold text-lg mb-1 leading-tight tracking-wide transition-colors ${completed ? "text-green-500" : "text-white group-hover:text-red-50"}`}>
          {habit.title}
        </h3>
        <p className="text-xs text-neutral-400 mb-5 font-medium tracking-wide uppercase">{habit.difficulty}</p>
        
        <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-full border border-white/5">
          <div className="flex-grow h-1.5 bg-black/50 rounded-full overflow-hidden ml-1 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${completed ? "bg-gradient-to-r from-green-600 to-green-400 w-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" : "bg-gradient-to-r from-red-600 to-red-400 w-0"}`} 
            />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 ${completed ? "text-green-400" : "text-neutral-500"}`}>
            {completed ? "Done" : "Todo"}
          </span>
        </div>
      </div>
    </div>
  );
};
