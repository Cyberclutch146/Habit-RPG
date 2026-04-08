import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { gameEngine } from '../../lib/gameEngine';
import { m } from 'framer-motion';

export const TopBar: React.FC = () => {
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();
  
  if (!user) return null;
  const streak = user?.streak || 0;
  
  return (
    <m.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-outline-variant/10 shadow-sm"
    >
      <div className="flex items-center gap-3 active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden relative group">
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight text-on-surface leading-none">{user.name}</span>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">{gameEngine.getUserRank(user.level)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <m.div 
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-full border border-outline-variant/20 shadow-inner"
        >
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-xs font-bold font-label tracking-widest text-on-surface uppercase">{streak}</span>
        </m.div>
        
        <m.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20 shadow-sm"
        >
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
        </m.button>
      </div>
    </m.header>
  );
};
