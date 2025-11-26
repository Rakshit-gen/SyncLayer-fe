'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { aiService, GeneratedTask } from '@/lib/ai';
import { api } from '@/lib/api';
import { useBoardStore } from '@/stores/useBoardStore';

interface AITaskGeneratorProps {
  columnId: string;
  userId: string;
  boardName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AITaskGenerator({
  columnId,
  userId,
  boardName,
  isOpen,
  onClose,
}: AITaskGeneratorProps) {
  const { addTask } = useBoardStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creatingTasks, setCreatingTasks] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedTasks([]);

    try {
      const tasks = await aiService.generateTasksFromPrompt(
        prompt.trim(),
        boardName
      );
      setGeneratedTasks(tasks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate tasks. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTasks = async () => {
    if (generatedTasks.length === 0) return;

    setCreatingTasks(true);
    setError(null);

    try {
      for (const task of generatedTasks) {
        const { task: createdTask } = await api.createTask({
          column_id: columnId,
          title: task.title,
          description: task.description || undefined,
          priority: task.priority,
          due_date: task.due_date ? new Date(task.due_date).toISOString() : undefined,
          created_by: userId,
        });
        addTask(createdTask);
      }

      // Reset and close
      setPrompt('');
      setGeneratedTasks([]);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create tasks. Please try again.'
      );
    } finally {
      setCreatingTasks(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedTasks([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Task Generator
          </DialogTitle>
          <DialogDescription>
            Describe what you want to accomplish, and AI will generate tasks for
            you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What do you want to accomplish?
            </label>
            <Textarea
              placeholder="e.g., Build a user authentication system with login, signup, and password reset"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isGenerating || creatingTasks}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {generatedTasks.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Generated Tasks ({generatedTasks.length})
              </label>
              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {generatedTasks.map((task, index) => (
                  <div
                    key={index}
                    className="border-b last:border-b-0 pb-3 last:pb-0"
                  >
                    <div className="font-medium text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={creatingTasks}>
              Cancel
            </Button>
            {generatedTasks.length === 0 ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tasks
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleCreateTasks} disabled={creatingTasks}>
                {creatingTasks ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${generatedTasks.length} Task${generatedTasks.length > 1 ? 's' : ''}`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

