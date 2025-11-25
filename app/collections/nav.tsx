'use client';
import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationBar from '@/components/NotificationBar';

export const Nav = () => {
  const { user, loading: userLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <nav className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">P</span>
        </div>
        <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          PostPilot
        </span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBar />
        <DropdownMenu>
          {userLoading ? (
            <Skeleton className="h-9 w-9 rounded-lg" />
          ) : (
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 rounded-lg cursor-pointer">
                <AvatarFallback className="rounded-lg bg-muted">
                  {user?.firstName?.slice(0, 2)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent className="w-64 rounded-xl" side={'bottom'} align="end" sideOffset={8}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-4 text-left">
                {userLoading ? (
                  <>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="grid flex-1 text-left text-sm leading-tight space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-muted">
                        {user?.firstName?.slice(0, 2)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.firstName + ' ' + user?.lastName}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleToggle}>
                {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                <span>Toggle Theme</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ returnTo: 'http://localhost:3000' })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
