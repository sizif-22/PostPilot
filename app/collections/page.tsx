'use client';
import * as React from 'react';
import { useState } from 'react';
import { Moon, Sun, Plus, Folder } from 'lucide-react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
// import { createCollection } from '@/convex/collectionFuncs';
import { Spinner } from '@/components/ui/spinner';
// import { createCollection } from '@/convex/collectionFuncs';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from 'convex/react';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComboboxDemo } from '@/components/ui/ComboboxDemo';
// import { Separator } from '@/components/ui/separator';
import { RoleFilter } from '@/components/ui/RoleFilter';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { user, loading: userLoading } = useAuth();

  // Pagination state
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; cursors: (string | null)[] }>({
    page: 1,
    pageSize: 5,
    cursors: [null], // Store cursors for each page
  });
  const { page, pageSize, cursors } = pagination;

  // Fetch collections with role information and pagination
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

  // Check if collections data is loading
  const collectionsLoading = collectionsData === undefined;

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
        cursors: [...prev.cursors, collectionsData.continueCursor],
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
      <div className="mx-auto max-w-7xl">
        <Nav />

        <div className="mt-10">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar with actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <CreateCollectionDialog />
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

            {/* Collection list */}
            <div className="lg:col-span-2">
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
                            {/*<Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Open
                            </Button>*/}
                          </div>
                        </div>
                      </div>
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

          <footer className="fixed bottom-5 left-0 right-0 mt-12 text-center text-sm text-muted-foreground">
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

export default CollectionPage;
import { LogoutButton } from '@/components/logout-button';

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
      <DropdownMenu>
        {userLoading ? (
          <Skeleton className="h-9 w-9 rounded-lg" />
        ) : (
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 rounded-lg cursor-pointer">
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
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

const CreateCollectionDialog = () => {
  const [name, setName] = useState('');
  const { user, loading: userLoading } = useAuth();
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const createCollectionMutation = useMutation(api.collectionFuncs.createCollection);

  if (userLoading) {
    return <Skeleton className="h-12 w-full" />;
  }
  return (
    <Dialog>
      <form
        id="createCollection"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            setProcessing(true);
            if (!user) throw new Error('User not found');
            await createCollectionMutation({ name, description, userId: user.id });
            setName('');
            setDescription('');
            setProcessing(false);
            toast.success('Collection created successfully');
          } catch (error) {
            console.error(error);
            toast.error('Failed to create collection');
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 h-12">
            <Plus className="w-4 h-4" />
            Create a new Collection
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new Collection</DialogTitle>
            <DialogDescription>
              You can manage all Social Media Platforms for one Entity in one place.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 mb-2">
            <div className="grid gap-3">
              <Label htmlFor="collectionName">Collection Name</Label>
              <Input
                id="collectionName"
                form="createCollection"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={processing}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={processing}
              />{' '}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={processing}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" form="createCollection" disabled={processing}>
              {processing ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
