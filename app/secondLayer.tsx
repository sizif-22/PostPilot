'use client';
import CollectionSidebar from './collections/[id]/sidebar';
import { Id } from '@/convex/_generated/dataModel';
import { useParams, usePathname } from 'next/navigation';
import { useState, createContext, useContext } from 'react';

const sidebarContext = createContext<{ sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void } | undefined>(undefined);
export default function SecondLayer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const collectionId = id as Id<'collection'>;

  return (
    <sidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {collectionId && sidebarOpen && pathname.includes('/collections') ? <CollectionSidebar collectionId={collectionId}>{children}</CollectionSidebar> : <>{children}</>}
    </sidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(sidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SecondLayer component');
  }
  return context;
};
