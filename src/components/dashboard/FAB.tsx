import React from 'react';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-28 right-6 w-14 h-14 bg-gradient-to-tr from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(220,38,38,0.4)] text-white hover:scale-105 active:scale-90 active:rotate-[15deg] transition-all duration-300 z-40 border border-red-400/30 group"
    >
      <span className="material-symbols-outlined font-light text-3xl group-hover:rotate-90 transition-transform duration-300 text-white drop-shadow-md">
        add
      </span>
    </button>
  );
};
