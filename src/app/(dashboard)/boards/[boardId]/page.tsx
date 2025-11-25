'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Settings, Users, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useBoardStore } from '@/stores/useBoardStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { BoardView } from '@/components/boards/BoardView';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const { userId } = useAuth();
  const { currentBoard, isLoading, fetchBoard } = useBoardStore();
  const { isConnected } = useWebSocket(boardId);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const boardUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/boards/${boardId}`
    : '';

  const handleCopyLink = async () => {
    if (boardUrl) {
      try {
        await navigator.clipboard.writeText(boardUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);

  if (isLoading && !currentBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Board not found</p>
        <Link href="/teams">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/teams/${currentBoard.team_id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{currentBoard.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Board</DialogTitle>
                <DialogDescription>
                  Share this board with your team members by copying the link below.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-4">
                <Input
                  value={boardUrl}
                  readOnly
                  className="flex-1"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-500 mt-2">Link copied to clipboard!</p>
              )}
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Board */}
      <BoardView board={currentBoard} userId={userId || ''} />
    </div>
  );
}
