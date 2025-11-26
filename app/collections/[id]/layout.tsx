'use client';

import { ReactNode, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Spinner } from '@/components/ui/spinner';
import { useSidebar } from '@/app/secondLayer';

export default function CollectionLayout({ children }: { children: ReactNode }) {
    const { setSidebarOpen } = useSidebar();
    const params = useParams();
    const collectionId = params.id as string;
    const membership = useQuery(api.collectionFuncs.getMyMembership, {
        collectionId,
    });
    const router = useRouter();

    useEffect(() => {
        if (membership === null) {
            setSidebarOpen(false);
            setTimeout(() => {
                router.replace('/collections');
            }, 1500);
            notFound();
        } else if (membership) {
            setSidebarOpen(true);
        }
    }, [membership, router, setSidebarOpen]);

    if (membership === undefined) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    )
}
