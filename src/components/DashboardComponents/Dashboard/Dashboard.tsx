import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";

export const Dashboard = ({
  storageLimit,
  storageUsed,
  filesCount,
}: {
  storageLimit: number;
  storageUsed: number;
  filesCount: number;
}) => {
  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
      <TopBar />
      <Grid
        storageLimit={storageLimit}
        storageUsed={storageUsed}
        filesCount={filesCount}
      />
    </div>
  );
};
