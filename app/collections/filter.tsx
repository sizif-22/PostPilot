'use client';
import * as React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ComboboxDemo } from '@/components/ui/ComboboxDemo';
import { RoleFilter } from '@/components/ui/RoleFilter';

type CollectionType = {
  label: string;
  value: string;
  role: string;
};

export const FilterDropdown = ({
  collections,
  selectedRole,
  onRoleChange,
}: {
  collections: CollectionType[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12">
          {/*<span className="mr-2">Filter</span>*/}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-filter"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Search</h3>
            <ComboboxDemo frameworks={collections.map((c) => ({ label: c.label, value: c.value, role: c.role }))} />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Role</h3>
            <RoleFilter selectedRole={selectedRole} onRoleChange={onRoleChange} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
