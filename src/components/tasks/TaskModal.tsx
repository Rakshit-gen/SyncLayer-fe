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
import { cn, getPriorityColor } from '@/lib/utils';

interface TaskModalProps {
  task: Task;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskModal({ task, userId, isOpen, onClose }: TaskModalProps) {
  const { updateTask } = useBoardStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [isSaving, setIsSaving] = useState(false);

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
