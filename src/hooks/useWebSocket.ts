'use client';

import { useEffect, useCallback } from 'react';
import { useWebSocketStore, useWebSocketActions } from '@/stores/useWebSocketStore';
import { useAuth } from './useAuth';

export function useWebSocket(boardId: string | null) {
  const { userId } = useAuth();
  const {
    isConnected,
    onlineUsers,
    cursors,
    error,
    connect,
    disconnect,
    updateCursor,
    clearError,
  } = useWebSocketStore();

  useEffect(() => {
    if (boardId && userId) {
      connect(boardId, userId).catch(console.error);
    }

    return () => {
      disconnect();
    };
  }, [boardId, userId, connect, disconnect]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isConnected) {
        updateCursor(e.clientX, e.clientY);
      }
    },
    [isConnected, updateCursor]
  );

  return {
    isConnected,
    onlineUsers: Array.from(onlineUsers.values()),
    cursors: Array.from(cursors.values()),
    error,
    handleMouseMove,
    clearError,
    ...useWebSocketActions(),
  };
}

export default useWebSocket;
