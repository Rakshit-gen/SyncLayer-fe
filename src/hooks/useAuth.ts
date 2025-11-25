'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, fetchUser, setUser } = useAuthStore();

  useEffect(() => {
    if (session?.user?.email && !user) {
      fetchUser(session.user.email);
    }
  }, [session, user, fetchUser]);

  return {
    user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    userId: (session as any)?.userId || user?.id,
  };
}

export default useAuth;
