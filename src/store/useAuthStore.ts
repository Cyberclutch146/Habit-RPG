import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';

interface AuthStore {
  fbUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  isGuest: boolean;
  
  initAuthListener: () => void;
  logout: () => Promise<void>;
  setSessionType: (isTemp: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  fbUser: null,
  loading: false,
  initialized: false,
  isGuest: false,

  initAuthListener: () => {
    onAuthStateChanged(auth, (user) => {
      const isActuallyGuest = user?.isAnonymous || false;
      set({ fbUser: user, initialized: true, loading: false, isGuest: isActuallyGuest });
    });
  },

  setSessionType: async (isTemp: boolean) => {
    await setPersistence(auth, isTemp ? browserSessionPersistence : browserLocalPersistence);
  },

  logout: async () => {
    const user = get().fbUser;
    
    // Wipe guest data if logging out
    if (user && user.isAnonymous) {
      try {
        const token = await user.getIdToken();
        await fetch('/api/auth/wipe-guest', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to wipe guest data", err);
      }
    }

    await signOut(auth);
    set({ fbUser: null, isGuest: false });
  }
}));
