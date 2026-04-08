import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useUserStore(state => state.user);
  const fbUser = useAuthStore(state => state.fbUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <TopBar />
      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-8 min-h-screen">
        <h2 className="text-3xl font-headline font-black uppercase text-on-surface tracking-tighter">Command Center</h2>
        
        <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/20 shadow-xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-primary-container overflow-hidden shrink-0">
            <img 
              alt="Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgJ832t47qpRtVNwYjLqGd3QOFUgoAHtfSxevqaWt-Y0idnUoIPTkCdV0PLK0dqBaFAsTH-xPEW7Rw518sg9klYDMEoMkt11mT4sB-GRC8baN1FenNpE5M7rucXFi-tA1cQtUqTq3qewrRoneC882YAq0DwYMKGuGlDYXgDxkXY-RL5NGarYNT_CG-7ozIcRnqJsAYI93IBzY08ODtC8ec8S_ronwxynNH_uf9EyaJucsg_PuhYeRZz86M2hKn-LSta8iS8xn1-as"
            />
          </div>
          <div>
            <h3 className="text-2xl font-black text-on-surface uppercase">{user?.name || 'Agent'}</h3>
            <p className="text-sm font-label text-secondary tracking-widest uppercase">{fbUser?.email}</p>
          </div>
        </div>

        <div className="space-y-4 pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black font-label tracking-[0.2em] text-red-500 uppercase">System Integrity</h3>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface rounded-lg font-headline font-black uppercase tracking-widest text-sm transition-all focus:outline-none"
          >
            Disconnect from Matrix
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  );
};
