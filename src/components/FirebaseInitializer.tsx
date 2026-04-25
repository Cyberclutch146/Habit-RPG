"use client";

import { useEffect } from 'react';
import { LazyMotion, domMax } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

export default function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  const initAuthListener = useAuthStore(state => state.initAuthListener);
  const fbUser = useAuthStore(state => state.fbUser);
  const initUserListener = useUserStore(state => state.initUserListener);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  useEffect(() => {
    const unsubscribe = initUserListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fbUser, initUserListener]);

  return <LazyMotion features={domMax} strict>{children}</LazyMotion>;
}
