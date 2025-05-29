"use client";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useState } from "react";
import { Team } from "@/components/Team/Team";
import { Configuration } from "@/components/Configuration/configuration";
export default function Home(): JSX.Element {
  const [route, setRoute] = useState("Dashboard");
  const Navigation = (route: string) => {
    setRoute(route);
  };
  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar Callbackfunc={Navigation} route={route} />
      {
        route == "Dashboard" ?
          <Dashboard />:
          route == "Team" ?
          <Team />:
          <Configuration />
      }
    </main>
  );
}
