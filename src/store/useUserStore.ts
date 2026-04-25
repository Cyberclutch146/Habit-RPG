import { create } from 'zustand';
import { User, userSchema } from '../lib/db';
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
          try {
            const parsedUser = userSchema.parse({ id: docSnap.id, ...docSnap.data() });
            // TODO: Remove this override — infinite gold for testing
            parsedUser.gold = 999999;
            set({ user: parsedUser, loading: false });
          } catch (e) {
            console.error("Zod Validation Failed on User fetch:", e);
            // Even if poorly formed, we don't crash unconditionally, but maybe pass default user
            set({ user: { ...docSnap.data(), id: docSnap.id } as User, loading: false });
          }
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
