import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiMail,
  FiUserPlus,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { Command } from "cmdk";
import {
  Authority,
  TeamMember,
  TMBrief,
  Notification,
} from "@/interfaces/User";
import {
  getTeamMembers,
  rejectJoiningToAChannel,
} from "@/firebase/user.firestore";
import { useUser } from "@/context/UserContext";
import {
  sendNotification,
  updateRole,
  deleteTeamMember,
} from "@/firebase/channel.firestore";
import { useChannel } from "@/context/ChannelContext";
import { DialogTitle } from "@radix-ui/react-dialog";

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  title: string;
}

const MemberDialog = ({
  open,
  onOpenChange,
  member,
  title,
}: MemberDialogProps) => {
  interface formDateInterface {
    email?: string;
    name?: string;
    avatar?: string;
    role: Authority;
  }
  const [formData, setFormData] = useState<formDateInterface>(
    member || { role: "Reviewer" }
  );
  console.log("member: " + member);
  const [searchResult, setSearchResult] = useState<TMBrief[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<TMBrief | null>(null);
  const { user } = useUser();
  const { channel } = useChannel();

  // Reset form data when member changes or dialog opens
  useEffect(() => {
    if (member) {
      setFormData({
        email: member.email,
        role: member.role,
      });
    } else {
      setFormData({ role: "Reviewer" });
    }
  }, [member, open]);

  const handleSubmit = async (state: "update" | "add") => {
    if (state == "add") {
      if (selectedMember && channel && user && formData.role) {
        await sendNotification(selectedMember, formData.role, channel, user);
      }
    } else {
      if (member && channel && member.role != formData.role)
        await updateRole(member, formData.role, channel);
    }
    setSelectedMember(null);
    onOpenChange(false);
    setFormData({ role: "Reviewer" });
  };

  const handleMemberSelect = (member: TMBrief) => {
    setFormData({
      ...formData,
      email: member.email,
      name: member.name,
      avatar: member.avatar,
    });
    setSelectedMember(member);
    setSearchQuery("");
    setSearchResult([]);
  };

  const handleMemberRemove = () => {
    setSelectedMember(null);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      onClick={() => onOpenChange(false)}
      label="Member Details"
      className="fixed inset-0 bg-stone-950/50 dark:bg-darkButtons flex items-center justify-center z-50">
      <DialogTitle></DialogTitle>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-secondDarkBackground rounded-lg w-full max-w-md mx-4 shadow-xl dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-darkBorder">
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-stone-700 dark:text-gray-400">
              Email
            </label>
            <div className="relative">
              {selectedMember || member ? (
                <div className="flex items-center justify-between p-2 bg-white dark:bg-secondDarkBackground rounded-lg border border-gray-200 dark:border-darkBorder">
                  <div>
                    <span className="text-sm font-semibold block dark:text-white">
                      {selectedMember?.name || member?.name}
                    </span>
                    <span className="text-xs block text-gray-500 dark:text-gray-400">
                      {selectedMember?.email || member?.email}
                    </span>
                  </div>
                  {!member && (
                    <button
                      onClick={handleMemberRemove}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-full transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 3) {
                      getTeamMembers(e.target.value).then((res) => {
                        setSearchResult(
                          res.filter(
                            (tm) =>
                              !channel?.TeamMembers.some(
                                (channelTM) => channelTM.email === tm.email
                              )
                          )
                        );
                      });
                    } else {
                      setSearchResult([]);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-secondDarkBackground dark:text-white"
                  placeholder="Search by email"
                />
              )}
              <div
                className={`absolute bg-white dark:bg-secondDarkBackground w-full rounded-lg py-1 top-full z-10 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] border border-gray-700 dark:border-darkBorder ${
                  searchQuery.length < 4 && "hidden"
                }`}>
                {searchResult.length > 0 ? (
                  searchResult.map((tm) => (
                    <div
                      key={tm.email}
                      onClick={() => handleMemberSelect(tm)}
                      className="p-3 hover:bg-[#eee] dark:hover:bg-darkBorder rounded-lg transition-colors duration-200 cursor-pointer border-b border-gray-700 dark:border-darkBorder last:border-b-0">
                      <div className="text-start">
                        <span className="text-sm font-semibold block dark:text-white">
                          {tm.name}
                        </span>
                        <span className="text-xs block text-gray-400 dark:text-gray-500 mt-0.5">
                          {tm.email}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center py-1 text-black/70 dark:text-white/70 font-bold text-sm">
                    There is no any email like that ...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 dark:text-gray-400">
              Role
            </label>
            <div className="relative">
              <select
                className="w-full relative px-3 py-2 rounded-lg border border-stone-300 dark:border-darkBorder focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-secondDarkBackground dark:text-white"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as TeamMember["role"],
                  })
                }>
                <option value="Reviewer">Reviewer</option>
                <option value="Contributor">Contributor</option>
              </select>
              <span className="pointer-events-none top-0 absolute inset-y-0 right-0 ml-3 flex items-center pr-1">
                <svg
                  className="size-4 sm:size-5 text-slate-600 dark:text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-stone-50 dark:bg-secondDarkBackground border-t border-stone-200 dark:border-darkBorder flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-200 dark:hover:bg-darkBorder rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(member ? "update" : "add")}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 rounded-lg transition-colors">
            {member ? "Update" : "Add"} Member
          </button>
        </div>
      </div>
    </Command.Dialog>
  );
};

export const Team = () => {
  const { channel } = useChannel();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [memberOnDelete, setMemberOnDelete] = useState<TeamMember | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const { user } = useUser();
  const handleDeleteMember = async () => {
    setIsDeletingMember(true);
    if (channel) {
      const memberToDelete = channel.TeamMembers.find(
        (m) => m.email === memberOnDelete?.email
      );
      if (memberToDelete) {
        if (memberOnDelete?.status === "pending" && channel && user?.email) {
          const notification: Notification = {
            Type: "Ask",
            owner: user?.email,
            channelName: channel.name,
            channelDescription: channel.description,
            channelId: channel.id,
          };
          await rejectJoiningToAChannel(notification, memberOnDelete.email);
        }
        await deleteTeamMember(memberToDelete, channel);
      }
    }
    setShowDeleteConfirm(false);
    setIsDeletingMember(false);
  };
  const getRoleBadgeColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "Owner":
        return "bg-violet-100 text-violet-800";
      case "Contributor":
        return "bg-blue-100 text-blue-800";
      case "Reviewer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: TeamMember["status"], invitedAt?: Date) => {
    if (status === "pending") {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <FiClock className="w-3 h-3" />
          <span className="text-xs">
            Pending (
            {invitedAt ? `Invited ${formatTimeAgo(invitedAt)}` : "Not accepted"}
            )
          </span>
        </div>
      );
    }
    return null;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white dark:bg-secondDarkBackground h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] border border-stone-200 dark:border-darkBorder transition-colors duration-300">
      <div className="flex p-4 h-16 justify-between items-center border-b border-stone-200 dark:border-darkBorder">
        <div>
          <h2 className="font-bold text-xl dark:text-white">Team Members</h2>
        </div>
        {channel?.authority == "Owner" && (
          <button
            onClick={() => setIsAddingMember(true)}
            className="flex text-sm items-center gap-2 bg-stone-100 dark:bg-darkButtons dark:hover:bg-darkBorder transition-colors hover:bg-violet-100 dark:hover:bg-violet-950 hover:text-violet-700 dark:hover:text-violet-300 px-3 py-1.5 rounded">
            <FiUserPlus className="text-violet-500" />
            <span className="dark:text-white">Add Member</span>
          </button>
        )}
      </div>

      <div className="py-6 px-16">
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 dark:bg-darkButtons border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                  Status
                </th>
                {channel?.authority == "Owner" && (
                  <th className="text-right py-3 px-4 text-sm font-medium text-stone-500 dark:text-stone-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {channel?.TeamMembers.map((member) => (
                <tr
                  key={member.email}
                  className="border-b border-stone-200 dark:border-stone-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="flex items-center justify-center rounded-full border-2 border-violet-900">
                          <img
                            src={member.avatar}
                            className="size-10 rounded-full shrink-0 bg-violet-500 shadow"
                            alt="avatar"
                          />
                        </span>
                      </div>
                      <span
                        className={
                          member.status === "pending"
                            ? "text-stone-500 dark:text-gray-400"
                            : "dark:text-white"
                        }>
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-stone-400 dark:text-gray-400" />
                      <span
                        className={
                          member.status === "pending"
                            ? "text-stone-500 dark:text-gray-400"
                            : "dark:text-white"
                        }>
                        {member.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        member.role
                      )}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(member.status)}</td>
                  {channel.authority == "Owner" && (
                    <td className="py-3 px-4 text-right">
                      {member.role !== "Owner" && (
                        <div className="flex items-center justify-end gap-2">
                          {
                            <>
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded">
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setMemberOnDelete(member);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded">
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          }
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center">
          <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-6 max-w-md w-full mx-4 shadow-xl dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
            <div className="flex items-start gap-4">
              <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  Delete TeamMember
                </h3>
                <p className="text-stone-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this Team Member? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-darkButtons rounded">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMember()}
                    disabled={isDeletingMember}
                    className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded${
                      isDeletingMember ? " opacity-60 cursor-not-allowed" : ""
                    }`}>
                    {isDeletingMember ? "Deleting..." : "Delete TeamMember"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MemberDialog
        open={isAddingMember}
        onOpenChange={setIsAddingMember}
        // onSubmit={handleAddMember}
        title="Add New Member"
      />

      <MemberDialog
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        member={editingMember || undefined}
        // onSubmit={handleUpdateMember}
        title="Edit Member"
      />
    </div>
  );
};
