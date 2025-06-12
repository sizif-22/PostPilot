import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { UsageRadar } from "./UsageRadar";
import { RecentTransactions } from "./RecentTransactions";
import { Upcoming } from "./Upcoming";
import { Storage } from "./Storage";
import { Platforms } from "./Platforms";

export const Grid = ({
  storageLimit,
  storageUsed,
  filesCount,
}: {
  storageLimit: number;
  storageUsed: number;
  filesCount: number;
}) => {
  return (
    <div className="px-4 grid gap-y-[1vh] gap-x-3 grid-cols-3">
      {/* <StatCards />
      <ActivityGraph />
      <UsageRadar />
      <RecentTransactions /> */}
      <Upcoming />
      <Platforms />
      <Storage
        storageLimit={storageLimit}
        storageUsed={storageUsed}
        filesCount={filesCount}
      />
      {/* <div className="col-span-3 row-span-1 border shadow-sm rounded-lg p-4 h-[15vh] ">box5</div> */}
    </div>
  );
};
