import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHabitStore } from '../../store/useHabitStore';
import { Habit } from '../../lib/db';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const addHabit = useHabitStore(state => state.addHabit);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Habit['type']>('Workout');
  const [difficulty, setDifficulty] = useState<Habit['difficulty']>('Medium');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let xpReward = 10;
    if (difficulty === 'Medium') xpReward = 25;
    if (difficulty === 'Hard') xpReward = 50;

    await addHabit({
      title: title.trim(),
      type,
      difficulty,
      xpReward
    });
    
    setTitle('');
    setType('Workout');
    setDifficulty('Medium');
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-3xl pointer-events-auto border-t sm:border border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transform transition-transform p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full duration-300 ease-out">
        
        {/* iOS-style grabber */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />

        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">New Quest</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Quest Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 100 Pushups" 
              className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 focus:bg-red-500/5 transition-colors placeholder:text-neutral-600"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Category</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 appearance-none"
              >
                <option value="Workout">Workout</option>
                <option value="Diet">Diet</option>
                <option value="Steps">Steps</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 appearance-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!title.trim()}
            className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold tracking-widest uppercase py-4 rounded-xl disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-[0.98]"
          >
            Create Quest
          </button>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};
