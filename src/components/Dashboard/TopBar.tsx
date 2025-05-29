"use client";
import React from "react";
import { FiCalendar } from "react-icons/fi";
import { CPDialog } from "./CPDialog";
import { useState } from "react";
export const TopBar = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b px-4 mb-4 py-3 border-stone-200 sticky top-0 bg-white">
      <div className="flex items-center justify-between p-0.5">
        <div>
          <span className="text-sm font-bold block">🚀 Good morning, Tom!</span>
          <span className="text-xs block text-stone-500">
            Tuesday, Aug 8th 2023
          </span>
        </div>

        <button onClick={() => setOpen(true)} className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
          
          <FiCalendar />
          <span>Schedule Post</span>
        </button>
        <CPDialog open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};
