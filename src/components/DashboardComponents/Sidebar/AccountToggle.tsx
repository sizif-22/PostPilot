import React from "react";
// import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useUser } from "@/context/UserContext";

export const AccountToggle = () => {
  const { user } = useUser();
  return (
    <div className="border-b h-16 flex items-center mb-4 border-stone-300 dark:border-stone-800">
      <button className="flex px-2 py-1 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center dark:hover:bg-stone-900">
        <img
          src="https://api.dicebear.com/9.x/notionists/svg?seed=5"
          alt="avatar"
          className="size-8 rounded shrink-0 bg-violet-500 shadow"
        />
        <div className="text-start">
          <span className="text-sm font-bold block dark:text-white">
            {user?.name}
          </span>
          <span className="text-xs block text-stone-600 dark:text-white/70">
            {user?.email}
          </span>
        </div>

        {/* <FiChevronDown className="absolute right-2 top-1/2 translate-y-[calc(-50%+4px)] text-xs" /> */}
        {/* <FiChevronUp className="absolute right-2 top-1/2 translate-y-[calc(-50%-4px)] text-xs" /> */}
      </button>
    </div>
  );
};
