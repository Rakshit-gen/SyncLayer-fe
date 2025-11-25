'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoardFull, Task, Column as ColumnType } from '@/types';
import { Column } from '@/components/columns/Column';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useBoardStore } from '@/stores/useBoardStore';
import { api } from '@/lib/api';

interface BoardViewProps {
  board: BoardFull;
  userId: string;
}

export function BoardView({ board, userId }: BoardViewProps) {
  const { moveTask, moveColumn, addColumn } = useBoardStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if dragging a task
    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === activeId);
      if (task) {
        setActiveTask(task);
        return;
      }
    }

    // Check if dragging a column
    const column = board.columns.find((c) => c.id === activeId);
    if (column) {
      setActiveColumn(column);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Find which column the task is being dragged over
    const activeColumn = board.columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );
    const overColumn = board.columns.find(
      (col) => col.id === overId || col.tasks.some((t) => t.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    // Moving task between columns
    const activeTask = activeColumn.tasks.find((t) => t.id === activeId);
    if (activeTask) {
      const overTask = overColumn.tasks.find((t) => t.id === overId);
      const newPosition = overTask
        ? overTask.position
        : overColumn.tasks.length;

      moveTask(activeId, activeColumn.id, overColumn.id, newPosition);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Handle column reordering
    if (activeColumn) {
      const oldIndex = board.columns.findIndex((c) => c.id === activeId);
      const newIndex = board.columns.findIndex((c) => c.id === overId);

      if (oldIndex !== newIndex) {
        moveColumn(activeId, newIndex);
        try {
          await api.moveColumn(activeId, newIndex, userId);
        } catch (error) {
          console.error('Failed to move column:', error);
        }
      }
      return;
    }

    // Handle task movement (final position)
    if (activeTask) {
      const overColumn = board.columns.find(
        (col) => col.id === overId || col.tasks.some((t) => t.id === overId)
      );

      if (overColumn) {
        const overTask = overColumn.tasks.find((t) => t.id === overId);
        const newPosition = overTask
          ? overTask.position
          : overColumn.tasks.length;

        try {
          await api.moveTask(
            activeId,
            { column_id: overColumn.id, position: newPosition },
            userId
          );
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      }
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const { column } = await api.createColumn(
        {
          board_id: board.id,
          name: newColumnName.trim(),
          position: board.columns.length,
        },
        userId
      );
      addColumn(column);
      setNewColumnName('');
      setIsAddingColumn(false);
    } catch (error) {
      console.error('Failed to create column:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto board-container">
        <div className="flex gap-4 p-4 min-h-full">
          <SortableContext
            items={board.columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                userId={userId}
                boardId={board.id}
              />
            ))}
          </SortableContext>

          {/* Add Column */}
          <div className="w-72 flex-shrink-0">
            {isAddingColumn ? (
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <Input
                  autoFocus
                  placeholder="Enter column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setIsAddingColumn(false);
                      setNewColumnName('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddColumn}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} userId={userId} isDragging />
        )}
        {activeColumn && (
          <div className="w-72 bg-muted rounded-lg p-3 opacity-80">
            <h3 className="font-semibold">{activeColumn.name}</h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
