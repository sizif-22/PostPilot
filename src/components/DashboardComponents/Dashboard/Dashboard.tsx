import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";
import { Post } from "@/interfaces/Channel";

export const Dashboard = ({
  dummyScheduledPosts,
  storageLimit,
  storageUsed,
  filesCount,
}: {
  dummyScheduledPosts: Post[];
  storageLimit: number;
  storageUsed: number;
  filesCount: number;
}) => {
  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
      <TopBar />
      <Grid
        dummyScheduledPosts={dummyScheduledPosts}
        storageLimit={storageLimit}
        storageUsed={storageUsed}
        filesCount={filesCount}
      />
    </div>
  );
};
