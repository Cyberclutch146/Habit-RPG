import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

export const Settings: React.FC = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useUserStore(state => state.user);

  const handleExport = () => {
    if (!user) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "habit_rpg_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <>
      <TopBar />
      
      <main className="pt-20 pb-32 px-6 w-full flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-on-surface">Settings</h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">Configure your HUD.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">Preferences</h2>
          
          <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-surface-bright/20">
            <div>
              <p className="font-bold text-on-surface">Hard Mode</p>
              <p className="text-[10px] text-on-surface-variant mt-1 max-w-[200px]">Lose XP on broken streaks. Higher rewards.</p>
            </div>
            <div className="w-12 h-6 bg-surface-container-highest rounded-full p-1 relative border border-outline-variant/30">
              <div className="w-4 h-4 bg-outline-variant rounded-full absolute left-1"></div>
            </div>
          </div>

          <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-surface-bright/20">
            <div>
              <p className="font-bold text-on-surface">Reduced Motion</p>
              <p className="text-[10px] text-on-surface-variant mt-1 max-w-[200px]">Disables heavy Framer animations for low-end devices.</p>
            </div>
            <div className="w-12 h-6 bg-surface-container-highest rounded-full p-1 relative border border-outline-variant/30">
              <div className="w-4 h-4 bg-outline-variant rounded-full absolute left-1"></div>
            </div>
          </div>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">Data Management</h2>
          
          <button onClick={handleExport} className="w-full bg-surface-container p-4 rounded-xl flex items-center justify-between border border-surface-bright/20 hover:bg-surface-container-high transition-colors text-left">
            <div>
              <p className="font-bold text-primary">Export JSON Data</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Download a copy of your progress.</p>
            </div>
            <span className="material-symbols-outlined text-primary">download</span>
          </button>

          <button className="w-full bg-error-container/10 p-4 rounded-xl flex items-center justify-between border border-error-container/30 hover:bg-error-container/20 transition-colors text-left">
            <div>
              <p className="font-bold text-error">Wipe Data & Reset</p>
              <p className="text-[10px] text-error/70 mt-1">This action is irreversible.</p>
            </div>
            <span className="material-symbols-outlined text-error">delete_forever</span>
          </button>
        </section>

        <section className="pt-8">
           <button 
             onClick={logout}
             className="w-full py-4 rounded-lg bg-surface-container-high text-on-surface-variant font-bold uppercase tracking-widest text-sm hover:text-white transition-colors border border-outline-variant/20"
           >
             Log Out
           </button>
        </section>
      </main>

      <BottomNav />
    </>
  );
};
