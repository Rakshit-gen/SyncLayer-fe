import { create } from 'zustand';
import { Board, BoardFull, ColumnWithTasks, Task, Column } from '@/types';
import { api } from '@/lib/api';

interface BoardState {
  boards: Board[];
  currentBoard: BoardFull | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBoards: (teamId: string) => Promise<void>;
  fetchBoard: (boardId: string) => Promise<void>;
  createBoard: (
    teamId: string,
    name: string,
    description: string | undefined,
    userId: string
  ) => Promise<Board>;
  updateBoard: (
    boardId: string,
    data: Partial<{ name: string; description: string }>,
    userId: string
  ) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;

  // Column actions
  addColumn: (column: Column) => void;
  updateColumn: (columnId: string, data: Partial<Column>) => void;
  moveColumn: (columnId: string, newPosition: number) => void;
  removeColumn: (columnId: string) => void;

  // Task actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  moveTask: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newPosition: number
  ) => void;
  removeTask: (taskId: string, columnId: string) => void;

  // Board sync
  syncBoard: (board: BoardFull) => void;

  clearError: () => void;
  setCurrentBoard: (board: BoardFull | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  fetchBoards: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { boards } = await api.getTeamBoards(teamId);
      set({ boards, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch boards',
        isLoading: false,
      });
    }
  },

  fetchBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { board } = await api.getBoardById(boardId);
      set({ currentBoard: board, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch board',
        isLoading: false,
      });
    }
  },

  createBoard: async (teamId, name, description, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { board } = await api.createBoard({
        team_id: teamId,
        name,
        description,
        created_by: userId,
      });
      const currentBoards = get().boards || [];
      set({
        boards: [...currentBoards, board],
        isLoading: false,
      });
      return board;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create board',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBoard: async (boardId, data, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { board } = await api.updateBoard(boardId, data, userId);
      const boards = get().boards.map((b) =>
        b.id === boardId ? { ...b, ...board } : b
      );
      set({ boards, isLoading: false });

      if (get().currentBoard?.id === boardId) {
        set({
          currentBoard: { ...get().currentBoard!, ...board },
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update board',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteBoard(boardId);
      const currentBoards = get().boards || [];
      const boards = currentBoards.filter((b) => b.id !== boardId);
      set({ boards, isLoading: false });

      if (get().currentBoard?.id === boardId) {
        set({ currentBoard: null });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete board',
        isLoading: false,
      });
      throw error;
    }
  },

  // Column actions
  addColumn: (column) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const newColumn: ColumnWithTasks = { ...column, tasks: [] };
    const columns = [...currentBoard.columns, newColumn].sort(
      (a, b) => a.position - b.position
    );

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  updateColumn: (columnId, data) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const columns = currentBoard.columns.map((col) =>
      col.id === columnId ? { ...col, ...data } : col
    );

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  moveColumn: (columnId, newPosition) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const columns = [...currentBoard.columns];
    const columnIndex = columns.findIndex((c) => c.id === columnId);
    if (columnIndex === -1) return;

    const [column] = columns.splice(columnIndex, 1);
    column.position = newPosition;
    columns.splice(newPosition, 0, column);

    // Update positions
    columns.forEach((col, index) => {
      col.position = index;
    });

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  removeColumn: (columnId) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const columns = currentBoard.columns.filter((col) => col.id !== columnId);

    // Update positions
    columns.forEach((col, index) => {
      col.position = index;
    });

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  // Task actions
  addTask: (task) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const columns = currentBoard.columns.map((col) => {
      if (col.id === task.column_id) {
        const tasks = [...col.tasks, task].sort((a, b) => a.position - b.position);
        return { ...col, tasks };
      }
      return col;
    });

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  updateTask: (taskId, data) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const columns = currentBoard.columns.map((col) => {
      const tasks = col.tasks.map((task) =>
        task.id === taskId ? { ...task, ...data } : task
      );
      return { ...col, tasks };
    });

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  moveTask: (taskId, fromColumnId, toColumnId, newPosition) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    // Find the task to move
    const fromColumn = currentBoard.columns.find((col) => col.id === fromColumnId);
    if (!fromColumn) return;

    const taskToMove = fromColumn.tasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    // Create updated task with new column and position
    const updatedTask: Task = {
      ...taskToMove,
      column_id: toColumnId,
      position: newPosition,
    };

    // Update columns: remove from source, add to destination
    const columns = currentBoard.columns.map((col) => {
      if (col.id === fromColumnId) {
        // Remove task from source column
        const tasks = col.tasks.filter((t) => t.id !== taskId);
        // Update positions in source column
        tasks.forEach((t, i) => {
          t.position = i;
        });
        return { ...col, tasks };
      } else if (col.id === toColumnId) {
        // Add task to destination column
        const tasks = [...col.tasks];
        tasks.splice(newPosition, 0, updatedTask);
        // Update positions in destination column
        tasks.forEach((t, i) => {
          t.position = i;
        });
        return { ...col, tasks };
      }
      return col;
    });

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  removeTask: (taskId, columnId) => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return;

    const columns = currentBoard.columns.map((col) => {
      if (col.id === columnId) {
        const tasks = col.tasks.filter((t) => t.id !== taskId);
        // Update positions
        tasks.forEach((t, i) => {
          t.position = i;
        });
        return { ...col, tasks };
      }
      return col;
    });

    set({
      currentBoard: { ...currentBoard, columns },
    });
  },

  syncBoard: (board) => {
    set({ currentBoard: board });
  },

  clearError: () => set({ error: null }),

  setCurrentBoard: (board) => set({ currentBoard: board }),
}));
