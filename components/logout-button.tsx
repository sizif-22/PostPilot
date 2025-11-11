'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/auth';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="flex items-center w-full">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </button>
    </form>
  );
}