'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Settings, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTeamStore } from '@/stores/useTeamStore';
import { useBoardStore } from '@/stores/useBoardStore';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { BoardCard } from '@/components/boards/BoardCard';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { userId } = useAuth();
  const { currentTeam, fetchTeam, teams } = useTeamStore();
  const { boards, isLoading: boardsLoading, fetchBoards, createBoard } = useBoardStore();

  const currentTeamWithRole = teams.find((t) => t.id === teamId);
  const permissions = usePermissions(currentTeamWithRole?.role);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
      fetchBoards(teamId);
    }
  }, [teamId, fetchTeam, fetchBoards]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !userId) return;

    setIsCreating(true);
    try {
      const board = await createBoard(
        teamId,
        newBoardName.trim(),
        newBoardDescription.trim() || undefined,
        userId
      );
      // Refetch boards to ensure UI updates
      await fetchBoards(teamId);
      setNewBoardName('');
      setNewBoardDescription('');
      setIsCreateOpen(false);
      router.push(`/boards/${board.id}`);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{currentTeam.name}</h1>
          {currentTeam.description && (
            <p className="text-muted-foreground">{currentTeam.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {permissions.canManage && (
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {permissions.canWrite && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                  <DialogDescription>
                    Create a new board to organize tasks and collaborate.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Board Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter board name"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter board description"
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBoard}
                    disabled={isCreating || !newBoardName.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create Board'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Team Members Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex -space-x-2">
            {(currentTeam.members || []).slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium border-2 border-background"
                title={member.user?.name || 'Unknown'}
              >
                {member.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            ))}
            {(currentTeam.members || []).length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{(currentTeam.members || []).length - 5}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {(currentTeam.members || []).length} member
            {(currentTeam.members || []).length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Boards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Boards</h2>
        {boardsLoading && (!boards || boards.length === 0) ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : !boards || boards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No boards yet</h3>
                <p className="text-muted-foreground">
                  Create your first board to start organizing tasks
                </p>
                {permissions.canWrite && (
                  <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Board
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
