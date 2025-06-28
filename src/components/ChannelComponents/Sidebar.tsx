import React from "react";
import { AccountToggle } from "../DashboardComponents/Sidebar/AccountToggle";
// import { FiPlus } from "react-icons/fi";
import { Search } from "./Search";
import Link from "next/link";
import NotificationSection from "../DashboardComponents/Sidebar/notification";
import { ThemeToggle } from "../DashboardComponents/Sidebar/ThemeToggle";
export const Sidebar = () => {
  return (
    <div>
      <div className="overflow-y-scroll h-[calc(100vh-32px-48px)]">
        <NotificationSection />
        <AccountToggle />
        {/* <Search /> */}
      </div>
      <div className="flex sticky top-[calc(100vh_-_48px_-_16px)] flex-col h-12 border-t px-2 border-stone-300 dark:border-stone-800 justify-end text-xs">
          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center justify-center w-full">
              <ThemeToggle className=" rounded" />
            </div>
          </div>
        </div>
    </div>
  );
};
