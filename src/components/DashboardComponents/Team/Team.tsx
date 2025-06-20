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
import { Authority, TeamMember, TMBrief } from "@/interfaces/User";
import { getTeamMembers } from "@/firebase/user.firestore";
import { useUser } from "@/context/UserContext";
import {
  sendNotification,
  updateRole,
  deleteTeamMember,
} from "@/firebase/channel.firestore";
import { useChannel } from "@/context/ChannelContext";

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
      className="fixed inset-0 bg-stone-950/50 flex items-center justify-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-stone-700">Email</label>
            <div className="relative">
              {selectedMember || member ? (
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                  <div>
                    <span className="text-sm font-semibold block">
                      {selectedMember?.name || member?.name}
                    </span>
                    <span className="text-xs block text-gray-500">
                      {selectedMember?.email || member?.email}
                    </span>
                  </div>
                  {!member && (
                    <button
                      onClick={handleMemberRemove}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Search by email"
                />
              )}
              <div
                className={`absolute bg-white w-full rounded-lg py-1 top-full z-10 shadow-lg border border-gray-700 ${
                  searchQuery.length < 4 && "hidden"
                }`}>
                {searchResult.length > 0 ? (
                  searchResult.map((tm) => (
                    <div
                      key={tm.email}
                      className="p-3 hover:bg-[#eee] rounded-lg transition-colors duration-200 cursor-pointer border-b border-gray-700 last:border-b-0"
                      onClick={() => handleMemberSelect(tm)}>
                      <div className="text-start">
                        <span className="text-sm font-semibold block">
                          {tm.name}
                        </span>
                        <span className="text-xs block text-gray-400 mt-0.5">
                          {tm.email}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center py-1 text-black/70 font-bold text-sm">
                    There is no any email like that ...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Role</label>
            <div className="relative">
              <select
                className="w-full relative px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                  className="size-4 sm:size-5 text-slate-600"
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

        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(member ? "update" : "add")}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors">
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
  const handleDeleteMember = async () => {
    if (channel) {
      const memberToDelete = channel.TeamMembers.find(
        (m) => m.email === memberOnDelete?.email
      );
      if (memberToDelete) {
        await deleteTeamMember(memberToDelete, channel);
      }
    }
    setShowDeleteConfirm(false);
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
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow">
      <div className="flex p-4 h-16 justify-between items-center border-b border-stone-200">
        <div>
          <h2 className="font-bold text-xl">Team Members</h2>
        </div>
        {channel?.authority == "Owner" && (
          <button
            onClick={() => setIsAddingMember(true)}
            className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
            <FiUserPlus className="text-violet-500" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      <div className="py-6 px-16">
        <div className="rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                  Status
                </th>
                {channel?.authority == "Owner" && (
                  <th className="text-right py-3 px-4 text-sm font-medium text-stone-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {channel?.TeamMembers.map((member) => (
                <tr key={member.email} className="border-b border-stone-200">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-violet-700 font-medium">
                          {member.name?.charAt(0)}
                        </span>
                      </div>
                      <span
                        className={
                          member.status === "pending" ? "text-stone-500" : ""
                        }>
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-stone-400" />
                      <span
                        className={
                          member.status === "pending" ? "text-stone-500" : ""
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
                          {member.status === "active" && (
                            <>
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setMemberOnDelete(member);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
        <div className="fixed inset-0 bg-stone-950/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-start gap-4">
              <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Delete TeamMember
                </h3>
                <p className="text-stone-600 mb-4">
                  Are you sure you want to delete this Team Member? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMember()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded">
                    Delete TeamMember
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
