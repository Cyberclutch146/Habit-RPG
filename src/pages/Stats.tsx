import React, { useMemo, useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { gameEngine } from '../lib/gameEngine';
import { usersService } from '../lib/services/users';
import { useSoundEffects } from '../hooks/useSoundEffects';

const TABS = ["STATS", "GEAR", "SKILLS"];

const ALL_SKILLS = [
  { id: "s_gold", name: "Greed", desc: "Gold drops +10%", cost: 1, icon: "payments" },
  { id: "s_crit", name: "Precision", desc: "Base crit +5%", cost: 1, icon: "target" },
  { id: "s_hp", name: "Vitality", desc: "Max HP +50", cost: 2, icon: "favorite" }
];

export const Stats: React.FC = () => {
  const user = useUserStore(state => state.user);
  const logs = useHabitStore(state => state.logs);
  const [activeTab, setActiveTab] = useState("STATS");
  const { playClick, playSuccess, playError } = useSoundEffects();

  const { chartData, maxDailyDrop, totalXp30Days } = useMemo(() => {
    const days: { date: string, xp: number }[] = [];
    let max = 0;
    let total30 = 0;
    
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().split('T')[0], xp: 0 });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyStr = thirtyDaysAgo.toISOString().split('T')[0];

    logs.forEach(log => {
      const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toISOString().split('T')[0] : 
                       (log.timestamp instanceof Date ? log.timestamp.toISOString().split('T')[0] : 
                       new Date(log.timestamp).toISOString().split('T')[0]);
      
      const xp = log.xpAwarded || 10;
      if (dateStr >= thirtyStr) total30 += xp;
      
      const bucket = days.find(d => d.date === dateStr);
      if (bucket) {
        bucket.xp += xp;
        if (bucket.xp > max) max = bucket.xp;
      }
    });

    return { chartData: days, maxDailyDrop: max || 100, totalXp30Days: total30 };
  }, [logs]);

  const chartHeight = 120;
  const chartWidth = 300;
  
  const generatePath = () => {
    if (chartData.length === 0) return "";
    const step = chartWidth / (chartData.length - 1);
    return chartData.map((d, i) => {
      const x = i * step;
      const h = (d.xp / maxDailyDrop) * chartHeight;
      const y = chartHeight - h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const rank = gameEngine.getUserRank(user?.level || 1);

  const equipItem = async (itemId: string, type: string) => {
    if (!user) return;
    const updates: any = {};
    if (type === "weapon") updates.equippedWeapon = itemId;
    if (type === "armor") updates.equippedArmor = itemId;
    if (type === "pet") updates.equippedPet = itemId;
    
    useUserStore.setState({ user: { ...user, ...updates } });
    await usersService.updateProfile(user.id, updates);
    playClick();
  };

  const unlockSkill = async (skillId: string, cost: number) => {
    if (!user || (user.skillPoints || 0) < cost) { playError(); return; }
    if ((user.unlockedSkills || []).includes(skillId)) return;

    const newSp = (user.skillPoints || 0) - cost;
    const newUnlocked = [...(user.unlockedSkills || []), skillId];

    useUserStore.setState({ user: { ...user, skillPoints: newSp, unlockedSkills: newUnlocked }});
    await usersService.updateProfile(user.id, { skillPoints: newSp, unlockedSkills: newUnlocked });
    playSuccess();
  };

  return (
    <>
      <TopBar />
      <main className="pt-20 pb-32 px-4 w-full flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        
        {/* Dynamic Avatar Block */}
        <section className="bg-surface-container rounded-xl shadow-xl border border-outline-variant/10 relative overflow-hidden h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="z-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-surface-container-highest border-2 border-primary rounded-full flex items-center justify-center flex-col blood-shadow mb-2 shadow-2xl relative">
                  <span className="material-symbols-outlined text-4xl text-on-surface">person</span>
                  
                  {/* Equipped Weapon indicator overlays */}
                  {user?.equippedWeapon && (
                      <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-primary rounded-full border-2 border-surface flex items-center justify-center shadow-lg">
                          <span className="material-symbols-outlined text-white text-sm">swords</span>
                      </div>
                  )}
                </div>
                <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase">{user?.name || "HERO"}</h2>
                <p className="text-[10px] text-primary font-bold tracking-widest uppercase">{rank} / LVL {user?.level || 1}</p>
            </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex bg-surface-container-high rounded-full p-1 sticky top-0 z-30 shadow-lg border border-outline-variant/10">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-xl' 
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab View: STATS */}
        {activeTab === "STATS" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <section className="flex gap-4">
                    <div className="bg-surface-container-high p-4 rounded-xl shadow-xl flex-1 border border-outline-variant/10 border-l-4 border-l-primary flex items-center justify-between">
                        <div>
                            <p className="font-label text-[10px] tracking-widest text-secondary uppercase mb-1">Health</p>
                            <p className="text-xl font-black text-on-surface tracking-tighter">{user?.hp}/{user?.maxHp || 100}</p>
                        </div>
                        <span className="material-symbols-outlined text-red-500">favorite</span>
                    </div>
                    <div className="bg-surface-container-high p-4 rounded-xl shadow-xl flex-1 border border-outline-variant/10 border-l-4 border-l-yellow-500 flex items-center justify-between">
                        <div>
                            <p className="font-label text-[10px] tracking-widest text-secondary uppercase mb-1">Gold</p>
                            <p className="text-xl font-black text-on-surface tracking-tighter">{user?.gold || 0}</p>
                        </div>
                        <span className="material-symbols-outlined text-yellow-500">monetization_on</span>
                    </div>
                </section>
                <section className="bg-surface-container-high p-4 rounded-xl shadow-xl border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-3">
                        <p className="font-label text-[10px] tracking-widest text-secondary uppercase">Level Progress</p>
                        <span className="text-xs font-bold text-primary">{user?.xp} / {gameEngine.getXPForNextLevel(user?.level || 1)}</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                        <div 
                        className="bg-primary h-full shadow-[0_0_10px_rgba(209,54,57,0.5)] transition-all duration-1000" 
                        style={{ width: `${Math.min(100, ((user?.xp || 0) / gameEngine.getXPForNextLevel(user?.level || 1)) * 100)}%` }}
                        ></div>
                    </div>
                </section>
                <section className="bg-surface-container rounded-xl overflow-hidden shadow-2xl relative border border-outline-variant/10">
                <div className="p-4 flex justify-between items-center">
                    <div>
                    <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface">XP Flow</h2>
                    </div>
                    <span className="bg-primary-container text-primary px-2 py-1 text-[9px] font-bold uppercase rounded">{totalXp30Days} (30D)</span>
                </div>
                <div className="h-32 w-full relative px-4 pb-4">
                    <div className="absolute inset-x-4 inset-y-0 flex flex-col justify-between opacity-10 pointer-events-none pb-4">
                    <div className="border-t border-secondary"></div>
                    <div className="border-t border-secondary"></div>
                    <div className="border-t border-secondary"></div>
                    </div>
                    
                    <div className="relative w-full h-full flex items-end pt-2">
                    <svg viewBox={`0 -10 ${chartWidth} ${chartHeight + 20}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0" />
                        </linearGradient>
                        </defs>
                        <path d={`${generatePath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#gradient)" />
                        <path d={generatePath()} fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(209,54,57,0.8)]" />
                        {chartData.map((d, i) => {
                            const x = i * (chartWidth / (chartData.length - 1));
                            const y = chartHeight - ((d.xp / maxDailyDrop) * chartHeight);
                            if(isNaN(x) || isNaN(y)) return null;
                            return <circle key={i} cx={x} cy={y} r="4" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-primary)" strokeWidth="2" />
                        })}
                    </svg>
                    </div>
                    <div className="absolute bottom-0 left-4 right-4 flex justify-between text-[8px] text-secondary font-mono tracking-tighter">
                    {chartData.map((d, i) => (<span key={i}>{d.date.split('-').slice(1).join('/')}</span>))}
                    </div>
                </div>
                </section>
            </div>
        )}

        {/* Tab View: GEAR */}
        {activeTab === "GEAR" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/10 shadow-xl">
                    <h2 className="text-sm font-black text-on-surface tracking-tighter uppercase flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">backpack</span>
                        Your Inventory
                    </h2>
                    
                    {!user?.inventory || user.inventory.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-secondary/30 block mb-2">sentiment_dissatisfied</span>
                            <p className="text-xs text-secondary font-bold uppercase tracking-widest">No loot found.<br/>Defeat Bosses to earn gear!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {(user?.inventory || []).map((item) => {
                                const isEquipped = user?.equippedWeapon === item.id || user?.equippedArmor === item.id || user?.equippedPet === item.id;
                                const rarityConfig = {
                                    common: { border: "border-gray-500", text: "text-gray-500", bg: "bg-gray-500/10" },
                                    rare: { border: "border-blue-500", text: "text-blue-500", bg: "bg-blue-500/10" },
                                    epic: { border: "border-purple-500", text: "text-purple-500", bg: "bg-purple-500/10" },
                                    legendary: { border: "border-yellow-500", text: "text-yellow-500", bg: "bg-yellow-500/10" },
                                }[item.rarity];

                                return (
                                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border-2 ${isEquipped ? rarityConfig.border : 'border-outline-variant/10'} bg-surface-container`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded shadow-inner flex items-center justify-center ${rarityConfig.bg}`}>
                                           <span className={`material-symbols-outlined ${rarityConfig.text}`}>
                                               {item.type === 'weapon' ? 'swords' : item.type === 'armor' ? 'shield' : 'pets'}
                                           </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface text-sm">{item.name}</p>
                                            <p className={`text-[9px] uppercase tracking-widest font-black ${rarityConfig.text}`}>
                                                {item.rarity} {item.type} &bull; {item.statBonus}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => equipItem(item.id, item.type)}
                                        disabled={isEquipped}
                                        className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${
                                            isEquipped ? 'bg-surface-variant text-secondary cursor-not-allowed' : `bg-surface-container-highest text-on-surface border border-outline-variant/30 active:scale-95 transition-transform`
                                        }`}
                                    >
                                        {isEquipped ? 'Armed' : 'Equip'}
                                    </button>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Tab View: SKILLS */}
        {activeTab === "SKILLS" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                 <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-4 rounded-xl">
                    <div>
                        <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Available Points</p>
                        <p className="text-2xl font-black text-primary tracking-tighter">{user?.skillPoints || 0} SP</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {ALL_SKILLS.map(skill => {
                        const isUnlocked = (user?.unlockedSkills || []).includes(skill.id);
                        const canAfford = (user?.skillPoints || 0) >= skill.cost;
                        
                        return (
                            <div key={skill.id} className={`flex items-center p-4 rounded-xl border-2 transition-all ${isUnlocked ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-high'}`}>
                                <div className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-inner mr-4 ${isUnlocked ? 'bg-primary text-white' : 'bg-surface-container-lowest text-secondary'}`}>
                                    <span className="material-symbols-outlined">{skill.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-black tracking-tighter text-on-surface">{skill.name}</p>
                                    <p className="text-[10px] font-bold text-secondary">{skill.desc}</p>
                                </div>
                                <div>
                                    {isUnlocked ? (
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Active
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => unlockSkill(skill.id, skill.cost)}
                                            disabled={!canAfford}
                                            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded transition-all ${
                                                canAfford ? 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-md' : 'bg-surface-container text-secondary cursor-not-allowed'
                                            }`}
                                        >
                                            {skill.cost} SP
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </div>
        )}

      </main>
      <BottomNav />
    </>
  );
};
