'use client';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  handleFacebookConnect,
  handleLinkedInConnect,
  handleXConnect,
  handleYouTubeConnect,
} from './configuration-actions';

const socialMedia: { name: string; action: (id: string) => void }[] = [
  {
    name: 'Facebook(&Instagram)',
    action: handleFacebookConnect,
  },
  {
    name: 'LinkedIn',
    action: handleLinkedInConnect,
  },
  {
    name: 'X',
    action: handleXConnect,
  },
  {
    name: 'YouTube',
    action: handleYouTubeConnect,
  },
];

const Configuration = () => {
  const { id } = useParams();
  const router = useRouter();
  const collectionId = id as Id<'collection'>;
  const collection = useQuery(api.collectionFuncs.getCollectionById, { id: collectionId });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const updateCollection = useMutation(api.collectionFuncs.updateCollection);
  const deleteCollection = useMutation(api.collectionFuncs.deleteCollection);
  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection?.description || '');
    }
  }, [collection]);

  return (
    <section className="h-full p-4 md:px-16 overflow-auto">
      <h1 className="mb-2 font-bold text-xl">General</h1>
      <Separator />
      <div className="space-y-2 px-8">
        <br />
        <Label htmlFor="collection-name">Update Name:</Label>
        <Input
          type="text"
          id="collection-name"
          className="max-w-64"
          autoCorrect=""
          value={name}
          onChange={(e) => setName(e.target.value)}
        />{' '}
        <Button
          onClick={() => {
            updateCollection({ collectionId, name });
          }}
        >
          Update
        </Button>
        <br />
        <br />
        <Label htmlFor="collection-description">Update Description:</Label>
        <Textarea
          rows={2}
          autoCorrect=""
          id="collection-description"
          value={description}
          className="max-h-32"
          onChange={(e) => setDescription(e.target.value)}
        ></Textarea>
        <Button
          onClick={() => {
            updateCollection({ collectionId, description });
          }}
        >
          Update
        </Button>
      </div>
      <h1 className="mb-2 mt-8 font-bold text-xl">Social Media Connections</h1>
      <Separator />
      <h2 className="my-2 text-sm mx-8">Connect your social media accounts to enable posting</h2>
      <div className="p-2 border rounded-md mx-8">
        {socialMedia.map((platform, index) => (
          <div key={platform.name}>
            <div className="flex justify-between items-center px-4 py-2">
              <div>
                <h1 className="font-bold text-lg">Connect to {platform.name}</h1>
                <p>Connect your collection to {platform.name}</p>
              </div>
              <Button onClick={() => platform.action(collectionId)}>Connect</Button>
            </div>
            {socialMedia.length - 1 !== index && <Separator />}
          </div>
        ))}
      </div>
      <h1 className="mb-2 mt-8 font-bold text-xl text-destructive">Danger Zone</h1>
      <Separator />
      <h2 className="my-2 text-sm mx-8">Think Twice...</h2>

      <div className="p-2 border rounded-md mx-8 mt-2 border-destructive">
        <div className="flex justify-between items-center px-2 py-2">
          <div>
            <h1>Delete Collection</h1>
            <p>Once you delete a collection, there is no going back. Please be certain.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Collection</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this collection?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your collection and all of its data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteCollection({ collectionId });
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
export default Configuration;
