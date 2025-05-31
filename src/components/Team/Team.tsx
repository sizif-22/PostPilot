import React, { useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiCheck,
  FiX,
  FiUserPlus,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { Command } from "cmdk";
import { Select } from "../Calendar/ContinuousCalendar";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "contributor" | "inspector";
  status: "active" | "pending";
  invitedAt?: Date;
  avatarUrl?: string;
}

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  onSubmit: (member: Partial<TeamMember>) => void;
  title: string;
}

const MemberDialog = ({
  open,
  onOpenChange,
  member,
  onSubmit,
  title,
}: MemberDialogProps) => {
  const [formData, setFormData] = useState<Partial<TeamMember>>(member || {});

  // Reset form data when member changes or dialog opens
  React.useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
      });
    } else {
      setFormData({});
    }
  }, [member, open]);

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.role) {
      onSubmit(formData);
      onOpenChange(false);
      setFormData({});
    }
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      onClick={() => onOpenChange(false)}
      label="Member Details"
      className="fixed inset-0 bg-stone-950/50 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={formData?.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
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
                }
              >
                <option value="inspector">Inspector</option>
                <option value="contributor">Contributor</option>
              </select>
              <span className="pointer-events-none top-0 absolute inset-y-0 right-0 ml-3 flex items-center pr-1">
                <svg
                  className="size-4 sm:size-5 text-slate-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
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
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors"
            disabled={!formData.name || !formData.email || !formData.role}
          >
            {member ? "Update" : "Add"} Member
          </button>
        </div>
      </div>
    </Command.Dialog>
  );
};

export const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "contributor",
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "inspector",
      status: "active",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "contributor",
      status: "pending",
      invitedAt: new Date(),
    },
  ]);

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleAddMember = (newMember: Partial<TeamMember>) => {
    setMembers([
      ...members,
      {
        id: Date.now().toString(),
        name: newMember.name!,
        email: newMember.email!,
        role: newMember.role!,
        status: "pending",
        invitedAt: new Date(),
      },
    ]);
  };

  const handleUpdateMember = (updatedMember: Partial<TeamMember>) => {
    if (editingMember) {
      setMembers(
        members.map((member) =>
          member.id === editingMember.id
            ? { ...member, ...updatedMember }
            : member
        )
      );
      setEditingMember(null);
    }
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleResendInvite = (id: string) => {
    // Here you would typically make an API call to resend the invitation
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, invitedAt: new Date() } : member
      )
    );
  };

  const getRoleBadgeColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner":
        return "bg-violet-100 text-violet-800";
      case "contributor":
        return "bg-blue-100 text-blue-800";
      case "inspector":
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
      <div className="flex p-3 h-16 justify-between items-center px-6 border-b border-stone-200">
        <div>
          <h2 className="font-bold text-xl">Team Members</h2>
        </div>
        <button
          onClick={() => setIsAddingMember(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
        >
          <FiUserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
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
                <th className="text-right py-3 px-4 text-sm font-medium text-stone-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-stone-200">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-violet-700 font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <span
                        className={
                          member.status === "pending" ? "text-stone-500" : ""
                        }
                      >
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
                        }
                      >
                        {member.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(member.status, member.invitedAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {member.role !== "owner" && (
                      <div className="flex items-center justify-end gap-2">
                        {member.status === "pending" ? (
                          <button
                            onClick={() => handleResendInvite(member.id)}
                            className="flex items-center gap-1 px-2 py-1 text-amber-600 hover:bg-amber-50 rounded text-sm"
                          >
                            <FiRefreshCw className="w-3 h-3" />
                            <span>Resend</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingMember(member)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MemberDialog
        open={isAddingMember}
        onOpenChange={setIsAddingMember}
        onSubmit={handleAddMember}
        title="Add New Member"
      />

      <MemberDialog
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        member={editingMember || undefined}
        onSubmit={handleUpdateMember}
        title="Edit Member"
      />
    </div>
  );
};
