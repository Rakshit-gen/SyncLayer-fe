'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTeamStore } from '@/stores/useTeamStore';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const { teams, fetchTeams } = useTeamStore();

  useEffect(() => {
    if (userId) {
      fetchTeams(userId);
    }
  }, [userId, fetchTeams]);

  const navigation = [
    {
      name: 'Teams',
      href: '/teams',
      icon: Users,
      current: pathname === '/teams',
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              item.current
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}

        {teams && teams.length > 0 && (
          <>
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Teams
              </h3>
            </div>
            <div className="space-y-1">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === `/teams/${team.id}`
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{team.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
