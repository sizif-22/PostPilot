"use client";
import Loading from "@/components/ui/Loading";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";
export default function Home() {
  const { user } = useUser();
  if (!user) {
    return <Loading />;
  }else{
    if (user?.isLoggedIn) {
      redirect("/channels");
    } else {
      redirect("/home");
    }
  }
  
}
