import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";

export const Dashboard = () => {
  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow">
      <TopBar />
      <Grid />
    </div>
  );
};
