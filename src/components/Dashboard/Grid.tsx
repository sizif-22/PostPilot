import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { UsageRadar } from "./UsageRadar";
import { RecentTransactions } from "./RecentTransactions";
import { Agenda } from "./Agenda";
import { Storage } from "./Storage";
import { Platforms } from "./Platforms";
interface ScheduledPost {
  id: string;
  title: string;
  start: Date;
  end: Date;
  platforms: string[];
  content: string;
  imageUrl?: string[];
}
export const Grid = ({dummyScheduledPosts}: {dummyScheduledPosts: ScheduledPost[]}) => {
  return (
    <div className="px-4 grid gap-y-[1vh] gap-x-3 grid-cols-3">
      {/* <StatCards />
      <ActivityGraph />
      <UsageRadar />
      <RecentTransactions /> */}
      <Agenda dummyScheduledPosts={dummyScheduledPosts} />      
      <Platforms />
      <Storage />
      {/* <div className="col-span-3 row-span-1 border shadow-sm rounded-lg p-4 h-[15vh] ">box5</div> */}
    </div>
  );
};