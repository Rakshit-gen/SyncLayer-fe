'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, TaskPriority } from '@/types';
import { useBoardStore } from '@/stores/useBoardStore';
import { api } from '@/lib/api';
import { aiService, GeneratedTask } from '@/lib/ai';
import { cn, getPriorityColor } from '@/lib/utils';
import { Sparkles, Loader2 } from 'lucide-react';

interface TaskModalProps {
  task: Task;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskModal({ task, userId, isOpen, onClose }: TaskModalProps) {
  const { updateTask, addTask, currentBoard } = useBoardStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [subtasks, setSubtasks] = useState<GeneratedTask[]>([]);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [creatingSubtasks, setCreatingSubtasks] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (title !== task.title) updates.title = title;
      if (description !== (task.description || '')) updates.description = description;
      if (priority !== task.priority) updates.priority = priority;

      if (Object.keys(updates).length > 0) {
        const { task: updatedTask } = await api.updateTask(task.id, updates, userId);
        updateTask(task.id, updatedTask);
      }
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBreakDown = async () => {
    setIsBreakingDown(true);
    setBreakdownError(null);
    setSubtasks([]);

    try {
      const generated = await aiService.breakDownTask(
        title,
        description || undefined
      );
      setSubtasks(generated);
    } catch (err) {
      setBreakdownError(
        err instanceof Error
          ? err.message
          : 'Failed to break down task. Please try again.'
      );
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleCreateSubtasks = async () => {
    if (subtasks.length === 0) return;

    setCreatingSubtasks(true);
    setBreakdownError(null);

    try {
      // Find the column for this task
      const column = currentBoard?.columns.find((col) =>
        col.tasks.some((t) => t.id === task.id)
      );

      if (!column) {
        throw new Error('Could not find column for task');
      }

      for (const subtask of subtasks) {
        const { task: createdTask } = await api.createTask({
          column_id: column.id,
          title: subtask.title,
          description: subtask.description || undefined,
          priority: subtask.priority,
          due_date: subtask.due_date
            ? new Date(subtask.due_date).toISOString()
            : undefined,
          created_by: userId,
        });
        addTask(createdTask);
      }

      setSubtasks([]);
    } catch (err) {
      setBreakdownError(
        err instanceof Error
          ? err.message
          : 'Failed to create subtasks. Please try again.'
      );
    } finally {
      setCreatingSubtasks(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      getPriorityColor(priority)
                    )}
                  >
                    {priority}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {priorities.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setPriority(p)}>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        getPriorityColor(p)
                      )}
                    >
                      {p}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* AI Breakdown Section */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Break Down Task</Label>
              {subtasks.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBreakDown}
                  disabled={isBreakingDown}
                >
                  {isBreakingDown ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Breaking down...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Break Down
                    </>
                  )}
                </Button>
              )}
            </div>
            {breakdownError && (
              <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md">
                {breakdownError}
              </div>
            )}
            {subtasks.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Generated {subtasks.length} subtask{subtasks.length > 1 ? 's' : ''}:
                </div>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="border-b last:border-b-0 pb-2 last:pb-0"
                    >
                      <div className="font-medium text-sm">{subtask.title}</div>
                      {subtask.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {subtask.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-muted rounded">
                          {subtask.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCreateSubtasks}
                  disabled={creatingSubtasks}
                >
                  {creatingSubtasks ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Create ${subtasks.length} Subtask${subtasks.length > 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
