'use client';
import CollectionSidebar from './collections/[id]/sidebar';
import { Id } from '@/convex/_generated/dataModel';
import { useParams } from 'next/navigation';
export default function SecondLayer({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const collectionId = id as Id<'collection'>;

  return (
    <>
      {collectionId ? <CollectionSidebar collectionId={collectionId}>{children}</CollectionSidebar> : <>{children}</>}
    </>
  );
}
