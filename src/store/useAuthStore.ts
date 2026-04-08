import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthStore {
  fbUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  
  initAuthListener: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  fbUser: null,
  loading: false,
  initialized: false,

  initAuthListener: () => {
    onAuthStateChanged(auth, (user) => {
      set({ fbUser: user, initialized: true, loading: false });
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ fbUser: null });
  }
}));
