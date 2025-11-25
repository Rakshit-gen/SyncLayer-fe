'use client';

import { useMemo } from 'react';
import { TeamRole } from '@/types';

interface Permissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManage: boolean;
  canInvite: boolean;
  canRemoveMembers: boolean;
  canEditBoard: boolean;
  canDeleteBoard: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canCreateTask: boolean;
  canMoveTask: boolean;
}

export function usePermissions(role?: TeamRole): Permissions {
  return useMemo(() => {
    const isAdmin = role === 'admin';
    const isEditor = role === 'editor';
    const isViewer = role === 'viewer';

    return {
      // Basic permissions
      canRead: true,
      canWrite: isAdmin || isEditor,
      canDelete: isAdmin || isEditor,
      canManage: isAdmin,

      // Team permissions
      canInvite: isAdmin,
      canRemoveMembers: isAdmin,

      // Board permissions
      canEditBoard: isAdmin || isEditor,
      canDeleteBoard: isAdmin,

      // Task permissions
      canEditTask: isAdmin || isEditor,
      canDeleteTask: isAdmin || isEditor,
      canCreateTask: isAdmin || isEditor,
      canMoveTask: isAdmin || isEditor,
    };
  }, [role]);
}

export default usePermissions;
