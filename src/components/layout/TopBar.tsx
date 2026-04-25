"use client";

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useRouter, usePathname } from 'next/navigation';
import { usersService } from '../../lib/services/users';
import { gameEngine } from '../../lib/gameEngine';

const THEME_META: Record<string, { label: string; icon: string; color: string; glow: string }> = {
  dark: { label: 'Default', icon: 'light_mode', color: 'text-slate-400', glow: '' },
  crimson: { label: 'Crimson', icon: 'whatshot', color: 'text-red-500', glow: 'shadow-[0_0_8px_rgba(220,38,38,0.4)]' },
  abyssal: { label: 'Abyssal', icon: 'water', color: 'text-cyan-400', glow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]' },
  cyberpunk: { label: 'Cyberpunk', icon: 'electric_bolt', color: 'text-fuchsia-400', glow: 'shadow-[0_0_8px_rgba(232,121,249,0.4)]' },
};

export default function TopBar() {
  const user = useUserStore(state => state.user);
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  if (!user) return null;
  const streak = user?.streak || 0;
  const currentTheme = user?.theme || 'dark';
  const unlocked = user?.unlockedThemes || ['dark'];
  const themeOptions = ['dark', ...unlocked.filter((t: string) => t !== 'dark')];
  const xpPercent = Math.min((user.xp / gameEngine.getXPForNextLevel(user.level)) * 100, 100);

  const handleSwitchTheme = async (theme: string) => {
    if (!user) return;
    useUserStore.setState({ user: { ...user, theme } });
    await usersService.updateProfile(user.id, { theme });
    setMenuOpen(false);
  };

  const navItems = [
    { href: '/dashboard', label: 'Quests', icon: 'swords' },
    { href: '/boss', label: 'Bosses', icon: 'skull' },
    { href: '/vault', label: 'Shop', icon: 'storefront' },
  ];

  return (
    <header className="topbar-root">
      {/* Left: Logo */}
      <div 
        className="topbar-logo" 
        onClick={() => router.push('/dashboard')}
      >
        <div className="topbar-logo-icon">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>
            rocket_launch
          </span>
        </div>
        <span className="topbar-logo-text">
          Habit<span className="topbar-logo-accent">Quest</span>
        </span>
      </div>

      {/* Center: Navigation */}
      <nav className="topbar-nav">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`topbar-nav-item ${isActive ? 'topbar-nav-active' : ''}`}
            >
              <span 
                className="material-symbols-outlined topbar-nav-icon" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="topbar-nav-label">{item.label}</span>
              {isActive && <div className="topbar-nav-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Right: Stats + Profile */}
      <div className="topbar-right">
        {/* Streak */}
        <div className="topbar-stat topbar-streak">
          <span className="material-symbols-outlined topbar-stat-icon" style={{ fontVariationSettings: "'FILL' 1", color: '#f43f5e' }}>
            local_fire_department
          </span>
          <span className="topbar-stat-value">{streak}</span>
        </div>

        {/* Gold */}
        <div className="topbar-stat topbar-gold">
          <span className="material-symbols-outlined topbar-stat-icon" style={{ fontVariationSettings: "'FILL' 1", color: '#f59e0b' }}>
            monetization_on
          </span>
          <span className="topbar-stat-value">{user.gold.toLocaleString()}</span>
        </div>

        {/* Level + XP */}
        <div className="topbar-level-badge" onClick={() => router.push('/stats')}>
          <span className="topbar-level-number">Lv.{user.level}</span>
          <div className="topbar-xp-track">
            <div className="topbar-xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button 
            className="topbar-avatar"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="topbar-dropdown">
              {/* User info header */}
              <div className="topbar-dropdown-header">
                <div className="topbar-dropdown-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>person</span>
                </div>
                <div>
                  <p className="topbar-dropdown-name">{user.name}</p>
                  <p className="topbar-dropdown-class">{user.class && user.class !== 'none' ? user.class.charAt(0).toUpperCase() + user.class.slice(1) : 'No Class'} · Level {user.level}</p>
                </div>
              </div>

              <div className="topbar-dropdown-divider" />

              {/* Navigation items */}
              <button
                onClick={() => { router.push('/stats'); setMenuOpen(false); }}
                className="topbar-dropdown-item"
              >
                <span className="material-symbols-outlined topbar-dropdown-item-icon" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                Profile & Stats
              </button>

              <button
                onClick={() => { router.push('/settings'); setMenuOpen(false); }}
                className="topbar-dropdown-item"
              >
                <span className="material-symbols-outlined topbar-dropdown-item-icon">settings</span>
                Settings
              </button>

              <div className="topbar-dropdown-divider" />

              {/* Theme selector */}
              <div className="topbar-dropdown-section-label">Theme</div>

              <div className="topbar-theme-grid">
                {themeOptions.map((theme: string) => {
                  const meta = THEME_META[theme] || { label: theme, icon: 'palette', color: 'text-slate-400', glow: '' };
                  const isActive = currentTheme === theme;
                  return (
                    <button
                      key={theme}
                      onClick={() => handleSwitchTheme(theme)}
                      className={`topbar-theme-option ${isActive ? 'topbar-theme-active' : ''}`}
                      title={meta.label}
                    >
                      <span 
                        className={`material-symbols-outlined ${meta.color}`}
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}
                      >
                        {meta.icon}
                      </span>
                      <span className="topbar-theme-label">{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {themeOptions.length <= 1 && (
                <div className="topbar-dropdown-hint">
                  Unlock themes in the Shop →
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
