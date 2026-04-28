import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHabitStore } from '../../store/useHabitStore';
import { Habit } from '../../lib/db';
import { m, AnimatePresence } from 'framer-motion';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, editingHabit }) => {
  const addHabit = useHabitStore(state => state.addHabit);
  const updateHabit = useHabitStore(state => state.updateHabit);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Habit['type']>('Workout');
  const [difficulty, setDifficulty] = useState<Habit['difficulty']>('Medium');
  const [isNegative, setIsNegative] = useState(false);

  React.useEffect(() => {
    if (editingHabit && isOpen) {
      setTitle(editingHabit.title);
      setType(editingHabit.type);
      setDifficulty(editingHabit.difficulty);
      setIsNegative(editingHabit.isNegative || false);
    } else if (isOpen) {
      setTitle('');
      setType('Workout');
      setDifficulty('Medium');
      setIsNegative(false);
    }
  }, [editingHabit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let xpReward = 10;
    if (difficulty === 'Medium') xpReward = 25;
    if (difficulty === 'Hard') xpReward = 50;

    if (editingHabit) {
      await updateHabit(editingHabit.id, {
        title: title.trim(),
        type,
        difficulty,
        xpReward,
        isNegative
      });
    } else {
      await addHabit({
        title: title.trim(),
        type,
        difficulty,
        xpReward,
        isNegative
      });
    }
    
    onClose();
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" 
            onClick={onClose}
          />
          
          {/* Bottom Sheet Modal */}
          <m.div 
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-surface-container rounded-t-3xl sm:rounded-3xl pointer-events-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t sm:border border-outline-variant/20 p-6 pb-12 sm:pb-6"
          >
            {/* iOS-style grabber */}
            <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6 sm:hidden" />

            <h2 className="text-2xl font-black text-on-surface mb-6 tracking-tight">
              {editingHabit ? 'Update Quest' : 'New Quest'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Quest Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 100 Pushups" 
                  className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-colors placeholder:text-on-surface-variant/50"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Category</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 appearance-none transition-colors"
                  >
                    <option value="Workout">Workout</option>
                    <option value="Diet">Diet</option>
                    <option value="Steps">Steps</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Difficulty</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 appearance-none transition-colors"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Negative Habit Toggle */}
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isNegative ? 'bg-red-500/10 border-red-500/40' : 'bg-surface-container-highest border-outline-variant/30'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${isNegative ? 'text-red-400' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isNegative ? 'skull' : 'sentiment_satisfied'}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${isNegative ? 'text-red-400' : 'text-on-surface'}`}>{isNegative ? 'Bad Habit' : 'Good Habit'}</p>
                    <p className="text-[10px] text-on-surface-variant">{isNegative ? 'Tapping deals damage to YOU' : 'Tapping grants XP & Gold'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNegative(!isNegative)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isNegative ? 'bg-red-500' : 'bg-outline-variant/40'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isNegative ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <m.button 
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={!title.trim()}
                className="w-full mt-4 bg-primary text-on-primary font-bold tracking-widest uppercase py-4 rounded-xl disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(var(--color-primary),0.4)]"
              >
                {editingHabit ? 'Update Quest' : 'Create Quest'}
              </m.button>
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, document.body);
};
