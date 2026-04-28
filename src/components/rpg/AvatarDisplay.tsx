"use client";
import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import { PET_ROSTER } from '../../lib/gameEngine';

interface AvatarDisplayProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const RARITY_GLOW: Record<string, string> = {
  common: "",
  rare: "drop-shadow(0 0 8px rgba(59,130,246,0.5))",
  epic: "drop-shadow(0 0 12px rgba(168,85,247,0.6))",
  legendary: "drop-shadow(0 0 16px rgba(234,179,8,0.7))",
};

const RARITY_RING: Record<string, string> = {
  common: "stroke-slate-400",
  rare: "stroke-blue-400",
  epic: "stroke-purple-400",
  legendary: "stroke-yellow-400",
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ size = "md", showName = false }) => {
  const user = useUserStore(state => state.user);
  if (!user) return null;

  const dims = size === "lg" ? 160 : size === "md" ? 96 : 48;
  const iconSize = size === "lg" ? "text-6xl" : size === "md" ? "text-4xl" : "text-xl";
  const weaponSize = size === "lg" ? 40 : size === "md" ? 28 : 16;
  const petSize = size === "lg" ? 36 : size === "md" ? 24 : 14;

  // Determine highest rarity from equipped gear
  const getEquippedRarity = (): string => {
    const items = user.inventory || [];
    const equipped = items.filter(i => 
      i.id === user.equippedWeapon || i.id === user.equippedArmor
    );
    if (equipped.some(i => i.rarity === "legendary")) return "legendary";
    if (equipped.some(i => i.rarity === "epic")) return "epic";
    if (equipped.some(i => i.rarity === "rare")) return "rare";
    return "common";
  };

  const gearRarity = getEquippedRarity();
  const equippedPet = PET_ROSTER.find(p => p.id === user.equippedPet);

  // Class-based body color
  const classColor = user.class === "warrior" ? "#ef4444" : user.class === "mage" ? "#8b5cf6" : user.class === "rogue" ? "#22c55e" : "#6366f1";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dims, height: dims, filter: RARITY_GLOW[gearRarity] }}>
        <svg viewBox="0 0 100 100" width={dims} height={dims}>
          {/* Background ring */}
          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="3" className={RARITY_RING[gearRarity]} strokeDasharray={gearRarity === "legendary" ? "6 3" : "none"}>
            {gearRarity === "legendary" && (
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite" />
            )}
          </circle>

          {/* Body circle */}
          <circle cx="50" cy="50" r="42" fill="var(--md-sys-color-surface-container-highest)" />

          {/* Armor layer (behind body) */}
          {user.equippedArmor && (
            <circle cx="50" cy="50" r="38" fill="none" stroke={classColor} strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
          )}

          {/* Class emblem */}
          <text x="50" y="42" textAnchor="middle" fontSize="10" fill={classColor} fontWeight="bold" fontFamily="monospace">
            {user.class === "warrior" ? "⚔" : user.class === "mage" ? "✦" : user.class === "rogue" ? "◆" : "●"}
          </text>
        </svg>

        {/* Character icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`material-symbols-outlined ${iconSize} text-on-surface`} style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
        </div>

        {/* Weapon indicator */}
        {user.equippedWeapon && (
          <div 
            className="absolute bg-amber-500/90 rounded-full flex items-center justify-center shadow-lg border-2 border-surface"
            style={{ width: weaponSize, height: weaponSize, right: -4, bottom: size === "sm" ? -2 : 4 }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: weaponSize * 0.55 }}>swords</span>
          </div>
        )}

        {/* Pet companion */}
        {equippedPet && (
          <div 
            className={`absolute rounded-full flex items-center justify-center shadow-lg border-2 border-surface ${
              equippedPet.rarity === "legendary" ? "bg-amber-500/90" : equippedPet.rarity === "epic" ? "bg-purple-500/90" : equippedPet.rarity === "rare" ? "bg-blue-500/90" : "bg-slate-500/90"
            }`}
            style={{ width: petSize, height: petSize, left: -4, bottom: size === "sm" ? -2 : 4 }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: petSize * 0.55 }}>{equippedPet.icon}</span>
          </div>
        )}
      </div>

      {showName && (
        <div className="text-center">
          <p className="font-black text-on-surface tracking-tighter uppercase">{user.name || "HERO"}</p>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: classColor }}>
            {user.class !== "none" ? user.class : "Classless"} · LVL {user.level}
          </p>
        </div>
      )}
    </div>
  );
};
