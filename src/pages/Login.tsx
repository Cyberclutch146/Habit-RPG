import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UsersDB } from '../lib/db';
import { ParticleBackground } from '../components/animations/ParticleBackground';
import { SpotlightCard } from '../components/animations/SpotlightCard';
import { GlitchText } from '../components/animations/GlitchText';
import { AnimatedText } from '../components/animations/AnimatedText';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existingUser = await UsersDB.get(result.user.uid);
      
      if (!existingUser) {
        await UsersDB.create(result.user.uid, {
          id: result.user.uid,
          name: result.user.displayName || 'Commander',
          email: result.user.email || '',
          level: 1,
          xp: 0,
          streak: 0,
          lastCheckInDate: null
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Connection severed by command.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Initialize user doc
        await UsersDB.create(cred.user.uid, {
          id: cred.user.uid,
          name: name || 'Commander',
          email,
          level: 1,
          xp: 0,
          streak: 0,
          lastCheckInDate: null
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Hero credential already claimed.');
      else if (err.code === 'auth/wrong-password') setError('Access denied. Invalid cipher.');
      else if (err.code === 'auth/user-not-found') setError('Hero not discovered in the archives.');
      else setError('Authentication failed. Matrix compromised.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body overflow-hidden min-h-screen relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        <div className="absolute inset-0 kinetic-gradient" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-between min-h-screen px-6 py-16 md:py-24">
        
        <div className="w-full max-w-lg text-center flex flex-col items-center">
          <div className="mb-4">
            <span className="material-symbols-outlined text-primary-container text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          </div>
          <GlitchText text="ASCEND" className="text-6xl md:text-8xl font-headline font-black tracking-tighter uppercase italic text-on-surface text-glow leading-none" />
          <div className="mt-2 inline-block px-4 py-1 bg-primary-container/10 border border-primary-container/20 rounded-sm">
            <p className="font-label text-xs tracking-[0.2em] uppercase font-bold text-primary">Level up your real life</p>
          </div>
        </div>

        <div className="w-full max-w-md mt-8 mb-8 z-10 block">
          <SpotlightCard className="bg-surface-container-highest/80 backdrop-blur-xl p-8 rounded-xl border border-outline-variant/30 w-full overflow-hidden">
            <div className="flex justify-center w-full mb-6 relative z-10">
              <h2 className="text-xl font-headline font-black tracking-widest text-on-surface uppercase text-shadow-sm">
                <AnimatedText text={isRegister ? "Register Hero" : "Initialize Session"} />
              </h2>
            </div>
            
            <form className="flex flex-col gap-4 relative z-10" onSubmit={handleAuth}>
              {error && (
                <div className="text-secondary text-xs uppercase tracking-widest font-bold bg-secondary/10 border border-secondary/30 p-3 rounded text-center animate-pulse shadow-[0_0_15px_rgba(255,180,171,0.2)]">
                  {error}
                </div>
              )}
              
              {isRegister && (
                <input
                  className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  type="text"
                  placeholder="Hero Alias"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              
              <input
                className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                type="email"
                placeholder="Email Interface"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <input
                className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button 
                type="submit"
                disabled={loading}
                className="group relative w-full bg-primary-container py-4 mt-2 rounded-lg py-5 overflow-hidden shadow-[0_10px_30px_rgba(209,54,57,0.3)] disabled:opacity-50 active:scale-95 transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative font-headline font-black text-lg uppercase tracking-widest text-on-primary-container flex items-center justify-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : (isRegister ? "Start Game" : "Initialize")}
                </span>
              </button>
            </form>

          <button 
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full mt-4 py-3 rounded-lg border border-outline-variant hover:bg-surface-container-high hover:border-on-surface transition-all active:scale-95"
          >
            <span className="font-label font-bold text-xs uppercase tracking-widest text-secondary hover:text-on-surface">
              {isRegister ? "Switch to Login" : "Or Register"}
            </span>
          </button>
          
          <div className="flex items-center w-full my-4 gap-2">
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Oracle Links</span>
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 rounded-lg border border-primary-container/20 bg-primary-container/5 hover:bg-primary-container/10 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-label font-bold text-xs uppercase tracking-widest text-on-surface">
              Sign In With Google
            </span>
          </button>
          </SpotlightCard>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 hidden md:grid opacity-50">
          <div className="bg-surface-container-high/40 p-6 rounded-xl border border-outline-variant/10">
            <h3 className="font-headline font-black text-xs uppercase text-primary-container mb-1">Physical Might</h3>
            <p className="text-secondary text-[10px]">Turn gym sessions into raid bosses.</p>
          </div>
          <div className="bg-primary-container/10 p-6 rounded-xl border border-primary-container/30">
            <h3 className="font-headline font-black text-xs uppercase text-primary mb-1">Epic Rewards</h3>
            <p className="text-on-surface text-[10px]">Unlock legendary gear skins.</p>
          </div>
          <div className="bg-surface-container-high/40 p-6 rounded-xl border border-outline-variant/10">
            <h3 className="font-headline font-black text-xs uppercase text-primary-container mb-1">Social Guilds</h3>
            <p className="text-secondary text-[10px]">Slay procrastination together.</p>
          </div>
        </div>
      </main>

      {/* Decorative HUD */}
      <div className="fixed top-8 right-8 z-20 hidden md:flex items-center gap-4">
        <div className="text-right">
          <div className="text-[10px] font-black text-primary-container uppercase tracking-widest">Network Status</div>
          <div className="text-xs font-mono text-on-surface">{loading ? 'CONNECTING...' : 'DISCONNECTED'}</div>
        </div>
        <div className="h-10 w-[2px] bg-primary-container/30"></div>
      </div>
    </div>
  );
};
