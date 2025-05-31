import React from "react";
import { AccountToggle } from "./AccountToggle";
import { Search } from "./Search";
import { RouteSelect } from "./RouteSelect";
import { SettingsSection } from "./RouteSelect";

export const Sidebar = ({Callbackfunc , route} : {Callbackfunc: (route: string) => void, route: string}) => {
  return (
    <div>
      <div className="overflow-y-scroll sticky h-[calc(100vh-32px-48px)]">
      <div className="border-b h-16 flex items-center justify-center border-stone-300">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 select-none tracking-wide cursor-pointer font-PlaywriteHU to-gray-600 text-transparent bg-clip-text">PostPilot</h1>
      </div>
        <AccountToggle />
        {/* <Search /> */}
        <RouteSelect Callbackfunc={Callbackfunc} route={route} />
      </div>

      <SettingsSection route={route} Callbackfunc={Callbackfunc} />
    </div>
  );
};
