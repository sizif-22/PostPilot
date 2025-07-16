"use client";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";
export default function Home() {
  const { user } = useUser();
  if (!user) {
    redirect("/home");
  } else {
    redirect("/channel");
  }
}
