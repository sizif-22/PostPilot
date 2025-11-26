'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ban } from 'lucide-react';

interface Session {
    _id: Id<'sessions'>;
    collectionId: Id<'collection'>;
    createdAt: string;
    expiresAt: string;
    actionCount: number;
    status: string;
}

interface SessionsTableProps {
    sessions: Session[];
}

export function SessionsTable({ sessions }: SessionsTableProps) {
    const terminateSession = useMutation(api.sessions.terminateSession);

    const copyLink = (sessionId: string) => {
        const url = `${window.location.origin}/client/${sessionId}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const handleTerminate = async (sessionId: Id<'sessions'>) => {
        try {
            await terminateSession({ sessionId });
            toast.success('Session terminated');
        } catch (error) {
            toast.error('Failed to terminate session');
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Expires At</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No active sessions.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sessions.map((session) => (
                            <TableRow key={session._id}>
                                <TableCell className="font-mono text-xs">{session._id}</TableCell>
                                <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(session.expiresAt).toLocaleDateString()}</TableCell>
                                <TableCell>{session.actionCount} / 50</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            session.status === 'active'
                                                ? 'default'
                                                : session.status === 'expired'
                                                    ? 'secondary'
                                                    : 'destructive'
                                        }
                                    >
                                        {session.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-start gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyLink(session._id)}
                                            title="Copy Link"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            title="Open Session"
                                        >
                                            <a href={`/client/${session._id}`} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        {session.status === 'active' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleTerminate(session._id)}
                                                title="Terminate Session"
                                                className="text-destructive hover:text-destructive/90"
                                            >
                                                <Ban className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
