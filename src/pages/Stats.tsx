import React, { useMemo } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { gameEngine } from '../lib/gameEngine';

export const Stats: React.FC = () => {
  const user = useUserStore(state => state.user);
  const logs = useHabitStore(state => state.logs);
  
  // Real computing for XP Kinetic Flow
  const { chartData, maxDailyDrop, totalXp30Days } = useMemo(() => {
    const days: { date: string, xp: number }[] = [];
    let max = 0;
    let total30 = 0;
    
    // Generate last 7 days buckets
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

  // SVG Chart scaling
  const chartHeight = 150;
  const chartWidth = 300; // base svg width for viewbox
  
  const generatePath = () => {
    if (chartData.length === 0) return "";
    const step = chartWidth / (chartData.length - 1);
    
    return chartData.map((d, i) => {
      const x = i * step;
      // y is inverted (0 is top)
      const h = (d.xp / maxDailyDrop) * chartHeight;
      const y = chartHeight - h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const rank = gameEngine.getUserRank(user?.level || 1);

  return (
    <>
      <TopBar />
      
      <main className="pt-24 pb-32 px-6 w-full flex-1 overflow-y-auto space-y-8 custom-scrollbar">
        {/* Hero Stats Row */}
        <section className="flex flex-col gap-4">
          <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-primary-container shadow-xl">
            <p className="font-label text-xs tracking-widest text-secondary uppercase mb-1">Combat Level</p>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-black text-on-surface tracking-tighter">LVL {user?.level || 1}</span>
              <span className="text-primary font-bold text-[10px] tracking-widest uppercase">{user?.class || "NO CLASS"}</span>
            </div>
            <div className="mt-4 w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary-container h-full shadow-[0_0_10px_rgba(209,54,57,0.5)] transition-all duration-1000" 
                style={{ width: `${Math.min(100, ((user?.xp || 0) / gameEngine.getXPForNextLevel(user?.level || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-outline-variant shadow-xl">
            <p className="font-label text-xs tracking-widest text-secondary uppercase mb-1">Global Rank</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-on-surface tracking-tighter uppercase">{rank}</span>
            </div>
            <p className="text-secondary text-[10px] mt-2 uppercase tracking-widest">Based on cumulative combat level</p>
          </div>
        </section>

        {/* Kinetic XP Graph (Real SVG Graph) */}
        <section className="bg-surface-container rounded-xl overflow-hidden shadow-2xl relative border border-outline-variant/10">
          <div className="p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black tracking-tighter uppercase text-on-surface">XP Kinetic Flow</h2>
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mt-1">{totalXp30Days} XP (LAST 30D)</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-primary-container text-on-primary-container px-3 py-1 text-[10px] font-bold uppercase rounded">7 Days</span>
            </div>
          </div>
          <div className="h-40 w-full relative px-6 pb-6">
            {/* Grid lines */}
            <div className="absolute inset-x-6 inset-y-0 flex flex-col justify-between opacity-10 pointer-events-none pb-6">
              <div className="border-t border-secondary"></div>
              <div className="border-t border-secondary"></div>
              <div className="border-t border-secondary"></div>
            </div>
            
            <div className="relative w-full h-full flex items-end">
               <svg viewBox={`0 -10 ${chartWidth} ${chartHeight + 20}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                 <defs>
                   <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.5" />
                     <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 
                 {/* Area fill */}
                 <path 
                   d={`${generatePath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                   fill="url(#gradient)"
                 />
                 
                 {/* Stroke line */}
                 <path 
                   d={generatePath()}
                   fill="none"
                   stroke="var(--md-sys-color-primary)"
                   strokeWidth="3"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   className="drop-shadow-[0_0_8px_rgba(209,54,57,0.8)]"
                 />

                 {/* Points */}
                 {chartData.map((d, i) => {
                    const x = i * (chartWidth / (chartData.length - 1));
                    const y = chartHeight - ((d.xp / maxDailyDrop) * chartHeight);
                    return (
                      <circle key={i} cx={x} cy={y} r="4" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-primary)" strokeWidth="2" />
                    )
                 })}
               </svg>
            </div>
            
            {/* X-Axis labels */}
            <div className="absolute bottom-0 left-6 right-6 flex justify-between text-[8px] text-secondary font-mono tracking-tighter">
              {chartData.map((d, i) => (
                <span key={i}>{d.date.split('-').slice(1).join('/')}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Stats Grid */}
        <section className="flex flex-col gap-6">
          <div className="bg-surface-container p-6 rounded-xl shadow-xl space-y-4 border border-surface-bright/20">
            <h2 className="text-base font-black tracking-tighter uppercase text-on-surface">Streak Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                <div>
                  <p className="font-black text-on-surface tracking-tighter text-2xl">{user?.streak || 0} DAYS</p>
                  <p className="text-[10px] text-secondary uppercase font-bold tracking-widest text-primary">Active Streak</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">local_fire_department</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                <div>
                  <p className="font-black text-on-surface tracking-tighter text-2xl">{user?.hp || 100} / {user?.maxHp || 100}</p>
                  <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Current Health</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-900 border border-red-500/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400 text-lg">favorite</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};
