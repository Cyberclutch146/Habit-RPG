import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { UsersDB } from '../lib/db';
import { m, AnimatePresence } from 'framer-motion';
import { gameEngine } from '../lib/gameEngine';
import { AnimatedText } from '../components/animations/AnimatedText';

export const Settings: React.FC = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useUserStore(state => state.user);
  
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [showManual, setShowManual] = useState(false);

  if (!user) return null;

  const handleUpdateUser = async (updates: Partial<typeof user>) => {
    try {
      await UsersDB.update(user.id, updates);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "habit_rpg_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const saveName = () => {
    if (newName.trim() && newName !== user.name) {
      handleUpdateUser({ name: newName.trim() });
    }
    setEditingName(false);
  };

  const Toggle = ({ active, onClick, label, description }: { active: boolean, onClick: () => void, label: string, description: string }) => (
    <div onClick={onClick} className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-surface-bright/20 cursor-pointer active:scale-[0.98] transition-transform">
      <div>
        <p className="font-bold text-on-surface">{label}</p>
        <p className="text-[10px] text-on-surface-variant mt-1 max-w-[200px]">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 relative transition-colors ${active ? 'bg-primary border-primary' : 'bg-surface-container-highest border-outline-variant/30 border'}`}>
        <m.div 
          layout
          initial={false}
          animate={{ x: active ? 24 : 0 }}
          className={`w-4 h-4 rounded-full ${active ? 'bg-on-primary' : 'bg-outline-variant'}`} 
        />
      </div>
    </div>
  );

  return (
    <>
      <TopBar />
      
      <main className="pt-[100px] pb-32 px-6 w-full flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <div className="mb-8">
          <m.h1 layoutId="page-title" className="text-3xl font-black tracking-tighter uppercase text-on-surface">
            <AnimatedText text="Settings" />
          </m.h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">Configure your HUD.</p>
        </div>

        {/* Profile Card */}
        <section className="bg-gradient-to-br from-surface-container to-surface-container-high border border-surface-bright/20 rounded-2xl p-6 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
           <div className="flex items-start justify-between">
             <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Operative</p>
                {editingName ? (
                  <input 
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={e => e.key === 'Enter' && saveName()}
                    className="bg-surface-container-highest text-on-surface px-3 py-1 rounded outline-none border border-primary/50 text-xl font-bold w-full max-w-[200px]"
                  />
                ) : (
                  <h2 onClick={() => setEditingName(true)} className="text-2xl font-black text-on-surface tracking-tight cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
                    {user.name} <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                  </h2>
                )}
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Rank</p>
                <div className="bg-primary/10 px-3 py-1 rounded border border-primary/20 text-primary font-bold tracking-widest text-sm">
                  {gameEngine.getUserRank(user.level)}
                </div>
             </div>
           </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-on-surface-variant uppercase mt-8">Preferences</h2>
          
          <Toggle 
            active={user.theme === 'light'} 
            onClick={() => handleUpdateUser({ theme: user.theme === 'light' ? 'dark' : 'light' })}
            label="Light Mode"
            description="Activate day-walker retinal burning mode."
          />

          <Toggle 
            active={!!user.hardMode} 
            onClick={() => handleUpdateUser({ hardMode: !user.hardMode })}
            label="Hard Mode"
            description="Lose XP on broken streaks. Higher rewards."
          />

          <Toggle 
            active={!!user.reducedMotion} 
            onClick={() => handleUpdateUser({ reducedMotion: !user.reducedMotion })}
            label="Reduced Motion"
            description="Disables heavy animations for low-end devices."
          />
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">Data Management</h2>
          
          <button onClick={() => setShowManual(true)} className="w-full bg-surface-container p-4 rounded-xl flex items-center justify-between border border-surface-bright/20 hover:bg-surface-container-high transition-colors text-left relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            <div className="relative">
              <p className="font-bold text-on-surface">Instruction Manual</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Learn system mechanics and ranks.</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant relative">menu_book</span>
          </button>

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
             className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-surface-container-high text-on-surface-variant font-bold uppercase tracking-widest text-sm hover:text-white transition-colors border border-outline-variant/20"
           >
             <span className="material-symbols-outlined text-[18px]">logout</span> Log Out
           </button>
        </section>
      </main>

      <AnimatePresence>
        {showManual && (
          <m.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowManual(false)}
          >
            <m.div 
              initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-container border border-outline/20 p-6 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">System Manual</h2>
              
              <div className="space-y-6 text-sm text-on-surface-variant font-body mb-6 w-full pr-2 pb-4">
                <section>
                  <h3 className="font-bold text-primary uppercase tracking-widest text-xs mb-2 border-b border-outline-variant/20 pb-1">Core Progression</h3>
                  <div className="space-y-3">
                    <p><strong className="text-on-surface">XP & Levels:</strong> By completing daily recurring habits, you gain XP. You level up when you surpass the required XP threshold. XP scaling is quadratic, requiring more effort as you grow.</p>
                    <p><strong className="text-on-surface">Ranks:</strong> Your level directly determines your Rank (e.g. Bronze III, Apex I, or GOD tier). Ranking up unlocks new visual prestige.</p>
                    <p><strong className="text-on-surface">Streaks:</strong> Consistently executing habits builds your combo. Combo directly multiplies the XP and gold value you receive.</p>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-amber-500 uppercase tracking-widest text-xs mb-2 border-b border-outline-variant/20 pb-1">The Vault & Loot</h3>
                  <div className="space-y-3">
                    <p><strong className="text-on-surface">Gold:</strong> Defeating bosses and achieving high streaks drops Gold coins. Gold can be spent in the <strong className="text-amber-500">Vault</strong>.</p>
                    <p><strong className="text-on-surface">Weapons:</strong> Purchasing a Sword in the Vault grants a permanent +15% chance to score a Critical Hit on any habit completion (x2 Damage!).</p>
                    <p><strong className="text-on-surface">Cosmetics:</strong> Buy Themes (Crimson, Abyssal, Cyberpunk) in the Vault to customize your HUD.</p>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-blue-500 uppercase tracking-widest text-xs mb-2 border-b border-outline-variant/20 pb-1">Combat & Survival</h3>
                  <div className="space-y-3">
                    <p><strong className="text-on-surface">Boss Battles:</strong> Your habit completion deals damage to Bosses. Bosses are weak to specific habit categories (e.g., Workout, Steps), dealing 150% damage.</p>
                    <p><strong className="text-on-surface">HP & Hard Mode:</strong> If Hard Mode is enabled, failing to complete a daily habit will cause you to take damage based on the habit difficulty. If your HP reaches 0, you lose your streak and suffer an XP penalty!</p>
                    <p><strong className="text-on-surface">Shields:</strong> Buy Streak Shields in the Vault. They passively consume themselves to protect your streak and HP if you miss a single day.</p>
                  </div>
                </section>
                
                <section>
                  <h3 className="font-bold text-green-500 uppercase tracking-widest text-xs mb-2 border-b border-outline-variant/20 pb-1">Classes</h3>
                  <div className="space-y-3">
                    <p><strong className="text-on-surface">Class Bonus:</strong> At character creation, you picked a class (Warrior, Mage, Rogue). Your class gives you a +50% passive damage bonus to specific categories. E.g. Warriors deal massive damage when completing Workout habits.</p>
                  </div>
                </section>
              </div>

              <button 
                onClick={() => setShowManual(false)}
                className="w-full py-3 bg-primary text-on-primary rounded font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform"
              >
                Acknowledge
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </>
  );
};
