import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { usersService } from '../../lib/services/users';
import ReactDOM from 'react-dom';

const CLASSES = [
  {
    id: 'warrior',
    name: 'Warrior',
    icon: 'swords',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.3)]',
    description: 'Masters of physical conditioning.',
    bonus: '+50% Damage to Workout Quests'
  },
  {
    id: 'mage',
    name: 'Mage',
    icon: 'auto_awesome',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.3)]',
    description: 'Scholars of the arcane arts.',
    bonus: '+50% Damage to Custom Quests'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    icon: 'directions_run',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    description: 'Swift and silent shadows.',
    bonus: '+50% Damage to Steps Quests'
  }
];

export const ClassSelector: React.FC = () => {
  const user = useUserStore(state => state.user);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use carefully: don't render if unmounted or user already has class
  if (!user || user.class !== 'none') return null;

  const handleSelect = async () => {
    if (!selectedClass || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await usersService.updateProfile(user.id, { class: selectedClass });
      useUserStore.setState({ user: { ...user, class: selectedClass as any } });
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const portalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Absolute Backdrop - Dark thick glassmorphism */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      <m.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center"
      >
        <div className="text-center mb-12">
          <m.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Awaken Your Potential
          </m.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Choose Your Path
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {CLASSES.map((cls, i) => {
            const isSelected = selectedClass === cls.id;
            return (
              <m.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedClass(cls.id)}
                className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 border-2 ${
                  isSelected 
                    ? `bg-slate-900 border-white ${cls.glow}` 
                    : `bg-slate-900/50 border-slate-800 hover:border-slate-600`
                }`}
              >
                {/* Radial gradient background behind icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${cls.bg} ${isSelected ? 'scale-110' : ''} transition-transform`}>
                  <span className={`material-symbols-outlined text-4xl ${cls.color}`}>
                    {cls.icon}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-white text-center mb-2">{cls.name}</h3>
                <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                  {cls.description}
                </p>

                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Perk</span>
                  <span className={`text-sm font-bold ${cls.color}`}>{cls.bonus}</span>
                </div>
              </m.div>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedClass && (
            <m.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={handleSelect}
              disabled={isSubmitting}
              className="bg-white text-black px-12 py-4 rounded-full font-black tracking-wide text-lg hover:bg-slate-200 active:scale-95 transition-all w-full max-w-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Awakening...' : 'Confirm Selection'}
            </m.button>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(portalContent, document.body) : null;
};
