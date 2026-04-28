"use client";
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { usersService } from '../../lib/services/users';
import { gameEngine, PET_ROSTER, ADVENTURE_CONFIG } from '../../lib/gameEngine';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface PetAdventuresProps {
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  common: { border: "border-slate-400/30", bg: "bg-slate-400/10", text: "text-slate-400" },
  rare: { border: "border-blue-400/30", bg: "bg-blue-400/10", text: "text-blue-400" },
  epic: { border: "border-purple-400/30", bg: "bg-purple-400/10", text: "text-purple-400" },
  legendary: { border: "border-amber-400/30", bg: "bg-amber-400/10", text: "text-amber-400" },
};

export const PetAdventures: React.FC<PetAdventuresProps> = ({ isOpen, onClose }) => {
  const user = useUserStore(state => state.user);
  const { playLootDrop, playClick } = useSoundEffects();
  const [selectedTier, setSelectedTier] = useState<"short" | "medium" | "long">("short");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [claimResult, setClaimResult] = useState<any>(null);

  // Timer for active adventure
  useEffect(() => {
    if (!user?.activeAdventure) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - user.activeAdventure!.startedAt;
      const remaining = Math.max(0, user.activeAdventure!.duration - elapsed);
      if (remaining <= 0) {
        setTimeLeft("READY TO CLAIM!");
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.activeAdventure]);

  if (!user) return null;

  const ownedPets = PET_ROSTER.filter(p => (user.pets || []).includes(p.id));
  const availablePets = ownedPets.filter(p => p.id !== user.equippedPet && p.id !== user.activeAdventure?.petId);
  const hasActiveAdventure = !!user.activeAdventure;
  const adventureComplete = hasActiveAdventure && (Date.now() - user.activeAdventure!.startedAt) >= user.activeAdventure!.duration;

  const handleSendAdventure = async () => {
    if (!selectedPetId || hasActiveAdventure) return;
    playClick();
    const config = ADVENTURE_CONFIG[selectedTier];
    const adventure = {
      petId: selectedPetId,
      startedAt: Date.now(),
      duration: config.duration,
      rewardTier: selectedTier as "short" | "medium" | "long",
    };
    useUserStore.setState({ user: { ...user, activeAdventure: adventure } });
    await usersService.updateProfile(user.id, { activeAdventure: adventure });
    setSelectedPetId(null);
  };

  const handleClaim = async () => {
    if (!user.activeAdventure || !adventureComplete) return;
    
    const pet = PET_ROSTER.find(p => p.id === user.activeAdventure!.petId);
    const reward = gameEngine.generateAdventureReward(
      user.activeAdventure.rewardTier,
      pet?.rarity || "common"
    );

    // Merge materials
    const existingMaterials = [...(user.materials || [])];
    const existing = existingMaterials.find(m => m.name === reward.material.name && m.rarity === reward.material.rarity);
    if (existing) {
      existing.quantity += reward.material.quantity;
    } else {
      existingMaterials.push(reward.material);
    }

    const newGold = (user.gold || 0) + reward.gold;
    const newXp = (user.xp || 0) + reward.xp;
    
    const updates = {
      gold: newGold,
      xp: newXp,
      materials: existingMaterials,
      activeAdventure: null,
    };

    useUserStore.setState({ user: { ...user, ...updates } });
    await usersService.updateProfile(user.id, updates);
    
    setClaimResult(reward);
    playLootDrop();
    setTimeout(() => setClaimResult(null), 5000);
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />
          <m.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md max-h-[80vh] bg-surface-container rounded-t-3xl sm:rounded-3xl pointer-events-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t sm:border border-outline-variant/20 p-6 pb-12 sm:pb-6 overflow-y-auto custom-scrollbar"
          >
            <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6 sm:hidden" />

            <h2 className="text-xl font-black text-on-surface tracking-tight flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
              Pet Adventures
            </h2>

            {/* Claim Result Toast */}
            {claimResult && (
              <m.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center"
              >
                <p className="text-sm font-bold text-amber-400 mb-1">🎉 Adventure Complete!</p>
                <p className="text-xs text-on-surface-variant">
                  +{claimResult.gold} Gold · +{claimResult.xp} XP · {claimResult.material.quantity}x {claimResult.material.name}
                </p>
              </m.div>
            )}

            {/* Active Adventure */}
            {hasActiveAdventure && (
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary animate-pulse">hiking</span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {PET_ROSTER.find(p => p.id === user.activeAdventure!.petId)?.name || "Pet"} is exploring...
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {ADVENTURE_CONFIG[user.activeAdventure!.rewardTier]?.label}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-surface rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-1000 rounded-full"
                    style={{
                      width: `${Math.min(100, ((Date.now() - user.activeAdventure!.startedAt) / user.activeAdventure!.duration) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${adventureComplete ? 'text-amber-400 animate-pulse' : 'text-secondary'}`}>
                    {adventureComplete ? "✨ READY TO CLAIM!" : timeLeft}
                  </span>
                  {adventureComplete && (
                    <button
                      onClick={handleClaim}
                      className="px-4 py-2 bg-amber-500 text-white text-xs font-bold uppercase rounded-lg shadow-lg active:scale-95 transition-transform"
                    >
                      Claim Rewards
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Send a pet */}
            {!hasActiveAdventure && (
              <>
                {/* Duration Selector */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Duration</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(ADVENTURE_CONFIG) as [string, any][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => { setSelectedTier(key as any); playClick(); }}
                        className={`p-3 rounded-xl text-center border transition-all ${
                          selectedTier === key
                            ? 'bg-primary/10 border-primary/40 shadow-lg'
                            : 'bg-surface-container-highest border-outline-variant/20'
                        }`}
                      >
                        <p className={`text-xs font-bold ${selectedTier === key ? 'text-primary' : 'text-on-surface'}`}>
                          {key === "short" ? "4h" : key === "medium" ? "8h" : "24h"}
                        </p>
                        <p className="text-[9px] text-on-surface-variant mt-0.5">~{config.baseGold}g</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Selector */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    Choose a Pet ({availablePets.length} available)
                  </p>
                  {availablePets.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-3xl text-secondary/30 block mb-2">pets</span>
                      <p className="text-xs text-secondary">No available pets. Earn pets via streaks!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availablePets.map(pet => {
                        const rc = RARITY_COLORS[pet.rarity];
                        const isSelected = selectedPetId === pet.id;
                        return (
                          <button
                            key={pet.id}
                            onClick={() => { setSelectedPetId(pet.id); playClick(); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isSelected ? `${rc.bg} ${rc.border} shadow-lg` : 'bg-surface-container-highest border-outline-variant/20'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rc.bg}`}>
                              <span className={`material-symbols-outlined ${rc.text}`}>{pet.icon}</span>
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-bold text-on-surface">{pet.name}</p>
                              <p className={`text-[9px] uppercase font-bold tracking-widest ${rc.text}`}>{pet.rarity}</p>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <m.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSendAdventure}
                  disabled={!selectedPetId}
                  className="w-full bg-primary text-on-primary font-bold tracking-widest uppercase py-4 rounded-xl disabled:opacity-40 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(var(--color-primary),0.4)]"
                >
                  Send on Adventure
                </m.button>
              </>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, document.body);
};
