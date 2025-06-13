import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";
import { MediaItem } from "@/interfaces/Media";

export const Dashboard = ({
  storageLimit,
  storageUsed,
  filesCount,
  media,
}: {
  storageLimit: number;
  storageUsed: number;
  filesCount: number;
  media: MediaItem[];
}) => {
  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
      <TopBar media={media}/>
      <Grid
        storageLimit={storageLimit}
        storageUsed={storageUsed}
        filesCount={filesCount}
      />
    </div>
  );
};
