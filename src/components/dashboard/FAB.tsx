import React from 'react';
import { m } from 'framer-motion';
import { Magnet } from '../animations/Magnet';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <div className="absolute bottom-32 right-6 z-[60]">
      <Magnet strength={40}>
        <m.button
          whileTap={{ scale: 0.9, rotate: 15 }}
          whileHover={{ scale: 1.05 }}
          onClick={onClick}
          className="w-14 h-14 bg-primary text-on-primary rounded-[20px] flex items-center justify-center shadow-[0_8px_32px_rgba(var(--color-primary),0.4)] border border-inverse-surface/10 group"
        >
          <span className="material-symbols-outlined font-light text-[32px] group-hover:rotate-90 transition-transform duration-500 drop-shadow-sm">
            add
          </span>
        </m.button>
      </Magnet>
    </div>
  );
};
