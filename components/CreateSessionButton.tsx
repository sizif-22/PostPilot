'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2, Plus } from 'lucide-react';

interface CreateSessionButtonProps {
    collectionId: Id<'collection'>;
}

export function CreateSessionButton({ collectionId }: CreateSessionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const createSession = useMutation(api.sessions.createSession);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            await createSession({ collectionId });
            // Optionally show success toast
        } catch (error) {
            console.error('Failed to create session:', error);
            // Optionally show error toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Plus className="mr-2 h-4 w-4" />
            )}
            Create Session
        </Button>
    );
}
