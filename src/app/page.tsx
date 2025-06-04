"use client";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";
import Loading from "@/components/ui/Loading";
export default function Home() {
  const { user } = useUser();
  if (user) {
    if (user.isVerified) {
      redirect("/channels");
    } else {
      redirect("/home");
    }
  } else {
    return <Loading />;
  }
}
