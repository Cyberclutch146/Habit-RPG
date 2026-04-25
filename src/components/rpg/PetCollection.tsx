"use client";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { PET_ROSTER, RPG_Pet } from "../../lib/gameEngine";
import { useUserStore } from "../../store/useUserStore";
import { usersService } from "../../lib/services/users";
import { useSoundEffects } from "../../hooks/useSoundEffects";

const RARITY_COLORS: Record<string, { border: string, bg: string, text: string, glow: string }> = {
  common: { border: "border-slate-500/40", bg: "bg-slate-800/60", text: "text-slate-300", glow: "" },
  rare: { border: "border-blue-500/40", bg: "bg-blue-900/30", text: "text-blue-300", glow: "shadow-[0_0_20px_rgba(96,165,250,0.15)]" },
  epic: { border: "border-purple-500/40", bg: "bg-purple-900/30", text: "text-purple-300", glow: "shadow-[0_0_20px_rgba(167,139,250,0.2)]" },
  legendary: { border: "border-amber-500/40", bg: "bg-amber-900/20", text: "text-amber-300", glow: "shadow-[0_0_30px_rgba(251,191,36,0.25)]" },
};

export default function PetCollection({ onClose }: { onClose: () => void }) {
  const user = useUserStore((s) => s.user);
  const { playClick, playSuccess } = useSoundEffects();
  const [selectedPet, setSelectedPet] = useState<RPG_Pet | null>(null);
  const ownedPetIds = user?.pets || [];
  const equippedPetId = user?.equippedPet || null;

  const handleEquip = async (petId: string) => {
    if (!user) return;
    playSuccess();
    const newEquipped = equippedPetId === petId ? null : petId;
    useUserStore.setState({ user: { ...user, equippedPet: newEquipped } });
    await usersService.updateUserStats(user.id, { equippedPet: newEquipped });
  };

  return (
    <m.div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <m.div
        className="relative z-10 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 24 }}>pets</span>
              Pet Collection
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {ownedPetIds.length}/{PET_ROSTER.length} Unlocked · Earn pets through streak milestones
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Pet Grid */}
        <div className="p-5 grid grid-cols-1 gap-4">
          {PET_ROSTER.map((pet, i) => {
            const isOwned = ownedPetIds.includes(pet.id);
            const isEquipped = equippedPetId === pet.id;
            const rc = RARITY_COLORS[pet.rarity];

            return (
              <m.div
                key={pet.id}
                className={`relative rounded-2xl border p-4 transition-all cursor-pointer ${
                  isOwned
                    ? `${rc.border} ${rc.bg} ${rc.glow} ${isEquipped ? "ring-2 ring-amber-400/60" : ""}`
                    : "border-white/5 bg-white/[0.02] opacity-50 grayscale"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isOwned ? 1 : 0.5, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  playClick();
                  if (isOwned) setSelectedPet(selectedPet?.id === pet.id ? null : pet);
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Pet icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOwned ? rc.bg : "bg-white/5"
                    }`}
                    style={isOwned ? { border: `1px solid ${pet.rarity === "legendary" ? "#fbbf24" : pet.rarity === "epic" ? "#a78bfa" : pet.rarity === "rare" ? "#60a5fa" : "#94a3b8"}40` } : {}}
                  >
                    <span
                      className={`material-symbols-outlined ${isOwned ? rc.text : "text-white/20"}`}
                      style={{ fontSize: 32 }}
                    >
                      {pet.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${isOwned ? "text-white" : "text-white/30"}`}>
                        {pet.name}
                      </h3>
                      {isEquipped && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                          Equipped
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isOwned ? rc.text : "text-white/20"}`}>
                      {pet.description}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {isOwned ? (
                        <span className="italic">&ldquo;{pet.lore}&rdquo;</span>
                      ) : (
                        <>🔒 Reach a <strong>{pet.requiredStreak}-day streak</strong> to unlock</>
                      )}
                    </p>
                  </div>

                  {/* Rarity badge */}
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${rc.border} ${rc.text}`}>
                    {pet.rarity}
                  </div>
                </div>

                {/* Equip button (expanded) */}
                <AnimatePresence>
                  {isOwned && selectedPet?.id === pet.id && (
                    <m.div
                      className="mt-3 pt-3 border-t border-white/10"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(pet.id);
                        }}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isEquipped
                            ? "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                        }`}
                      >
                        {isEquipped ? "Unequip Companion" : "Equip as Companion"}
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="px-6 py-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-white/30">
            💡 Pets grant passive bonuses when equipped. Only one can be active.
          </p>
        </div>
      </m.div>
    </m.div>
  );
}
