import React from "react";
import { AccountToggle } from "./AccountToggle";
import { Search } from "./Search";
import { RouteSelect } from "./RouteSelect";
import { SettingsSection } from "./RouteSelect";

export const Sidebar = ({Callbackfunc , route} : {Callbackfunc: (route: string) => void, route: string}) => {
  return (
    <div>
      <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
        <AccountToggle />
        <Search />
        <RouteSelect Callbackfunc={Callbackfunc} route={route} />
      </div>

      <SettingsSection route={route} Callbackfunc={Callbackfunc} />
    </div>
  );
};
