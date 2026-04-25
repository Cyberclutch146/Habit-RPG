import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const PROGRESSION = [
    { name: "UNRANKED", cols: ["border-slate-500", "text-slate-500", "bg-slate-500/10"], levels: "1 - 3", desc: "The awakening of a new challenger." },
    { name: "BRONZE", cols: ["border-amber-600", "text-amber-600", "bg-amber-600/10"], levels: "4 - 6", desc: "Foundational strength established." },
    { name: "IRON", cols: ["border-zinc-400", "text-zinc-400", "bg-zinc-400/10"], levels: "7 - 9", desc: "Hardened resolve and discipline." },
    { name: "SILVER", cols: ["border-slate-300", "text-slate-300", "bg-slate-300/10"], levels: "10 - 12", desc: "Shining potential realized." },
    { name: "GOLD", cols: ["border-yellow-400", "text-yellow-400", "bg-yellow-400/10"], levels: "13 - 15", desc: "A paragon of consistency." },
    { name: "PLATINUM", cols: ["border-teal-300", "text-teal-300", "bg-teal-300/10"], levels: "16 - 18", desc: "Rare and unyielding focus." },
    { name: "DIAMOND", cols: ["border-cyan-400", "text-cyan-400", "bg-cyan-400/10"], levels: "19 - 21", desc: "Unbreakable and flawless execution." },
    { name: "MASTER", cols: ["border-fuchsia-500", "text-fuchsia-500", "bg-fuchsia-500/10"], levels: "22 - 24", desc: "Absolute mastery over oneself." },
    { name: "APEX", cols: ["border-red-500", "text-red-500", "bg-red-500/10"], levels: "25 - 27", desc: "The pinnacle of mortal achievement." },
    { name: "LEGEND", cols: ["border-orange-500", "text-orange-500", "bg-orange-500/10"], levels: "28 - 30", desc: "Songs will be sung of your deeds." },
    { name: "WARLORD", cols: ["border-rose-700", "text-rose-700", "bg-rose-700/10"], levels: "31 - 33", desc: "Conqueror of all habits and foes." },
    { name: "GOD", cols: ["border-indigo-400", "text-indigo-400", "bg-indigo-400/10"], levels: "34+", desc: "Ascension. You are beyond mortal limits." }
];

export const RanksManual: React.FC<Props> = ({ isOpen, onClose }) => {
  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center pointer-events-none p-4">
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" 
            onClick={onClose}
          />
          
          <m.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-container rounded-3xl pointer-events-auto shadow-2xl flex flex-col h-[80vh] max-h-[800px] border border-outline-variant/30 overflow-hidden"
          >
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-high z-10 shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-on-surface tracking-tight uppercase">Ranks Manual</h2>
                    <p className="text-xs text-on-surface-variant font-bold tracking-widest uppercase mt-1">Ascension Path</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-highest hover:bg-outline-variant/20 flex items-center justify-center transition-colors text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                    As you gain XP and level up, your rank will increase. Each division (except UNRANKED and GOD) is split into three subdivisions: III, II, and I. Reach Level I of your current rank to promote to the next tier!
                </p>

                <div className="space-y-4">
                    {PROGRESSION.map((rank, i) => (
                        <m.div 
                            key={rank.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-4 rounded-2xl border flex items-center gap-4 ${rank.cols[0]} ${rank.cols[2]} bg-opacity-20`}
                        >
                            <div className="w-16 h-16 shrink-0 rounded-xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 shadow-inner">
                                <span className={`text-sm font-black tracking-tighter ${rank.cols[1]}`}>Lv. {rank.levels}</span>
                            </div>
                            <div>
                                <h3 className={`text-xl font-black uppercase tracking-wider ${rank.cols[1]}`}>{rank.name}</h3>
                                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed opacity-80">{rank.desc}</p>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
            
            {/* Gradient shadow to show more content */}
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-surface-container to-transparent pointer-events-none" />
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(content, document.body) : null;
};
