// WebSocket client for real-time updates

import { WSEvent, WSEventType } from '@/types/websocket';

type EventHandler = (event: WSEvent) => void;

// Helper function to get WebSocket URL based on environment
const getWsUrl = (): string => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    return wsUrl;
  }
  // Default to ws:// for localhost, wss:// for production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:8080';
    }
  }
  return 'ws://localhost:8080'; // Default fallback
};

const WS_URL = getWsUrl();

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<WSEventType, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();
  private boardId: string | null = null;
  private userId: string | null = null;
  private isConnecting = false;

  connect(boardId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        if (this.boardId === boardId && this.userId === userId) {
          resolve();
          return;
        }
        this.disconnect();
      }

      this.isConnecting = true;
      this.boardId = boardId;
      this.userId = userId;

      const url = `${WS_URL}/ws?board_id=${boardId}&user_id=${userId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.attemptReconnect();
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.boardId = null;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  private attemptReconnect(): void {
    if (
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      !this.boardId ||
      !this.userId
    ) {
      console.log('Max reconnect attempts reached or no board/user ID');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.boardId && this.userId) {
        this.connect(this.boardId, this.userId).catch(console.error);
      }
    }, delay);
  }

  private handleEvent(event: WSEvent): void {
    // Call global handlers
    this.globalHandlers.forEach((handler) => handler(event));

    // Call type-specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  send(type: WSEventType, payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  on(type: WSEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  onAny(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  off(type: WSEventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  offAny(handler: EventHandler): void {
    this.globalHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Helper methods for common events
  sendTaskCreate(columnId: string, title: string, description?: string): void {
    this.send('task.create', {
      column_id: columnId,
      title,
      description,
    });
  }

  sendTaskUpdate(taskId: string, changes: Record<string, unknown>): void {
    this.send('task.update', {
      task_id: taskId,
      changes,
    });
  }

  sendTaskMove(taskId: string, columnId: string, position: number): void {
    this.send('task.move', {
      task_id: taskId,
      column_id: columnId,
      position,
    });
  }

  sendTaskDelete(taskId: string): void {
    this.send('task.delete', { task_id: taskId });
  }

  sendColumnCreate(name: string, position: number, color?: string): void {
    this.send('column.create', { name, position, color });
  }

  sendColumnUpdate(columnId: string, changes: Record<string, unknown>): void {
    this.send('column.update', {
      column_id: columnId,
      changes,
    });
  }

  sendColumnMove(columnId: string, position: number): void {
    this.send('column.move', {
      column_id: columnId,
      position,
    });
  }

  sendColumnDelete(columnId: string): void {
    this.send('column.delete', { column_id: columnId });
  }

  sendCursorPosition(x: number, y: number): void {
    this.send('presence.cursor', { x, y });
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
export default wsClient;
