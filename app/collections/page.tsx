'use client';
import * as React from 'react';
import { useState } from 'react';
import { Moon, Sun, Plus, Folder } from 'lucide-react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { CreateCollectionDialog } from '@/components/create-Collection';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { ComboboxDemo } from '@/components/ui/ComboboxDemo';
import { RoleFilter } from '@/components/ui/RoleFilter';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useMobile } from '@/hooks/use-mobile';
import { LogoutButton } from '@/components/logout-button';
import NotificationBar from '@/components/NotificationBar';

const CollectionSkeleton = () => (
  <div className="p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

const CollectionPage = () => {
  const isMobile = useMobile();
  const { user, loading: userLoading } = useAuth();
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; cursors: (string | null)[] }>({
    page: 1,
    pageSize: 5,
    cursors: [null], // Store cursors for each page
  });
  const { page, pageSize, cursors } = pagination;

  const collectionsData = useQuery(
    api.collectionFuncs.getCollectionsPaginated,
    user?.id
      ? {
          userId: user.id,
          paginationOpts: {
            numItems: pageSize,
            cursor: cursors[page - 1],
          },
        }
      : 'skip',
  );
  const collectionsLoading = collectionsData === undefined;

  // Since Convex doesn't provide a refetch function for this specific query pattern,
  // we'll define a placeholder or implement a manual refetch if needed
  // const refetch = () => {
  //   // In Convex, mutations automatically invalidate queries,
  //   // so manual refetching may not be needed in most cases
  //   // We'll implement a simple placeholder
  //   console.log('Refetching collections...');
  // };

  // Add state for role filtering
  const [selectedRole, setSelectedRole] = React.useState<string>('');

  // Transform the data to match the UI format while including role
  const allCollections =
    collectionsData?.page?.map((item) => ({
      label: item.collectionName,
      value: item.collectionId,
      documents: 0, // Placeholder - you can add document count to your schema
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Unknown', // Format the updatedAt
      role: item.role, // Include the role in the collection object
    })) || [];

  // Apply role filter if a role is selected
  const Collections = selectedRole
    ? allCollections.filter((collection) => collection.role === selectedRole)
    : allCollections;

  // Navigation functions
  const goToNextPage = React.useCallback(() => {
    if (collectionsData && !collectionsData.isDone) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
        cursors: [...prev.cursors, collectionsData.continueCursor ?? null],
      }));
    }
  }, [collectionsData]);

  const goToPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
        cursors: prev.cursors.slice(0, -1),
      }));
    }
  }, [page]);

  const hasNext = collectionsData ? !collectionsData.isDone : false;
  const hasPrevious = page > 1;

  return (
    <section className="min-h-screen w-full bg-linear-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-7xl h-[90vh] overflow-hidden">
        <Nav />

        <div className="mt-10">
          {!isMobile && (
            <div className="mb-10 text-center">
              {userLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-64 mx-auto" />
                  <p className="mt-2 text-lg text-muted-foreground">Welcome to PostPilot</p>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Hi {user?.firstName + ' ' + user?.lastName}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">Welcome to PostPilot</p>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar with actions */}
            {!isMobile && (
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card rounded-xl border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <CreateCollectionDialog>
                      <Button type="reset" variant="outline" className="flex w-full justify-start gap-2 h-12">
                        <Plus className="w-4 h-4" />
                        Create a new Collection
                      </Button>
                    </CreateCollectionDialog>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Filters</h2>
                  <div className="space-y-2">
                    {collectionsLoading ? (
                      <>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </>
                    ) : (
                      <>
                        <ComboboxDemo
                          frameworks={Collections.map((c) => ({ label: c.label, value: c.value, role: c.role }))}
                        />
                        <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Collection list */}
            <div className={isMobile ? 'col-span-1' : 'lg:col-span-2'}>
              {isMobile && (
                <div className="mb-4 flex justify-between">
                  <CreateCollectionDialog>
                    {/*<div className="flex w-full justify-start gap-2 h-12">*/}
                    <Plus className="w-4 h-4" />
                    Create a new Collection
                    {/*</div>*/}
                  </CreateCollectionDialog>

                  <FilterDropdown
                    collections={Collections}
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                  />
                </div>
              )}
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Collections</h2>
                    {collectionsLoading ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Page {page} • {Collections.length} collections
                      </p>
                    )}
                  </div>
                </div>

                <div className="divide-y">
                  {collectionsLoading ? (
                    // Show skeleton loading states when collections are loading
                    <>
                      <CollectionSkeleton />
                      <CollectionSkeleton />
                      <CollectionSkeleton />
                    </>
                  ) : Collections.length > 0 ? (
                    // Render actual collection items when loaded
                    Collections.map((collection) => (
                      <Link key={collection.value} href={`/collections/${collection.value}/Dashboard`}>
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
                              <p className="text-sm text-muted-foreground">• Updated {collection.updatedAt}</p>
                            </div>
                            {/* Display the role on the collection card */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  collection.role === 'Owner'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : collection.role === 'Contributor'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                }`}
                              >
                                {collection.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : selectedRole ? (
                    // Show filtered empty state when filters are applied but no results
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>No Collections Found</EmptyTitle>
                        <EmptyDescription>
                          No collections with the role &quot;{selectedRole}&quot; on this page. Try navigating to other
                          pages or removing the filter.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    // Show empty state when no collections exist
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>No Collections Yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any collections yet. Get started by creating your first collection.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>

                <div className="border-t p-4 flex justify-center">
                  <Pagination className="mb-0!">
                    <PaginationContent className="flex gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={goToPreviousPage}
                          className={`rounded-full cursor-pointer ${
                            !hasPrevious ? 'opacity-50 pointer-events-none' : 'hover:bg-accent'
                          }`}
                          aria-disabled={!hasPrevious}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink className="rounded-full" isActive={true}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                      {hasNext && (
                        <PaginationItem>
                          <PaginationLink
                            className="rounded-full cursor-pointer hover:bg-accent"
                            onClick={goToNextPage}
                          >
                            {page + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      {hasNext && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={goToNextPage}
                          className={`rounded-full cursor-pointer ${
                            !hasNext ? 'opacity-50 pointer-events-none' : 'hover:bg-accent'
                          }`}
                          aria-disabled={!hasNext}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex justify-center gap-2 text-center text-sm text-muted-foreground">
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>{' '}
        -{' '}
        <Link href="/privacy-policy" className="hover:underline">
          Privacy
        </Link>
      </footer>
    </section>
  );
};

export default CollectionPage;

const Nav = () => {
  const { user, loading: userLoading } = useAuth();
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
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

type CollectionType = {
  label: string;
  value: string;
  role: string;
};

const FilterDropdown = ({
  collections,
  selectedRole,
  onRoleChange,
}: {
  collections: CollectionType[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12">
          {/*<span className="mr-2">Filter</span>*/}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-filter"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Search</h3>
            <ComboboxDemo frameworks={collections.map((c) => ({ label: c.label, value: c.value, role: c.role }))} />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Role</h3>
            <RoleFilter selectedRole={selectedRole} onRoleChange={onRoleChange} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
