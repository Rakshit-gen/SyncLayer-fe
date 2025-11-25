// WebSocket event types

import { Column, Task, User } from './index';

export type WSEventType =
  // Client -> Server
  | 'board.join'
  | 'board.leave'
  | 'task.create'
  | 'task.update'
  | 'task.move'
  | 'task.delete'
  | 'column.create'
  | 'column.update'
  | 'column.move'
  | 'column.delete'
  | 'presence.cursor'
  // Server -> Client
  | 'board.sync'
  | 'task.created'
  | 'task.updated'
  | 'task.moved'
  | 'task.deleted'
  | 'column.created'
  | 'column.updated'
  | 'column.moved'
  | 'column.deleted'
  | 'presence.joined'
  | 'presence.left'
  | 'presence.cursors'
  | 'notification.push'
  | 'error';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
}

// Payload types for different events
export interface BoardSyncPayload {
  board: {
    id: string;
    name: string;
    columns: Array<{
      id: string;
      name: string;
      position: number;
      color: string;
      tasks: Task[];
    }>;
  };
}

export interface TaskCreatedPayload {
  task: Task;
  user_id: string;
}

export interface TaskUpdatedPayload {
  task: Task;
  user_id: string;
}

export interface TaskMovedPayload {
  task: Task;
  from_column_id: string;
  user_id: string;
}

export interface TaskDeletedPayload {
  task_id: string;
  user_id: string;
}

export interface ColumnCreatedPayload {
  column: Column;
  user_id: string;
}

export interface ColumnUpdatedPayload {
  column: Column;
  user_id: string;
}

export interface ColumnMovedPayload {
  column: Column;
  user_id: string;
}

export interface ColumnDeletedPayload {
  column_id: string;
  user_id: string;
}

export interface PresenceJoinedPayload {
  user: User;
}

export interface PresenceLeftPayload {
  user_id: string;
}

export interface CursorPosition {
  user_id: string;
  x: number;
  y: number;
}

export interface PresenceCursorsPayload {
  cursors: CursorPosition[];
}

export interface ErrorPayload {
  code: string;
  message: string;
}
