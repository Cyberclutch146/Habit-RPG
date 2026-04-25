import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../store/useHabitStore';
import ReactDOM from 'react-dom';

export const MorningReport: React.FC = () => {
  const { auditResult, setAuditResult } = useHabitStore();
  const [isClosing, setIsClosing] = useState(false);

  if (!auditResult && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setAuditResult(null);
      setIsClosing(false);
    }, 500); // Wait for exit animation
  };

  const tookDamage = auditResult?.damageTaken ? auditResult.damageTaken > 0 : false;
  const shielded = auditResult?.shieldsUsed ? auditResult.shieldsUsed > 0 : false;

  const portalContent = (
    <AnimatePresence>
      {!isClosing && auditResult && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center pointer-events-auto p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          />

          <m.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md bg-surface-container rounded-3xl p-8 border border-outline-variant/20 shadow-2xl overflow-hidden"
          >
            {/* Conditional background glow based on damage/shield */}
            {tookDamage && !shielded && (
                <div className="absolute top-0 inset-x-0 h-32 bg-rose-500/10 blur-2xl rounded-t-3xl" />
            )}
            {shielded && (
                <div className="absolute top-0 inset-x-0 h-32 bg-amber-500/10 blur-2xl rounded-t-3xl" />
            )}

            <div className="text-center mb-8 relative">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  tookDamage && !shielded ? 'bg-rose-500/20 text-rose-500' :
                  shielded ? 'bg-amber-500/20 text-amber-500' :
                  'bg-emerald-500/20 text-emerald-500'
              }`}>
                <span className="material-symbols-outlined text-4xl">
                  {tookDamage && !shielded ? 'local_fire_department' :
                   shielded ? 'shield' :
                   'wb_sunny'}
                </span>
              </div>
              
              <h2 className="text-2xl font-black text-on-surface mb-2">
                {tookDamage ? 'Shadow Report' : 'Morning Report'}
              </h2>
              <p className="text-on-surface-variant text-sm">
                {tookDamage && !shielded ? 'The night was long, and your resolve waned.' : 
                 shielded ? 'You faltered, but an ancient shield protected your streak!' :
                 'A new day dawns. You are fully rested.'}
              </p>
            </div>

            {(tookDamage || shielded) && (
                <div className="bg-surface-container-high rounded-2xl p-4 mb-8 space-y-4">
                  {tookDamage && (
                      <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant font-medium">HP Lost</span>
                          <span className="text-xl font-black text-rose-500">-{auditResult.damageTaken} HP</span>
                      </div>
                  )}
                  {shielded && (
                      <div className="flex justify-between items-center border-t border-outline-variant/10 pt-4">
                          <span className="text-on-surface-variant font-medium">Streak Shield</span>
                          <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full px-2 uppercase tracking-wide">
                              Consumed
                          </span>
                      </div>
                  )}
                  {tookDamage && !shielded && (
                      <div className="flex justify-between items-center border-t border-outline-variant/10 pt-4">
                          <span className="text-on-surface-variant font-medium">Streak</span>
                          <span className="text-sm font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full px-2 uppercase tracking-wide">
                              Broken
                          </span>
                      </div>
                  )}
                </div>
            )}

            <button 
              onClick={handleClose}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-primary-container active:scale-95 transition-all"
            >
              Acknowledge
            </button>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(portalContent, document.body) : null;
};
