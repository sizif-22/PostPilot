'use client';
import { Table, TableRow, TableBody, TableHead, TableHeader, TableCell } from "@/components/ui/table";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect, useState } from "react";
import { InviteDialog } from "@/components/InviteDialog";
import { CreateSessionButton } from "@/components/CreateSessionButton";
import { SessionsTable } from "@/components/SessionsTable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Team = () => {
  const params = useParams();
  const collectionId = params.id as Id<"collection">;
  const { user } = useAuth();



  // Fetch data
  const teamMembers = useQuery(api.collectionFuncs.getTeamMembers, { collectionId });
  const invitations = useQuery(api.invitations.getInvitations, { collectionId });
  const sessions = useQuery(api.sessions.getSessions, { collectionId });

  const updateMemberRole = useMutation(api.collectionFuncs.updateMemberRole);
  const removeMember = useMutation(api.collectionFuncs.removeMember);
  const updateInvitationRole = useMutation(api.invitations.updateInvitationRole);
  const deleteInvitation = useMutation(api.invitations.deleteInvitation);

  const [filter, setFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'member' | 'invitation' | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Find current user's role
  const currentUserRole = teamMembers?.find(m => m.userId === user?.id)?.role;
  const isOwner = currentUserRole === 'Owner';

  // Combine team and invitations for display
  const allUsers = [
    ...(teamMembers || []).map(m => ({
      id: m.userId,
      type: 'member' as const,
      name: m.user?.name || 'Unknown',
      email: m.user?.email || '',
      role: m.role,
      image: m.user?.image || '',
      status: 'Active'
    })),
    ...(invitations || []).map(i => ({
      id: i._id,
      type: 'invitation' as const,
      name: 'Invited User',
      email: i.email,
      role: i.role,
      image: '',
      status: i.status
    }))
  ].filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const handleRoleChange = async (id: string, newRole: string, type: 'member' | 'invitation') => {
    try {
      if (type === 'member') {
        await updateMemberRole({ collectionId, userId: id, role: newRole });
      } else {
        await updateInvitationRole({ invitationId: id as Id<"invitations">, role: newRole });
      }
      toast.success("Role updated");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteClick = (id: string, type: 'member' | 'invitation') => {
    setDeleteId(id);
    setDeleteType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      if (deleteType === 'member') {
        await removeMember({ collectionId, userId: deleteId });
      } else {
        await deleteInvitation({ invitationId: deleteId as Id<"invitations"> });
      }
      toast.success(deleteType === 'member' ? "Member removed" : "Invitation cancelled");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to remove");
    }
  };


  // ...

  if (!teamMembers || !sessions) {
    return (
      <section className="flex flex-col gap-6 px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="rounded-md border p-4 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 px-4 py-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team & Sessions</h1>
          <p className="text-muted-foreground">Manage your team members and client sessions.</p>
        </div>
        <div className="flex gap-2">
          {user && <InviteDialog collectionId={collectionId} currentUserId={user.id} />}
          <CreateSessionButton collectionId={collectionId} />
        </div>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {isOwner && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isOwner ? 5 : 4} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allUsers.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted">
                            {item.image ? (
                              <Image
                                fill
                                src={item.image}
                                alt={item.name}
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-medium">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="font-medium">{item.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        {isOwner && item.id !== user?.id ? (
                          <Select
                            defaultValue={item.role}
                            onValueChange={(val) => handleRoleChange(item.id, val, item.type)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Owner">Owner</SelectItem>
                              <SelectItem value="Contributor">Contributor</SelectItem>
                              <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{item.role}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      {isOwner && (
                        <TableCell>
                          {item.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                              onClick={() => handleDeleteClick(item.id, item.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsTable sessions={sessions || []} />
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleteType === 'member' ? 'Team Member' : 'Invitation'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {deleteType === 'member' ? 'remove this user from the team' : 'cancel this invitation'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
export default Team;
