'use client';
import { LogOut } from 'lucide-react';
export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        console.log('Logging out...');
      }}
      className="flex items-center w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </button>
  );
}
