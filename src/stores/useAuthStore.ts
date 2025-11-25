import { create } from 'zustand';
import { User, TeamRole } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  fetchUser: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  fetchUser: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.getUserByEmail(email);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper hook for permission checking
export function usePermissions(role?: TeamRole) {
  const canRead = true; // All roles can read
  const canWrite = role === 'admin' || role === 'editor';
  const canDelete = role === 'admin' || role === 'editor';
  const canManage = role === 'admin';

  return {
    canRead,
    canWrite,
    canDelete,
    canManage,
    role,
  };
}
