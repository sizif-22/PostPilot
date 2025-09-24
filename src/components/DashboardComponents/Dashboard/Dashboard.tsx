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
    <div className="bg-white dark:bg-secondDarkBackground dark:border-darkBorder lg:h-[calc(100vh-2rem)] lg-min-h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] border border-stone-200  transition-colors duration-300">
      <TopBar media={media} />
      <Grid
        storageLimit={storageLimit}
        storageUsed={storageUsed}
        filesCount={filesCount}
        media={media}
      />
    </div>
  );
};
