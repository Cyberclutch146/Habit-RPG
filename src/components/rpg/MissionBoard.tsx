"use client";
import { m, AnimatePresence } from "framer-motion";
import { useMissionStore } from "../../store/useMissionStore";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import type { Mission } from "../../lib/missions";

const RARITY_STYLES: Record<string, { border: string, bg: string, text: string, accent: string }> = {
  common: { border: "border-slate-500/30", bg: "bg-slate-800/40", text: "text-slate-300", accent: "#94a3b8" },
  rare: { border: "border-blue-500/30", bg: "bg-blue-900/20", text: "text-blue-300", accent: "#60a5fa" },
  epic: { border: "border-purple-500/30", bg: "bg-purple-900/20", text: "text-purple-300", accent: "#a78bfa" },
  legendary: { border: "border-amber-500/30", bg: "bg-amber-900/15", text: "text-amber-300", accent: "#fbbf24" },
};

function MissionCard({ mission, onClaim }: { mission: Mission, onClaim: () => void }) {
  const rs = RARITY_STYLES[mission.rarity];
  const progress = Math.min(mission.progress / mission.maxProgress, 1);

  return (
    <m.div
      className={`rounded-2xl border p-4 ${rs.border} ${rs.bg} ${
        mission.status === "claimed" ? "opacity-50" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mission.status === "claimed" ? 0.5 : 1, y: 0 }}
      layout
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: rs.accent + "15", border: `1px solid ${rs.accent}30` }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: rs.accent }}>
            {mission.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm">{mission.title}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${rs.text}`}
              style={{ backgroundColor: rs.accent + "15" }}>
              {mission.rarity}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{mission.description}</p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span>{mission.requirement}</span>
              <span className={rs.text}>{mission.progress}/{mission.maxProgress}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <m.div
                className="h-full rounded-full"
                style={{ backgroundColor: rs.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Reward line & action */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-white/40">
              🎁 {mission.rewardText}
            </span>
            {mission.status === "claimable" && (
              <m.button
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-black"
                style={{ backgroundColor: rs.accent }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClaim}
              >
                Claim
              </m.button>
            )}
            {mission.status === "claimed" && (
              <span className="text-xs text-green-400/70 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                Claimed
              </span>
            )}
          </div>
        </div>
      </div>
    </m.div>
  );
}

export default function MissionBoard() {
  const { missions, isBoardOpen, closeBoard, claimReward } = useMissionStore();
  const { playClick, playSuccess } = useSoundEffects();

  const activeMissions = missions.filter(m => m.status === "active" || m.status === "claimable");
  const claimedMissions = missions.filter(m => m.status === "claimed");

  const handleClaim = async (id: string) => {
    playSuccess();
    await claimReward(id);
  };

  return (
    <AnimatePresence>
      {isBoardOpen && (
        <m.div
          className="fixed inset-0 z-[900] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeBoard} />

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
                  <span className="material-symbols-outlined text-purple-400" style={{ fontSize: 24 }}>assignment</span>
                  Mission Board
                </h2>
                <p className="text-xs text-white/40 mt-1">
                  Complete missions for bonus rewards
                </p>
              </div>
              <button onClick={() => { playClick(); closeBoard(); }} className="text-white/40 hover:text-white transition-colors p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Active Missions */}
            <div className="p-5 space-y-3">
              {activeMissions.length > 0 ? (
                activeMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} onClaim={() => handleClaim(mission.id)} />
                ))
              ) : (
                <div className="text-center py-8 text-white/30 text-sm">
                  <span className="material-symbols-outlined block mb-2" style={{ fontSize: 40 }}>emoji_events</span>
                  All missions complete! Check back later.
                </div>
              )}
            </div>

            {/* Completed Section */}
            {claimedMissions.length > 0 && (
              <div className="px-5 pb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-3">Completed</p>
                <div className="space-y-2">
                  {claimedMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} onClaim={() => {}} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 text-center">
              <p className="text-[11px] text-white/30">
                💡 Missions reset progress based on your habit logs
              </p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
