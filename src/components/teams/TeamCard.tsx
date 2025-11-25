'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, LayoutDashboard, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TeamWithRole } from '@/types';
import { useTeamStore } from '@/stores/useTeamStore';
import { usePermissions } from '@/hooks/usePermissions';

interface TeamCardProps {
  team: TeamWithRole;
}

export function TeamCard({ team }: TeamCardProps) {
  const router = useRouter();
  const { deleteTeam } = useTeamStore();
  const permissions = usePermissions(team.role);
  const [open, setOpen] = React.useState(false);
  const roleColors = {
    admin: 'bg-red-500/20 text-red-400',
    editor: 'bg-blue-500/20 text-blue-400',
    viewer: 'bg-muted text-muted-foreground',
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteTeam(team.id);
      setOpen(false);
      router.push('/teams');
    } catch (error) {
      console.error('Failed to delete team:', error);
      setOpen(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <Link href={`/teams/${team.id}`} className="block">
        <CardHeader className={permissions.canManage ? 'pr-12' : ''}>
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: '#6366f1' }}
            >
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={roleColors[team.role]}>{team.role}</Badge>
            </div>
          </div>
          <CardTitle className="mt-4">{team.name}</CardTitle>
          {team.description && (
            <CardDescription className="line-clamp-2">
              {team.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </div>
            <div className="flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" />
              <span>Boards</span>
            </div>
          </div>
        </CardContent>
      </Link>
      {permissions.canManage && (
        <div className="absolute top-4 right-4 z-20">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{team.name}"? This action cannot be undone and will delete all boards and tasks in this team.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
}
