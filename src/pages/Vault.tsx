import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';
import { usersService } from '../lib/services/users';
import { AnimatedText } from '../components/animations/AnimatedText';
import { SpotlightCard } from '../components/animations/SpotlightCard';
import { trackEvent } from '../lib/analytics';

export const Vault: React.FC = () => {
  const user = useUserStore(state => state.user);

  const handleBuyPotion = async () => {
    if (!user || (user.gold || 0) < 50) return;
    if ((user.hp || 100) >= (user.maxHp || 100)) return; // Already max hp

    const newGold = (user.gold || 0) - 50;
    const newHp = Math.min((user.hp || 100) + 20, (user.maxHp || 100)); // Heal 20 HP

    useUserStore.setState({ user: { ...user, gold: newGold, hp: newHp } });
    await usersService.updateUserStats(user.id, { gold: newGold, hp: newHp });
    trackEvent("shop_purchase", { item: "health_potion", cost: 50 });
  };

  const handleBuyShield = async () => {
    if (!user || (user.gold || 0) < 150) return;
    if ((user.streakShields || 0) >= 2) return; // Max shields

    const newGold = (user.gold || 0) - 150;
    const newShields = (user.streakShields || 0) + 1;

    useUserStore.setState({ user: { ...user, gold: newGold, streakShields: newShields } });
    await usersService.updateUserStats(user.id, { gold: newGold, streakShields: newShields });
    trackEvent("shop_purchase", { item: "streak_shield", cost: 150 });
  };

  return (
    <>
      <TopBar />
      
      <main className="pt-24 pb-32 px-6 w-full flex-1 overflow-y-auto space-y-8 custom-scrollbar relative z-10">
        
        {/* Header & Currency */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-on-surface">
               <AnimatedText text="The Vault" />
            </h1>
            <p className="text-on-surface-variant font-body text-sm mt-1">Spend your hard-earned gold.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-high py-2 px-4 rounded-xl shadow-lg border border-amber-500/30">
            <span className="text-2xl font-black text-amber-500">{user?.gold || 0}</span>
            <span className="material-symbols-outlined text-amber-500">toll</span>
          </div>
        </div>

        {/* The Black Market (Shop) */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">storefront</span>
            The Merchant
          </h2>
          
          <div className="space-y-4 relative z-10">
            {/* Potion Item */}
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <span className="material-symbols-outlined text-red-500 text-2xl">local_drink</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface uppercase tracking-tight text-sm">Health Potion</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Restores 20 HP</p>
                </div>
              </div>
              
              <button 
                onClick={handleBuyPotion}
                disabled={!user || (user.gold || 0) < 50 || (user.hp || 100) >= (user.maxHp || 100)}
                className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-4 py-2 rounded font-bold uppercase text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>50</span>
                <span className="material-symbols-outlined text-[14px]">toll</span>
              </button>
            </div>

            {/* Shield Item */}
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface uppercase tracking-tight text-sm">Streak Shield</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Blocks 1 Missed Day</p>
                </div>
              </div>
              
              <button 
                onClick={handleBuyShield}
                disabled={!user || (user.gold || 0) < 150 || (user.streakShields || 0) >= 2}
                className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-4 py-2 rounded font-bold uppercase text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>150</span>
                <span className="material-symbols-outlined text-[14px]">toll</span>
              </button>
            </div>
          </div>
        </section>

        {/* Consumables Inventory (Streak Shields) */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-secondary/20 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
             <h2 className="text-sm font-bold tracking-widest text-secondary uppercase">Active Shields</h2>
             <span className="text-xs font-mono text-secondary-dim bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">{user?.streakShields || 0}/2</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[1, 2].map(slot => {
              const isActive = (user?.streakShields || 0) >= slot;
              return (
                <SpotlightCard key={slot} className="w-full h-full rounded-xl">
                  <div className={`w-full h-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${isActive ? 'bg-secondary/10 border-secondary/50 shadow-[0_0_15px_rgba(214,116,255,0.2)]' : 'bg-surface-container-lowest border-outline-variant/20 opacity-50'}`}>
                    <span className={`material-symbols-outlined text-3xl ${isActive ? 'text-secondary animate-pulse' : 'text-outline-variant'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      shield
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                      {isActive ? "Equipped" : "Empty"}
                    </span>
                  </div>
                </SpotlightCard>
              )
            })}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-4 text-center">Shields automatically protect your combo if you miss a Daily.</p>
        </section>

      </main>

      <BottomNav />
    </>
  );
};
