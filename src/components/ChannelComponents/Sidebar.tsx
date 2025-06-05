import React from "react";
import { AccountToggle } from "../DashboardComponents/Sidebar/AccountToggle";
// import { FiPlus } from "react-icons/fi";
import { Search } from "./Search";
import Link from "next/link";
export const Sidebar = () => {
  return (
    <div>
      <div className="overflow-y-scroll sticky h-[calc(100vh-32px-48px)]">
        <div className="border-b h-16 flex items-center justify-center border-stone-300">
          <Link href="/home">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 select-none tracking-wide cursor-pointer font-PlaywriteHU to-gray-600 text-transparent bg-clip-text">
              PostPilot
            </h1>
          </Link>
        </div>
        <AccountToggle />
        <Search />
        {/* TODO: Filter component... */}
        {/* TODO: Details Component... */}
      </div>
    </div>
  );
};
