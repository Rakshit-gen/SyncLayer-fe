import { create } from 'zustand';
import { wsClient } from '@/lib/websocket';
import { useBoardStore } from './useBoardStore';
import {
  BoardSyncPayload,
  TaskCreatedPayload,
  TaskUpdatedPayload,
  TaskMovedPayload,
  TaskDeletedPayload,
  ColumnCreatedPayload,
  ColumnUpdatedPayload,
  ColumnMovedPayload,
  ColumnDeletedPayload,
  PresenceJoinedPayload,
  PresenceLeftPayload,
  CursorPosition,
} from '@/types/websocket';

interface OnlineUser {
  id: string;
  cursor?: { x: number; y: number };
}

interface WebSocketState {
  isConnected: boolean;
  boardId: string | null;
  onlineUsers: Map<string, OnlineUser>;
  cursors: Map<string, CursorPosition>;
  error: string | null;

  // Actions
  connect: (boardId: string, userId: string) => Promise<void>;
  disconnect: () => void;
  updateCursor: (x: number, y: number) => void;
  clearError: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  boardId: null,
  onlineUsers: new Map(),
  cursors: new Map(),
  error: null,

  connect: async (boardId: string, userId: string) => {
    try {
      set({ error: null });

      await wsClient.connect(boardId, userId);

      set({
        isConnected: true,
        boardId,
      });

      // Set up event handlers
      setupEventHandlers();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to connect to WebSocket',
        isConnected: false,
      });
      throw error;
    }
  },

  disconnect: () => {
    // Clean up event handlers
    unsubscribeFunctions.forEach((unsub) => unsub());
    unsubscribeFunctions = [];
    
    wsClient.disconnect();
    set({
      isConnected: false,
      boardId: null,
      onlineUsers: new Map(),
      cursors: new Map(),
    });
  },

  updateCursor: (x: number, y: number) => {
    wsClient.sendCursorPosition(x, y);
  },

  clearError: () => set({ error: null }),
}));

// Store unsubscribe functions to clean up handlers
let unsubscribeFunctions: (() => void)[] = [];

// Helper function to set up WebSocket event handlers
function setupEventHandlers() {
  // Clean up old handlers first
  unsubscribeFunctions.forEach((unsub) => unsub());
  unsubscribeFunctions = [];

  const boardStore = useBoardStore.getState();

  // Board sync
  const unsub1 = wsClient.on('board.sync', (event) => {
    console.log('Received board.sync event', event);
    const payload = event.payload as BoardSyncPayload;
    const { board } = payload;
    boardStore.syncBoard(board as any);
  });
  unsubscribeFunctions.push(unsub1);

  // Task events
  const unsub2 = wsClient.on('task.created', (event) => {
    console.log('Received task.created event', event);
    const payload = event.payload as TaskCreatedPayload;
    const { task } = payload;
    boardStore.addTask(task);
  });
  unsubscribeFunctions.push(unsub2);

  const unsub3 = wsClient.on('task.updated', (event) => {
    console.log('Received task.updated event', event);
    const payload = event.payload as TaskUpdatedPayload;
    const { task } = payload;
    boardStore.updateTask(task.id, task);
  });
  unsubscribeFunctions.push(unsub3);

  const unsub4 = wsClient.on('task.moved', (event) => {
    console.log('Received task.moved event', event);
    const payload = event.payload as TaskMovedPayload;
    const { task, from_column_id } = payload;
    boardStore.moveTask(task.id, from_column_id, task.column_id, task.position);
  });
  unsubscribeFunctions.push(unsub4);

  const unsub5 = wsClient.on('task.deleted', (event) => {
    console.log('Received task.deleted event', event);
    const payload = event.payload as TaskDeletedPayload;
    const { task_id } = payload;
    // Find the column containing this task
    const currentBoard = boardStore.currentBoard;
    if (currentBoard) {
      for (const column of currentBoard.columns) {
        const task = column.tasks.find((t) => t.id === task_id);
        if (task) {
          boardStore.removeTask(task_id, column.id);
          break;
        }
      }
    }
  });
  unsubscribeFunctions.push(unsub5);

  // Column events
  const unsub6 = wsClient.on('column.created', (event) => {
    console.log('Received column.created event', event);
    const payload = event.payload as ColumnCreatedPayload;
    const { column } = payload;
    boardStore.addColumn(column);
  });
  unsubscribeFunctions.push(unsub6);

  const unsub7 = wsClient.on('column.updated', (event) => {
    console.log('Received column.updated event', event);
    const payload = event.payload as ColumnUpdatedPayload;
    const { column } = payload;
    boardStore.updateColumn(column.id, column);
  });
  unsubscribeFunctions.push(unsub7);

  const unsub8 = wsClient.on('column.moved', (event) => {
    console.log('Received column.moved event', event);
    const payload = event.payload as ColumnMovedPayload;
    const { column } = payload;
    boardStore.moveColumn(column.id, column.position);
  });
  unsubscribeFunctions.push(unsub8);

  const unsub9 = wsClient.on('column.deleted', (event) => {
    console.log('Received column.deleted event', event);
    const payload = event.payload as ColumnDeletedPayload;
    const { column_id } = payload;
    boardStore.removeColumn(column_id);
  });
  unsubscribeFunctions.push(unsub9);

  // Presence events
  const unsub10 = wsClient.on('presence.joined', (event) => {
    const payload = event.payload as PresenceJoinedPayload;
    const { user } = payload;
    const store = useWebSocketStore.getState();
    const onlineUsers = new Map(store.onlineUsers);
    onlineUsers.set(user.id, { id: user.id });
    useWebSocketStore.setState({ onlineUsers });
  });
  unsubscribeFunctions.push(unsub10);

  const unsub11 = wsClient.on('presence.left', (event) => {
    const payload = event.payload as PresenceLeftPayload;
    const { user_id } = payload;
    const store = useWebSocketStore.getState();
    const onlineUsers = new Map(store.onlineUsers);
    const cursors = new Map(store.cursors);
    onlineUsers.delete(user_id);
    cursors.delete(user_id);
    useWebSocketStore.setState({ onlineUsers, cursors });
  });
  unsubscribeFunctions.push(unsub11);

  const unsub12 = wsClient.on('presence.cursors', (event) => {
    const payload = event.payload as { cursors: CursorPosition[] };
    const { cursors: cursorList } = payload;
    const store = useWebSocketStore.getState();
    const cursors = new Map(store.cursors);
    
    for (const cursor of cursorList) {
      cursors.set(cursor.user_id, cursor);
    }
    
    useWebSocketStore.setState({ cursors });
  });
  unsubscribeFunctions.push(unsub12);

  // Error handling
  const unsub13 = wsClient.on('error', (event) => {
    console.error('WebSocket error event:', event);
    const payload = event.payload as { code: string; message: string };
    const { message } = payload;
    useWebSocketStore.setState({ error: message });
  });
  unsubscribeFunctions.push(unsub13);
}

// Export hook for WebSocket actions
export function useWebSocketActions() {
  return {
    sendTaskCreate: wsClient.sendTaskCreate.bind(wsClient),
    sendTaskUpdate: wsClient.sendTaskUpdate.bind(wsClient),
    sendTaskMove: wsClient.sendTaskMove.bind(wsClient),
    sendTaskDelete: wsClient.sendTaskDelete.bind(wsClient),
    sendColumnCreate: wsClient.sendColumnCreate.bind(wsClient),
    sendColumnUpdate: wsClient.sendColumnUpdate.bind(wsClient),
    sendColumnMove: wsClient.sendColumnMove.bind(wsClient),
    sendColumnDelete: wsClient.sendColumnDelete.bind(wsClient),
  };
}
