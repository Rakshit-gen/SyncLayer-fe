'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnWithTasks } from '@/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useBoardStore } from '@/stores/useBoardStore';
import { api } from '@/lib/api';

interface ColumnProps {
  column: ColumnWithTasks;
  userId: string;
  boardId: string;
}

export function Column({ column, userId, boardId }: ColumnProps) {
  const { addTask, removeColumn, updateColumn } = useBoardStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { task } = await api.createTask({
        column_id: column.id,
        title: newTaskTitle.trim(),
        created_by: userId,
      });
      addTask(task);
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteColumn = async () => {
    try {
      await api.deleteColumn(column.id, userId);
      removeColumn(column.id);
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim() || editName === column.name) {
      setIsEditing(false);
      setEditName(column.name);
      return;
    }

    try {
      await api.updateColumn(column.id, { name: editName.trim() }, userId);
      updateColumn(column.id, { name: editName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update column:', error);
      setEditName(column.name);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 flex-shrink-0 bg-card rounded-lg flex flex-col max-h-full border"
    >
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between cursor-grab"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          {isEditing ? (
            <Input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleUpdateName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateName();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditName(column.name);
                }
              }}
              className="h-7 text-sm font-semibold"
            />
          ) : (
            <h3 className="font-semibold text-sm truncate">{column.name}</h3>
          )}
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDeleteColumn}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} userId={userId} />
          ))}
        </SortableContext>

        {/* Add Task */}
        {isAddingTask ? (
          <div className="space-y-6">
            <Input
              autoFocus
              placeholder="Enter task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
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
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
}
