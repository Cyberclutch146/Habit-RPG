import React, { useState } from 'react';
import { Habit } from '../../lib/db';
import { useHabitStore } from '../../store/useHabitStore';
import { m } from 'framer-motion';
import { SpotlightCard } from '../animations/SpotlightCard';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface Props {
  habit: Habit;
  completed: boolean;
  onEdit?: () => void;
}

export const QuestCard: React.FC<Props> = ({ habit, completed, onEdit }) => {
  const completeHabit = useHabitStore(state => state.completeHabit);
  const deleteHabit = useHabitStore(state => state.deleteHabit);
  const [isClicking, setIsClicking] = useState(false);
  const { playSuccess, playLevelUp, playLootDrop } = useSoundEffects();

  const getIcon = (type: string, isNeg?: boolean) => {
    if (isNeg) return "skull";
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
    const result = await completeHabit(habit.id, { clientX: e.clientX, clientY: e.clientY });
    if (result) {
        if (result.didLevelUp) playLevelUp();
        else if (result.droppedLoot) playLootDrop();
        else playSuccess();
    }
    setIsClicking(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to abandon this quest?")) {
      await deleteHabit(habit.id);
    }
  };

  return (
    <SpotlightCard className="mb-4 rounded-2xl">
      <m.div 
        layout
        className={`group relative overflow-hidden rounded-2xl p-5 transition-colors duration-500 border ${
          completed 
            ? "bg-surface-container border-outline/10 opacity-60" 
            : habit.isNegative
              ? "bg-red-950/30 border-red-500/30 hover:border-red-500/60 shadow-lg shadow-red-500/10"
              : "bg-surface-container-high border-outline-variant/30 hover:border-primary/50 shadow-lg shadow-surface-dim/20"
        }`}
      >
      {/* Premium Spotlight / Glow internal effect */}
      {!completed && (
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[40px] transition-all duration-700 pointer-events-none ${habit.isNegative ? 'bg-red-500/20 group-hover:bg-red-500/30' : 'bg-primary/20 group-hover:bg-primary/30'}`} />
      )}

      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl transition-colors duration-500 ${completed ? "bg-secondary-container text-on-secondary-container" : habit.isNegative ? "bg-red-500/20 text-red-400 group-hover:bg-red-500/30" : "bg-primary-container/20 text-primary group-hover:bg-primary-container/30"}`}>
          <span className="material-symbols-outlined text-[24px]">
            {getIcon(habit.type, habit.isNegative)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!completed && (
            <div className="flex bg-surface-container opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded overflow-hidden shadow-sm border border-outline-variant/20">
              {onEdit && (
                <button onClick={onEdit} className="p-1 hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              )}
              <button onClick={handleDelete} className="p-1 hover:bg-rose-500/20 text-on-surface-variant hover:text-rose-500 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          )}
          <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded border transition-colors duration-500 ${completed ? "bg-surface-container-highest text-on-surface-variant border-outline-variant/20" : habit.isNegative ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-inverse-surface text-inverse-on-surface shadow-sm border-outline-variant/20"}`}>
            {habit.isNegative ? `−${habit.difficulty === 'Hard' ? 30 : habit.difficulty === 'Medium' ? 15 : 5} HP` : `+${habit.xpReward} XP`}
          </span>
        </div>
      </div>
      
      <div className="relative z-10">
        <m.h3 layout="position" className={`font-bold text-lg mb-1 leading-tight tracking-tight mt-2 transition-colors duration-500 ${completed ? "text-on-surface-variant line-through decoration-outline/50" : "text-on-surface group-hover:text-primary"}`}>
          {habit.title}
        </m.h3>
        <p className="text-[10px] text-on-surface-variant mb-4 font-bold tracking-widest uppercase">{habit.difficulty}</p>
        
        <div className="flex items-center justify-between gap-3 bg-surface-container-lowest p-1.5 rounded-full border border-outline-variant/10">
          <div className="flex items-center w-full px-2">
			      <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${completed ? "text-primary" : "text-on-surface-variant"}`}>
              {completed ? "Done" : "Todo"}
            </span>
          </div>
          <button
            onClick={handleComplete}
            disabled={completed || isClicking}
            className={`flex items-center shrink-0 gap-1 px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest transition-colors active:scale-95 duration-150 ${completed ? "bg-primary/20 text-primary cursor-auto" : habit.isNegative ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)]" : "bg-primary text-on-primary hover:bg-primary-container shadow-[0_4px_12px_rgba(var(--color-primary),0.3)]"}`}
          >
            {completed ? "Logged" : habit.isNegative ? "Confess" : "Complete Quest"}
            <span className="material-symbols-outlined text-[14px]">{habit.isNegative ? 'warning' : 'done'}</span>
          </button>
        </div>
      </div>
    </m.div>
    </SpotlightCard>
  );
};
