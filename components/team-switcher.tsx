'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateCollectionDialog } from '@/components/create-Collection';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export function TeamSwitcher({ collectionId }: { collectionId: Id<'collection'> }) {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const currentCollection = useQuery(
    api.collectionFuncs.getCollectionById,
    collectionId ? { id: collectionId } : 'skip',
  );
  const recentCollections = useQuery(api.collectionFuncs.getRecentCollections, {
    userId: user?.id || '',
  });

  if (!currentCollection || !recentCollections) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="opacity-50" disabled>
            <Skeleton className="aspect-square size-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <Skeleton className="h-4 w-24" />
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex text-2xl font-bold font-serif aspect-square size-8 items-center justify-center rounded-lg">
                {/* You can add a logo or initial here */}
                {currentCollection?.name?.charAt(0) || 'C'}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentCollection?.name || 'Collection'}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Recent Collections</DropdownMenuLabel>
            {recentCollections?.map((collection) => (
              <Link href={`/collections/${collection.collectionId}`} key={collection._id}>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center text-lg font-bold font-serif rounded-md border">
                    {collection?.name?.charAt(0) || 'C'}{' '}
                  </div>
                  {collection.name}
                </DropdownMenuItem>
              </Link>
            ))}
            <DropdownMenuSeparator />
            {/*<Link href="/collections/create">*/}
            <CreateCollectionDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 p-2 w-full">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Create Collection</div>
              </DropdownMenuItem>
            </CreateCollectionDialog>
            {/*</Link>*/}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
