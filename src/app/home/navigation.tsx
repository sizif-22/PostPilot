import React from "react";
import { ThemeToggle } from "@/components/DashboardComponents/Sidebar/ThemeToggle";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const Navigation = () => {
  const router = useRouter();
  const { user } = useUser();
  const Buttons = [
    {
      name: "About",
      href: "#about",
    },
    {
      name: "Contact-Us",
      href: "#contact",
    },
    {
      name: "Privacy-Policy",
      href: "/privacy-policy",
    },
  ];

  return (
    <nav className="fixed top-0 w-full transition-all duration-300 dark:bg-black/90 bg-white/90 backdrop-blur-sm z-50 dark:border-violet-900 border-violet-200">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="select-none cursor-pointer text-xl sm:text-2xl font-PlaywriteHU dark:text-violet-400 text-violet-700 font-bold">
            PostPilot
          </h1>
          <div className="flex items-center gap-2 sm:gap-6">
            {Buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className="text-sm sm:text-base dark:text-zinc-400  text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors">
                {button.name}
              </Link>
            ))}
            <ThemeToggle />
            {user?.isLoggedIn && (
              <>
                <span className="text-black dark:text-white">|</span>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="rounded-full border border-violet-600 w-10 h-10 overflow-hidden p-0.5 flex items-center justify-center">
                      <img
                        src="https://api.dicebear.com/9.x/notionists/svg?seed=5"
                        alt="avatar"
                        className="size-8 rounded-full shrink-0 bg-violet-500 shadow"
                      />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-fit">
                    <div className="flex justify-between gap-3">
                      <Avatar>
                        <AvatarImage
                          src="https://api.dicebear.com/9.x/notionists/svg?seed=5"
                          className="bg-violet-500"
                        />
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-semibold">{user.name}</h4>
                        <p className="text-sm dark:text-white/60 text-black/60">
                          {user.email}
                        </p>
                        <p className="text-sm dark:text-white/60 text-black/60">
                          {user.channels.length > 0
                            ? `You have: ${user.channels.length} channel`
                            : "You have no channels yet."}
                        </p>
                        <Button
                          onClick={() => {
                            router.push("/channels");
                          }}
                          variant={"default"}
                          className="mt-3">
                          Channels
                        </Button>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
