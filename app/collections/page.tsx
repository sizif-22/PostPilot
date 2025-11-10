'use client';
import * as React from 'react';
// import { useState } from 'react';
import { Moon, Sun, Plus, Folder, FileText } from 'lucide-react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
// import { createCollection } from '@/convex/collectionFuncs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { IconFolderCode } from '@tabler/icons-react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComboboxDemo } from '@/components/ui/ComboboxDemo';
// import { Separator } from '@/components/ui/separator';
import { RoleFilter } from '@/components/ui/RoleFilter';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';

const CollectionPage = () => {
  // const [name, setName] = useState('');
  // const [description, setDescription] = useState('');
  // const createCollectionMutation = useMutation(api.collectionFuncs.createCollection);
  const { user } = useAuth();

  // Fetch collections with role information
  const collectionsWithRole =
    useQuery(api.collectionFuncs.getCollections, {
      userId: user?.id || '',
    }) || [];

  // Add state for role filtering
  const [selectedRole, setSelectedRole] = React.useState<string>('');

  // Transform the data to match the UI format while including role
  let Collections = collectionsWithRole.map((item) => ({
    label: item.collectionName,
    value: item.collectionId,
    documents: 0, // Placeholder - you can add document count to your schema
    lastUpdated: item._creationTime ? new Date(item._creationTime).toISOString().split('T')[0] : 'Unknown',
    role: item.role, // Include the role in the collection object
  }));

  // Apply role filter if a role is selected
  if (selectedRole) {
    Collections = Collections.filter((collection) => collection.role === selectedRole);
  }

  return (
    <section className="min-h-screen w-full bg-linear-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Nav />

        <div className="mt-10">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Hi {user?.firstName + ' ' + user?.lastName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">Welcome to PostPilot</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar with actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {[{ label: 'Create a new Collection', icon: Plus }].map((action, index) => (
                    <Button key={index} variant="outline" className="w-full justify-start gap-2 h-12">
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                <div className="space-y-2">
                  <ComboboxDemo
                    frameworks={Collections.map((c) => ({ label: c.label, value: c.value, role: c.role }))}
                  />
                  <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />
                </div>
              </div>
            </div>

            {/* Collection list */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Collections</h2>
                    <p className="text-sm text-muted-foreground">{Collections.length} collections</p>
                  </div>
                </div>

                <div className="divide-y">
                  {Collections.map((collection) => (
                    <div
                      key={collection.value}
                      className="p-4 hover:bg-accent/30 transition-all duration-200 cursor-pointer rounded-lg border border-transparent hover:border-border group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {collection.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {collection.documents} documents • Updated {collection.lastUpdated}
                          </p>
                        </div>
                        {/* Display the role on the collection card */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              collection.role === 'Owner'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : collection.role === 'Contributer'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {collection.role}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Collections.length == 0 && (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>No Projects Yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any projects yet. Get started by creating your first project.
                        </EmptyDescription>
                      </EmptyHeader>
                      {/*<EmptyContent>
                        <div className="flex gap-2">
                          <Button>Create Project</Button>
                          <Button variant="outline">Import Project</Button>
                        </div>
                      </EmptyContent>*/}
                    </Empty>
                  )}
                </div>

                <div className="border-t p-4 flex justify-center">
                  <Pagination className="mb-0!">
                    <PaginationContent className="flex gap-1">
                      <PaginationItem>
                        <PaginationPrevious href="#" className="rounded-full" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" className="rounded-full">
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive className="rounded-full bg-primary text-primary-foreground">
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" className="rounded-full">
                          3
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" className="rounded-full" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 text-center text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>{' '}
            -{' '}
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default CollectionPage;
const Nav = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-9 w-9 rounded-lg cursor-pointer">
            <AvatarFallback className="rounded-lg bg-muted">
              {user?.firstName?.slice(0, 2)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-xl" side={'bottom'} align="end" sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-3 py-4 text-left">
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-muted">
                  {user?.firstName?.slice(0, 2)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.firstName + ' ' + user?.lastName}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleToggle}>
              {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              <span>Toggle Theme</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};
