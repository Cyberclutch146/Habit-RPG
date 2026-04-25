"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSoundEffects } from '../../hooks/useSoundEffects';

export default function BottomNav() {
  const { playClick } = useSoundEffects();
  const pathname = usePathname();

  const navItems = [
    { path: '/dashboard', icon: 'swords', defaultPath: true },
    { path: '/boss', icon: 'skull' },
    { path: '/vault', icon: 'storefront' },
    { path: '/stats', icon: 'person' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-4 bg-white/90 backdrop-blur-xl border-t border-slate-200">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.defaultPath && pathname === '/');
        
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => playClick()}
            className={`flex flex-col items-center justify-center w-full transition-all relative ${
              isActive
                ? 'text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 w-8 h-1 bg-indigo-500 rounded-b-full"></div>
            )}
            <div className={`mt-3 flex items-center justify-center w-12 h-12 rounded-full transition-all ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
              <span 
                className="material-symbols-outlined text-[24px]" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
