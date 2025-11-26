'use client';
import * as React from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Users, LayoutDashboard, Settings, ImagesIcon, CalendarDays, BookOpen } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { Skeleton } from './ui/skeleton';

const sections = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendar',
    icon: CalendarDays,
  },
  {
    title: 'Media',
    icon: ImagesIcon,
  },
  {
    title: 'Team',
    icon: Users,
  },
  {
    title: 'Issues',
    icon: BookOpen,
  },
  {
    title: 'Configuration',
    icon: Settings,
  },
];

export function AppSidebar({
  collectionId,
  ...props
}: {
  collectionId?: Id<'collection'>;
} & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const route = pathname.split('/').pop();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Suspense fallback={<Skeleton className="h-8 w-full" />}>
          {collectionId && <TeamSwitcher collectionId={collectionId} />}
        </Suspense>
      </SidebarHeader>
      <SidebarContent>
        {/*<NavMain items={data.navMain} />*/}
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {sections.map((section) => (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton
                  tooltip={section.title}
                  asChild
                  className={route === section.title ? 'dark:bg-white/20 bg-black text-white' : ''}
                  onClick={() => {
                    router.replace(`./${section.title}`);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {section.icon && <section.icon />}
                    <span>{section.title}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<Skeleton className="h-8 w-full" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
