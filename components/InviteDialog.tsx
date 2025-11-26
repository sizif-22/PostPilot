'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface InviteDialogProps {
    collectionId: Id<'collection'>;
    currentUserId: string;
}

export function InviteDialog({ collectionId, currentUserId }: InviteDialogProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Viewer');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const createInvitation = useMutation(api.invitations.createInvitation);

    const handleInvite = async () => {
        if (!email) return;
        setIsLoading(true);
        try {
            await createInvitation({
                email,
                collectionId,
                invitedBy: currentUserId,
                role,
            });
            setIsOpen(false);
            setEmail('');
            setRole('Viewer'); // Reset to default
            // Optionally show success toast
        } catch (error) {
            console.error('Failed to invite:', error);
            // Optionally show error toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Invite People</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite to Team</DialogTitle>
                    <DialogDescription>
                        Enter the email address of the person you want to invite to this collection.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="colleague@example.com"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Role</Label>
                        <RadioGroup value={role} onValueChange={setRole} className="col-span-3 flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Viewer" id="viewer" />
                                <Label htmlFor="viewer" className="font-normal">Viewer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Contributor" id="contributor" />
                                <Label htmlFor="contributor" className="font-normal">Contributor</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleInvite} disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
