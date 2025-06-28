"use client";

import React, { useState } from "react";
import { FiCommand, FiSearch } from "react-icons/fi";
import { CommandMenu } from "./CommandMenu";

export const Search = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-stone-200 dark:bg-darkButtons mb-4 relative rounded flex items-center px-2 py-1.5 text-sm dark:text-white">
        <FiSearch className="mr-2" />
        <input
          onFocus={(e) => {
            e.target.blur();
            setOpen(true);
          }}
          type="text"
          placeholder="Search"
          className="w-full bg-transparent placeholder:text-stone-400 dark:placeholder:text-gray-400 focus:outline-none"
        />

        <span className="p-1 text-xs flex gap-0.5 items-center shadow bg-stone-50 dark:bg-darkBorder dark:text-white rounded absolute right-1.5 top-1/2 -translate-y-1/2">
          <FiCommand />K
        </span>
      </div>

      <CommandMenu open={open} setOpen={setOpen} />
    </>
  );
};
