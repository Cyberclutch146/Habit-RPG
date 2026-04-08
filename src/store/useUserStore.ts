import { create } from 'zustand';
import { User } from '../lib/db';
import { useAuthStore } from './useAuthStore';
import { db } from '../lib/firebase';

interface UserStore {
  user: User | null;
  loading: boolean;
  initUserListener: () => () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,

  initUserListener: () => {
    const fbUser = useAuthStore.getState().fbUser;
    if (!fbUser) {
      set({ user: null, loading: false });
      return () => {};
    }

    set({ loading: true });
    
    // We import onSnapshot directly to listen to the specific user's document
    // We could use UsersDB, but we want real-time updates.
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot, doc }) => {
      return onSnapshot(doc(db, 'users', fbUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          set({ user: docSnap.data() as User, loading: false });
        } else {
          set({ user: null, loading: false });
        }
      });
    });

    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }
}));
