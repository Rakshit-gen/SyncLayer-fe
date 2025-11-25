import { create } from 'zustand';
import { Team, TeamWithRole, TeamWithMembers, TeamMember } from '@/types';
import { api } from '@/lib/api';

interface TeamState {
  teams: TeamWithRole[];
  currentTeam: TeamWithMembers | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTeams: (userId: string) => Promise<void>;
  fetchTeam: (teamId: string) => Promise<void>;
  createTeam: (
    name: string,
    description: string | undefined,
    userId: string
  ) => Promise<Team>;
  updateTeam: (
    teamId: string,
    data: Partial<{ name: string; description: string }>
  ) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addMember: (
    teamId: string,
    userId: string,
    role: 'admin' | 'editor' | 'viewer'
  ) => Promise<void>;
  updateMemberRole: (
    teamId: string,
    userId: string,
    role: 'admin' | 'editor' | 'viewer'
  ) => Promise<void>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  clearError: () => void;
  setCurrentTeam: (team: TeamWithMembers | null) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,

  fetchTeams: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { teams } = await api.getUserTeams(userId);
      set({ teams, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch teams',
        isLoading: false,
      });
    }
  },

  fetchTeam: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { team } = await api.getTeamById(teamId);
      set({ currentTeam: team, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch team',
        isLoading: false,
      });
    }
  },

  createTeam: async (name, description, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { team } = await api.createTeam({
        name,
        description,
        created_by: userId,
      });
      const currentTeams = get().teams || [];
      set({
        teams: [
          ...currentTeams,
          { ...team, role: 'admin' as const },
        ],
        isLoading: false,
      });
      return team;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create team',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTeam: async (teamId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { team } = await api.updateTeam(teamId, data);
      const currentTeams = get().teams || [];
      const teams = currentTeams.map((t) =>
        t.id === teamId ? { ...t, ...team } : t
      );
      set({ teams, isLoading: false });

      if (get().currentTeam?.id === teamId) {
        set({
          currentTeam: { ...get().currentTeam!, ...team },
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update team',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteTeam(teamId);
      const currentTeams = get().teams || [];
      const teams = currentTeams.filter((t) => t.id !== teamId);
      set({ teams, isLoading: false });

      if (get().currentTeam?.id === teamId) {
        set({ currentTeam: null });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete team',
        isLoading: false,
      });
      throw error;
    }
  },

  addMember: async (teamId, userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const { member } = await api.addTeamMember(teamId, { user_id: userId, role });
      const currentTeam = get().currentTeam;
      if (currentTeam?.id === teamId) {
        set({
          currentTeam: {
            ...currentTeam,
            members: [...(currentTeam.members || []), member],
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to add team member',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMemberRole: async (teamId, userId, role) => {
    set({ isLoading: true, error: null });
    try {
      await api.updateTeamMemberRole(teamId, userId, role);
      const currentTeam = get().currentTeam;
      if (currentTeam?.id === teamId) {
        const members = currentTeam.members.map((m) =>
          m.user_id === userId ? { ...m, role } : m
        );
        set({
          currentTeam: { ...currentTeam, members },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update member role',
        isLoading: false,
      });
      throw error;
    }
  },

  removeMember: async (teamId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.removeTeamMember(teamId, userId);
      const currentTeam = get().currentTeam;
      if (currentTeam?.id === teamId) {
        const members = currentTeam.members.filter((m) => m.user_id !== userId);
        set({
          currentTeam: { ...currentTeam, members },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to remove member',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setCurrentTeam: (team) => set({ currentTeam: team }),
}));
