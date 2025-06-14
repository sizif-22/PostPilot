import React from "react";
import { AccountToggle } from "../DashboardComponents/Sidebar/AccountToggle";
// import { FiPlus } from "react-icons/fi";
import { Search } from "./Search";
import Link from "next/link";
import NotificationSection from "../DashboardComponents/Sidebar/notification";
export const Sidebar = () => {
  return (
      <div className="overflow-y-scroll h-[calc(100vh-32px-48px)]">
        <NotificationSection/>
        <AccountToggle />
        <Search />
        {/* TODO: Filter component... */}
        {/* TODO: Details Component... */}
      </div>
  );
};
