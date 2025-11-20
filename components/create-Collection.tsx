'use client';
import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
// import { createCollection } from '@/convex/collectionFuncs';
import { Spinner } from '@/components/ui/spinner';
// import { createCollection } from '@/convex/collectionFuncs';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { Button } from '@/components/ui/button';
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

export const CreateCollectionDialog = ({ children }: { children: React.ReactNode }) => {
  const [name, setName] = useState('');
  const { user, loading: userLoading } = useAuth();
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const createCollectionMutation = useMutation(api.collectionFuncs.createCollection);
  const [open, setOpen] = useState(false);

  if (userLoading) {
    return <Skeleton className="h-12 w-full" />;
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            setOpen(false);
          } catch (error) {
            console.error(error);
            toast.error('Failed to create collection');
          }
        }}
      >
        <DialogTrigger asChild>
          <div className="w-full gap-2 h-12 my-auto flex items-center justify-center">{children}</div>
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
