'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { UpcomingPosts } from "./_components/UpcomingPosts";
import { ConnectedPlatforms } from "./_components/ConnectedPlatforms";
import { CreatePostWizard } from "./_components/CreatePostWizard";

export default function Page() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <section className="p-6 md:px-10 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-stone-500 dark:text-white/60">
            Manage your content and connected platforms
          </p>
        </div>
        <Button
          onClick={() => setIsCreatePostOpen(true)}
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Platforms - Shows first on mobile, right side on desktop */}
        <div className="lg:col-span-1 lg:order-2 h-auto md:h-[400px]">
          <ConnectedPlatforms />
        </div>

        {/* Upcoming Posts - Shows second on mobile, takes up 2 columns on desktop */}
        <div className="lg:col-span-2 lg:order-1 h-[75vh]">
          <UpcomingPosts />
        </div>
      </div>

      {/* Create Post Wizard Dialog */}
      <CreatePostWizard
        open={isCreatePostOpen}
        setOpen={setIsCreatePostOpen}
      />
    </section>
  );
}
