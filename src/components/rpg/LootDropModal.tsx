"use client";
import { useJuiceStore } from "../../store/useJuiceStore";
import { m, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { useEffect, useState } from "react";

const RARITY_CONFIG = {
  common: { color: "#94a3b8", glow: "0 0 40px rgba(148,163,184,0.5)", label: "Common", bg: "from-slate-800 to-slate-900" },
  rare: { color: "#60a5fa", glow: "0 0 60px rgba(96,165,250,0.6)", label: "Rare", bg: "from-blue-900 to-slate-900" },
  epic: { color: "#a78bfa", glow: "0 0 80px rgba(167,139,250,0.7)", label: "Epic", bg: "from-purple-900 to-slate-900" },
  legendary: { color: "#fbbf24", glow: "0 0 100px rgba(251,191,36,0.8)", label: "Legendary", bg: "from-amber-900 to-slate-900" },
};

const TYPE_ICONS: Record<string, string> = {
  weapon: "swords",
  armor: "shield",
  artifact: "diamond",
};

// Particle component for celebration effect
function Particles({ color }: { color: string }) {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      scale: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
    }))
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <m.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function LootDropModal() {
  const lootDropItem = useJuiceStore((s) => s.lootDropItem);
  const petUnlockItem = useJuiceStore((s) => s.petUnlockItem);
  const dismissLootDrop = useJuiceStore((s) => s.dismissLootDrop);
  const dismissPetUnlock = useJuiceStore((s) => s.dismissPetUnlock);
  const { playLootDrop } = useSoundEffects();

  // Play sound on loot/pet appear
  useEffect(() => {
    if (lootDropItem || petUnlockItem) playLootDrop();
  }, [lootDropItem, petUnlockItem, playLootDrop]);

  return (
    <AnimatePresence>
      {/* Loot Drop Modal */}
      {lootDropItem && (() => {
        const cfg = RARITY_CONFIG[lootDropItem.rarity];
        const icon = TYPE_ICONS[lootDropItem.type] || "inventory_2";
        return (
          <m.div
            key="loot-modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissLootDrop}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Particles */}
            <Particles color={cfg.color} />

            {/* Card */}
            <m.div
              className={`relative z-10 bg-gradient-to-b ${cfg.bg} rounded-3xl p-8 max-w-sm w-full text-center border border-white/10`}
              style={{ boxShadow: cfg.glow }}
              initial={{ scale: 0.3, y: 50, rotateX: -20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Source label */}
              <m.p
                className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {lootDropItem.source === "boss" ? `💀 ${lootDropItem.sourceName} Defeated!` : `🎯 ${lootDropItem.sourceName} Complete!`}
              </m.p>

              {/* Rarity badge */}
              <m.div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                style={{ backgroundColor: cfg.color + "30", color: cfg.color, border: `1px solid ${cfg.color}50` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {cfg.label}
              </m.div>

              {/* Item icon with pulse glow */}
              <m.div
                className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-6 relative"
                style={{ backgroundColor: cfg.color + "15", border: `2px solid ${cfg.color}40` }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 12 }}
              >
                <m.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ backgroundColor: cfg.color + "10" }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="material-symbols-outlined relative z-10" style={{ fontSize: 48, color: cfg.color }}>
                  {icon}
                </span>
              </m.div>

              {/* Item name */}
              <m.h2
                className="text-2xl font-black text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {lootDropItem.name}
              </m.h2>

              {/* Stat bonus */}
              {lootDropItem.statBonus && (
                <m.p
                  className="text-sm font-mono mb-6"
                  style={{ color: cfg.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ⚡ {lootDropItem.statBonus}
                </m.p>
              )}

              {/* Dismiss */}
              <m.button
                className="w-full py-3 rounded-xl text-white/70 text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={dismissLootDrop}
              >
                Tap to continue
              </m.button>
            </m.div>
          </m.div>
        );
      })()}

      {/* Pet Unlock Modal */}
      {petUnlockItem && (() => {
        const cfg = RARITY_CONFIG[petUnlockItem.rarity];
        return (
          <m.div
            key="pet-modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissPetUnlock}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <Particles color={cfg.color} />

            <m.div
              className={`relative z-10 bg-gradient-to-b ${cfg.bg} rounded-3xl p-8 max-w-sm w-full text-center border border-white/10`}
              style={{ boxShadow: cfg.glow }}
              initial={{ scale: 0.3, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <m.p
                className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🐾 New Companion Unlocked!
              </m.p>

              <m.div
                className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: cfg.color + "20", border: `3px solid ${cfg.color}60` }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 12 }}
              >
                <m.div
                  className="absolute w-28 h-28 rounded-full"
                  style={{ border: `2px solid ${cfg.color}30` }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="material-symbols-outlined relative z-10" style={{ fontSize: 56, color: cfg.color }}>
                  {petUnlockItem.icon}
                </span>
              </m.div>

              <m.h2
                className="text-2xl font-black text-white mb-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {petUnlockItem.name}
              </m.h2>

              <m.p
                className="text-sm mb-2"
                style={{ color: cfg.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {petUnlockItem.description}
              </m.p>

              <m.p
                className="text-xs text-white/40 italic mb-6 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                &ldquo;{petUnlockItem.lore}&rdquo;
              </m.p>

              <m.button
                className="w-full py-3 rounded-xl text-white/70 text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={dismissPetUnlock}
              >
                Welcome, friend!
              </m.button>
            </m.div>
          </m.div>
        );
      })()}
    </AnimatePresence>
  );
}
