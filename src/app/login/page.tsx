"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signInWithCustomToken
} from 'firebase/auth';
import { UsersDB } from '../../lib/db';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';

// For simplicity, hardcoding to localhost during dev. 
// In prod, this should use process.env.NEXT_PUBLIC_API_URL
const API_URL = 'http://localhost:5000/api/auth';

export default function Login() {
  const [step, setStep] = useState<'base' | 'otp'>('base');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const setSessionType = useAuthStore(s => s.setSessionType);
  const authInitialized = useAuthStore(s => s.initialized);
  const user = useUserStore(s => s.user);
  
  useEffect(() => {
    if (authInitialized && user) {
      router.push('/dashboard');
    }
  }, [authInitialized, user, router]);

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await setSessionType(false); // Make sure it's permanent
      const result = await signInWithPopup(auth, googleProvider);
      const existingUser = await UsersDB.get(result.user.uid);
      
      if (!existingUser) {
        await UsersDB.create(result.user.uid, {
          id: result.user.uid,
          name: result.user.displayName || 'Hero',
          email: result.user.email || '',
          level: 1,
          xp: 0,
          hp: 100,
          maxHp: 100,
          gold: 0,
          class: 'none',
          streak: 0,
          lastCheckInDate: null,
          theme: 'light',
          unlockedThemes: ['light'],
          inventory: [],
          skillPoints: 0,
          unlockedSkills: []
        });
      }
      
      setTimeout(() => router.push('/'), 500);
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Google sign-in was interrupted.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    const isConfirmed = window.confirm("WARNING: Playing as Guest!\n\nAll your XP, Gold, and Progress will be lost when you close the browser. Are you sure?");
    if (!isConfirmed) return;

    setLoading(true);
    setError('');
    try {
      await setSessionType(true); // Temporary session
      const result = await signInAnonymously(auth);
      const existingUser = await UsersDB.get(result.user.uid);
      
      if (!existingUser) {
        await UsersDB.create(result.user.uid, {
          id: result.user.uid,
          name: 'Guest Player',
          email: '',
          level: 1,
          xp: 0,
          hp: 100,
          maxHp: 100,
          gold: 0,
          class: 'none',
          streak: 0,
          lastCheckInDate: null,
          theme: 'light',
          unlockedThemes: ['light'],
          inventory: [],
          skillPoints: 0,
          unlockedSkills: []
        });
      }
      
      setTimeout(() => router.push('/'), 500);
    } catch (err: any) {
      console.error(err);
      setError('Guest authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (step === 'base') {
        if (isRegister) {
          // 1. SEND OTP via Backend
          const res = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to send OTP");
          
          setMessage(data.message || "OTP Sent! Check your email.");
          setStep('otp');
        } else {
          // Standard Firebase Login
          await setSessionType(false);
          await signInWithEmailAndPassword(auth, email, password);
          setTimeout(() => router.push('/'), 500);
        }
      } else if (step === 'otp') {
        // 2. VERIFY OTP via Backend
        const res = await fetch(`${API_URL}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "OTP Verification Failed");
        
        const jwt = data.token;

        // 3. COMPLETE REGISTRATION via Backend
        const regRes = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: jwt, password, username: name })
        });
        const regData = await regRes.json();

        if (!regRes.ok) throw new Error(regData.error || "Registration Failed");

        // Use Custom Token to log into Firebase
        await setSessionType(false);
        const cred = await signInWithCustomToken(auth, regData.customToken);

        // Initialize user RPG profile
        await UsersDB.create(cred.user.uid, {
          id: cred.user.uid,
          name: name || 'Hero',
          email,
          level: 1,
          xp: 0,
          hp: 100,
          maxHp: 100,
          gold: 0,
          class: 'none',
          streak: 0,
          lastCheckInDate: null,
          theme: 'light',
          unlockedThemes: ['light'],
          inventory: [],
          skillPoints: 0,
          unlockedSkills: []
        });

        setTimeout(() => router.push('/'), 500);
      }
    } catch (err: any) {
      console.error(err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Cannot reach the auth server. Please make sure the backend is running (npm start in /server).');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-body overflow-hidden min-h-screen relative flex flex-col items-center justify-center">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

      <main className="relative z-20 w-full max-w-md px-6 flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center mb-8 animate-float">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-indigo-500 rotate-3 bento-card">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <h1 className="text-5xl font-headline font-black tracking-tight text-slate-800">
            Habit<span className="text-indigo-500">Quest</span>
          </h1>
          <p className="mt-3 font-medium text-slate-500 text-lg">Level up your real life.</p>
        </div>

        {/* Floating Glass Auth Panel */}
        <div className="w-full bg-white/90 backdrop-blur-xl border border-white/40 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] relative z-20">
          
          <h2 className="text-xl font-headline font-bold text-slate-800 mb-6 text-center">
            {step === 'otp' ? "Verify Your Email" : (isRegister ? "Create a New Hero" : "Welcome Back!")}
          </h2>
          
          <form className="flex flex-col gap-4" onSubmit={handleAuthSubmit}>
            {error && (
              <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center font-medium text-sm shadow-sm animate-pulse">
                {error}
              </div>
            )}
            {message && (
              <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center font-medium text-sm shadow-sm">
                {message}
              </div>
            )}
            
            {step === 'base' && (
              <>
                {isRegister && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">Hero Name</label>
                    <input
                      className="bg-slate-50 border border-slate-200 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-2xl placeholder:text-slate-400 font-medium"
                      type="text"
                      placeholder="e.g. ArcaneCoder"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 ml-2">Email</label>
                  <input
                    className="bg-slate-50 border border-slate-200 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-2xl placeholder:text-slate-400 font-medium"
                    type="email"
                    placeholder="hero@quest.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 ml-2">Password</label>
                  <input
                    className="bg-slate-50 border border-slate-200 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-2xl placeholder:text-slate-400 font-medium"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {step === 'otp' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-600 ml-2 text-center">Enter 6-Digit Code</label>
                <input
                  className="bg-slate-50 border border-slate-200 px-4 py-6 text-center tracking-[0.5em] text-3xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all rounded-2xl placeholder:text-slate-300"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-indigo-500 py-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] hover:bg-indigo-600 hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(99,102,241,0.7)] text-white font-bold text-lg btn-bouncy disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 
                 step === 'otp' ? 'Verify Code' : (isRegister ? "Start Questing" : "Enter Realm")}
              </span>
            </button>
            
            {step === 'otp' && (
              <button 
                type="button"
                onClick={() => setStep('base')}
                className="text-sm font-bold text-slate-400 hover:text-slate-700 mt-2 transition-colors"
              >
                ← Back
              </button>
            )}
          </form>

          {step === 'base' && (
             <div className="mt-8 flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm font-bold text-indigo-500 hover:text-indigo-600 text-center transition-colors"
              >
                {isRegister ? "Already a hero? Log In" : "Need an account? Register"}
              </button>
              
              <div className="flex items-center w-full my-2 gap-3 opacity-50">
                <div className="flex-1 h-[2px] bg-slate-200 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Or</span>
                <div className="flex-1 h-[2px] bg-slate-200 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="py-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl shadow-sm btn-bouncy flex items-center justify-center gap-2 font-bold text-sm text-slate-700"
                >
                  <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4 grayscale opacity-70" />
                  Google
                </button>

                <button 
                  type="button"
                  onClick={handleGuestAuth}
                  disabled={loading}
                  className="py-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl shadow-sm btn-bouncy flex items-center justify-center gap-2 font-bold text-sm text-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">person_off</span>
                  Guest
                </button>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
