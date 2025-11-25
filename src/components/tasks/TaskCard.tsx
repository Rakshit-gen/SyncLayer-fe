'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal, Trash2, Edit2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/types';
import { cn, getPriorityColor, formatDate } from '@/lib/utils';
import { useBoardStore } from '@/stores/useBoardStore';
import { api } from '@/lib/api';
import { TaskModal } from './TaskModal';

interface TaskCardProps {
  task: Task;
  userId: string;
  isDragging?: boolean;
}

export function TaskCard({ task, userId, isDragging = false }: TaskCardProps) {
  const { removeTask } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteTask(task.id, userId);
      removeTask(task.id, task.column_id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'task-card p-3 cursor-grab active:cursor-grabbing',
          (isDragging || isSortableDragging) && 'opacity-50 shadow-lg'
        )}
        onClick={() => setIsModalOpen(true)}
        {...attributes}
        {...listeners}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-xs', getPriorityColor(task.priority))}
            >
              {task.priority}
            </Badge>

            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
              </div>
            )}

            {task.assigned_to && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <TaskModal
        task={task}
        userId={userId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
