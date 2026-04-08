import React from 'react';
import { m, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '' }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const reducedMotion = useUserStore(state => state.user?.reducedMotion);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (reducedMotion) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative group overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      {!reducedMotion && (
        <m.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                450px circle at ${mouseX}px ${mouseY}px,
                rgba(var(--color-primary), 0.15),
                transparent 80%
              )
            `,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
