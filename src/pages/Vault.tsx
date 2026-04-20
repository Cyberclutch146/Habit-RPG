import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';
import { usersService } from '../lib/services/users';
import { AnimatedText } from '../components/animations/AnimatedText';
import { SpotlightCard } from '../components/animations/SpotlightCard';
import { trackEvent } from '../lib/analytics';
import { useHabitStore } from '../store/useHabitStore';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  iconColor: string;
  borderColor: string;
  action: () => Promise<void>;
  disabled: boolean;
  tag?: string;
}

export const Vault: React.FC = () => {
  const user = useUserStore(state => state.user);
  const logs = useHabitStore(state => state.logs);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { playLootDrop, playError } = useSoundEffects();

  const flash = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleBuyPotion = async () => {
    if (!user || (user.gold || 0) < 50) { playError(); return; }
    if ((user.hp || 100) >= (user.maxHp || 100)) { playError(); flash('Already at full HP!'); return; }
    const newGold = (user.gold || 0) - 50;
    const newHp = Math.min((user.hp || 100) + 20, (user.maxHp || 100));
    useUserStore.setState({ user: { ...user, gold: newGold, hp: newHp } });
    await usersService.updateUserStats(user.id, { gold: newGold, hp: newHp });
    trackEvent("shop_purchase", { item: "health_potion", cost: 50 });
    playLootDrop();
    flash('+20 HP restored!');
  };

  const handleBuyShield = async () => {
    if (!user || (user.gold || 0) < 150) { playError(); return; }
    if ((user.streakShields || 0) >= 2) { playError(); flash('Max shields equipped!'); return; }
    const newGold = (user.gold || 0) - 150;
    const newShields = (user.streakShields || 0) + 1;
    useUserStore.setState({ user: { ...user, gold: newGold, streakShields: newShields } });
    await usersService.updateUserStats(user.id, { gold: newGold, streakShields: newShields });
    trackEvent("shop_purchase", { item: "streak_shield", cost: 150 });
    playLootDrop();
    flash('Shield activated!');
  };

  const handleBuyWeapon = async () => {
    if (!user || (user.gold || 0) < 300) { playError(); return; }
    if (user.equippedWeapon) { playError(); flash('Weapon already equipped!'); return; }
    const newGold = (user.gold || 0) - 300;
    useUserStore.setState({ user: { ...user, gold: newGold, equippedWeapon: 'Iron Sword' } });
    await usersService.updateUserStats(user.id, { gold: newGold, equippedWeapon: 'Iron Sword' });
    trackEvent("shop_purchase", { item: "iron_sword", cost: 300 });
    playLootDrop();
    flash('Iron Sword equipped! 15% crit chance unlocked.');
  };

  const handleBuyMaxHp = async () => {
    if (!user || (user.gold || 0) < 200) { playError(); return; }
    if ((user.maxHp || 100) >= 200) { playError(); flash('Max HP already upgraded!'); return; }
    const newGold = (user.gold || 0) - 200;
    const newMaxHp = (user.maxHp || 100) + 25;
    useUserStore.setState({ user: { ...user, gold: newGold, maxHp: newMaxHp } });
    await usersService.updateUserStats(user.id, { gold: newGold, maxHp: newMaxHp });
    trackEvent("shop_purchase", { item: "hp_upgrade", cost: 200 });
    playLootDrop();
    flash('+25 Max HP unlocked!');
  };

  const handleBuyXpBoost = async () => {
    if (!user || (user.gold || 0) < 100) { playError(); return; }
    // XP Boost: Immediately grant bonus XP
    const newGold = (user.gold || 0) - 100;
    const bonusXp = (user.xp || 0) + 50;
    useUserStore.setState({ user: { ...user, gold: newGold, xp: bonusXp } });
    await usersService.updateUserStats(user.id, { gold: newGold, xp: bonusXp });
    trackEvent("shop_purchase", { item: "xp_boost", cost: 100 });
    playLootDrop();
    flash('+50 XP injected!');
  };

  const handleBuyTheme = async (themeName: string, cost: number) => {
    if (!user) return;
    const unlocked = user.unlockedThemes || ["dark"];
    if (unlocked.includes(themeName)) {
        // Theme is already unlocked, just equip it!
        useUserStore.setState({ user: { ...user, theme: themeName }});
        await usersService.updateProfile(user.id, { theme: themeName });
        playLootDrop();
        flash(`Equipped ${themeName} theme!`);
        return;
    }

    if ((user.gold || 0) < cost) {
        playError();
        flash("Not enough gold!");
        return;
    }

    const newGold = (user.gold || 0) - cost;
    const newUnlocked = [...unlocked, themeName];
    useUserStore.setState({ user: { ...user, gold: newGold, theme: themeName, unlockedThemes: newUnlocked } });
    await usersService.updateProfile(user.id, { gold: newGold, theme: themeName, unlockedThemes: newUnlocked });
    trackEvent("shop_purchase", { item: `theme_${themeName}`, cost });
    playLootDrop();
    flash(`Unlocked ${themeName} theme!`);
  };

  const gold = user?.gold || 0;
  const hp = user?.hp || 100;
  const maxHp = user?.maxHp || 100;
  const shields = user?.streakShields || 0;

  const SHOP_ITEMS: ShopItem[] = [
    {
      id: 'potion', name: 'Health Potion', description: 'Restores 20 HP instantly.',
      cost: 50, icon: 'local_drink', iconColor: 'text-red-400', borderColor: 'border-red-500/30',
      action: handleBuyPotion,
      disabled: !user || gold < 50 || hp >= maxHp,
      tag: hp >= maxHp ? 'FULL HP' : undefined
    },
    {
      id: 'shield', name: 'Streak Shield', description: 'Blocks 1 missed day (max 2).',
      cost: 150, icon: 'shield', iconColor: 'text-blue-400', borderColor: 'border-blue-500/30',
      action: handleBuyShield,
      disabled: !user || gold < 150 || shields >= 2,
      tag: shields >= 2 ? 'MAX' : undefined
    },
    {
      id: 'weapon', name: 'Iron Sword', description: 'Unlocks 15% critical hit chance on habits.',
      cost: 300, icon: 'swords', iconColor: 'text-amber-400', borderColor: 'border-amber-500/30',
      action: handleBuyWeapon,
      disabled: !user || gold < 300 || !!user?.equippedWeapon,
      tag: user?.equippedWeapon ? 'EQUIPPED' : 'NEW'
    },
    {
      id: 'max_hp', name: 'Vitality Rune', description: 'Permanently increases Max HP by 25.',
      cost: 200, icon: 'favorite', iconColor: 'text-pink-400', borderColor: 'border-pink-500/30',
      action: handleBuyMaxHp,
      disabled: !user || gold < 200 || (maxHp >= 200),
      tag: maxHp >= 200 ? 'MAXED' : 'UPGRADE'
    },
    {
      id: 'xp_boost', name: 'XP Capsule', description: 'Injects +50 XP directly into your profile.',
      cost: 100, icon: 'bolt', iconColor: 'text-yellow-300', borderColor: 'border-yellow-400/30',
      action: handleBuyXpBoost,
      disabled: !user || gold < 100,
      tag: 'BOOST'
    },
    {
        id: 'theme_crimson', name: 'Crimson Theme', description: 'Unlock the blood-red cosmetic theme.',
        cost: 500, icon: 'format_paint', iconColor: 'text-red-600', borderColor: 'border-red-600/30',
        action: () => handleBuyTheme('crimson', 500),
        disabled: !user || (gold < 500 && !(user?.unlockedThemes || []).includes('crimson')),
        tag: (user?.unlockedThemes || []).includes('crimson') ? (user?.theme === 'crimson' ? 'ACTIVE' : 'EQUIP') : '500g'
    },
    {
        id: 'theme_abyssal', name: 'Abyssal Theme', description: 'Unlock the deep sea cyan cosmetic theme.',
        cost: 500, icon: 'format_paint', iconColor: 'text-cyan-400', borderColor: 'border-cyan-400/30',
        action: () => handleBuyTheme('abyssal', 500),
        disabled: !user || (gold < 500 && !(user?.unlockedThemes || []).includes('abyssal')),
        tag: (user?.unlockedThemes || []).includes('abyssal') ? (user?.theme === 'abyssal' ? 'ACTIVE' : 'EQUIP') : '500g'
    },
    {
        id: 'theme_cyberpunk', name: 'Cyberpunk Theme', description: 'Unlock the neon synthwave cosmetic theme.',
        cost: 500, icon: 'format_paint', iconColor: 'text-pink-500', borderColor: 'border-pink-500/30',
        action: () => handleBuyTheme('cyberpunk', 500),
        disabled: !user || (gold < 500 && !(user?.unlockedThemes || []).includes('cyberpunk')),
        tag: (user?.unlockedThemes || []).includes('cyberpunk') ? (user?.theme === 'cyberpunk' ? 'ACTIVE' : 'EQUIP') : '500g'
    }
  ];

  return (
    <>
      <TopBar />
      
      <main className="pt-24 pb-32 px-6 w-full flex-1 overflow-y-auto space-y-8 custom-scrollbar relative z-10">
        
        {/* Feedback toast */}
        {feedback && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-surface-container-high border border-primary/40 text-on-surface text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {feedback}
          </div>
        )}
        
        {/* Header & Currency */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-on-surface">
               <AnimatedText text="The Vault" />
            </h1>
            <p className="text-on-surface-variant font-body text-sm mt-2">
              <strong className="text-amber-500">Gold Coins</strong> are earned by completing daily quests and boss challenges. 
              Spend them in the <strong className="text-primary">Black Market</strong> below to buy health potions, shields, and powerful upgrades!
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-surface-container-high py-2 px-4 rounded-xl shadow-lg border border-amber-500/30">
              <span className="text-2xl font-black text-amber-500">{gold.toLocaleString()}</span>
              <span className="material-symbols-outlined text-amber-500">toll</span>
            </div>
            <p className="text-[9px] text-secondary uppercase font-bold tracking-widest">{logs.length} missions completed</p>
          </div>
        </div>

        {/* The Merchant Shop */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">storefront</span>
            The Black Market
          </h2>
          
          <div className="space-y-3 relative z-10">
            {SHOP_ITEMS.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between bg-surface-container-low p-4 rounded-lg border ${item.borderColor} ${item.disabled ? 'opacity-60' : 'hover:bg-surface-container-high transition-colors'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded bg-surface-container-lowest/60 flex items-center justify-center border ${item.borderColor}`}>
                    <span className={`material-symbols-outlined ${item.iconColor} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-on-surface uppercase tracking-tight text-sm">{item.name}</p>
                      {item.tag && (
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.disabled ? 'bg-outline/20 text-secondary' : 'bg-primary-container/30 text-primary'}`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{item.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={item.action}
                  disabled={item.disabled}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-4 py-2 rounded font-bold uppercase text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-2"
                >
                  <span>{item.cost}</span>
                  <span className="material-symbols-outlined text-[14px]">toll</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory Panel */}
        <section className="bg-surface-container p-6 rounded-xl shadow-xl border border-secondary/20 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-sm font-bold tracking-widest text-secondary uppercase mb-4 relative z-10 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Active Inventory
          </h2>
          
          <div className="grid grid-cols-3 gap-3 relative z-10">
            {/* Shields */}
            {[1, 2].map(slot => {
              const isActive = shields >= slot;
              return (
                <SpotlightCard key={`shield-${slot}`} className="w-full h-full rounded-xl">
                  <div className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${isActive ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-surface-container-lowest border-outline-variant/20 opacity-50'}`}>
                    <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-blue-400 animate-pulse' : 'text-outline-variant'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      shield
                    </span>
                    <span className="text-[8px] font-bold tracking-widest uppercase text-on-surface-variant">
                      {isActive ? "Shield" : "Empty"}
                    </span>
                  </div>
                </SpotlightCard>
              );
            })}

            {/* Weapon slot */}
            <SpotlightCard className="w-full h-full rounded-xl">
              <div className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${user?.equippedWeapon ? 'bg-amber-900/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-surface-container-lowest border-outline-variant/20 opacity-50'}`}>
                <span className={`material-symbols-outlined text-2xl ${user?.equippedWeapon ? 'text-amber-400' : 'text-outline-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  swords
                </span>
                <span className="text-[8px] font-bold tracking-widest uppercase text-on-surface-variant text-center leading-tight px-1">
                  {user?.equippedWeapon || "No Weapon"}
                </span>
              </div>
            </SpotlightCard>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-[10px] text-secondary font-mono uppercase text-center">
            <span>Max HP: <strong className="text-on-surface">{maxHp}</strong></span>
            <span>HP: <strong className="text-red-400">{hp}/{maxHp}</strong></span>
            <span>Gold: <strong className="text-amber-500">{gold}</strong></span>
          </div>
        </section>

      </main>

      <BottomNav />
    </>
  );
};
