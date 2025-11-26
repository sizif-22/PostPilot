'use client';

import { useEffect } from 'react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function UserSync() {
    const { user } = useAuth();
    const syncUser = useMutation(api.users.syncUser);

    useEffect(() => {
        if (user) {
            syncUser({
                userId: user.id,
                name: `${user.firstName} ${user.lastName ?? ""}`,
                email: user.email || "",
                image: user.profilePictureUrl || "",
            });
        }
    }, [user, syncUser]);

    return null;
}
