"use client";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarIcon,
  ChartBarIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const Hero = () => {
  const router = useRouter();
  const { user } = useUser();

  const quickStats = [
    { icon: CalendarIcon, text: "Smart Scheduling" },
    { icon: ChartBarIcon, text: "Deep Analytics" },
    { icon: BoltIcon, text: "AI-Powered" },
  ];

  return (
    <section className="min-h-screen flex items-center px-6 sm:px-6 md:px-10 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="md:grid md:grid-cols-2 flex flex-col gap-2 md:px-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 text-center md:text-left">
            {/* Powered by Webbingstone Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full dark:bg-violet-950/50 bg-violet-50 dark:border-violet-800/50 border-violet-200 border backdrop-blur-sm">
              <span className="text-xs sm:text-sm dark:text-zinc-400 text-gray-600">
                Powered by
              </span>
              <Link
                href="https://www.webbingstone.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/webbingstone.png"
                  alt="Webbingstone"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xs sm:text-sm font-semibold dark:text-violet-400 text-violet-700">
                  Webbingstone
                </span>
              </Link>
            </motion.div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold dark:text-white text-gray-900 leading-tight">
              Master Your{" "}
              <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:via-violet-300 dark:to-white bg-gradient-to-r from-violet-700 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Social Media
              </span>{" "}
              Empire
            </h2>
            <p className="text-base sm:text-lg lg:text-xl dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto lg:mx-0">
              PostPilot is your all-in-one social media management platform.
              Schedule posts, analyze performance, collaborate with your team,
              and grow your audience across all major platforms—powered by
              intelligent automation and AI.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {quickStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-violet-600/10 bg-violet-100/50 dark:border-violet-700/30 border-violet-200/50 border">
                  <stat.icon className="w-4 h-4 dark:text-violet-400 text-violet-700" />
                  <span className="text-xs font-medium dark:text-violet-300 text-violet-700">
                    {stat.text}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center md:justify-start">
              <Link href={user?.email ? "/collections" : "/signin"}>
                <Button
                  size="lg"
                  className={`px-8 py-6 text-base ${user?.email &&
                    user?.isVerified != true &&
                    "cursor-not-allowed"
                    }`}
                  disabled={
                    user?.email != undefined && user?.isVerified != true
                  }>
                  {user?.email ? "Go to Collections" : "Get Started Free"}
                </Button>
              </Link>
              <Link
                href="#about"
                className="px-6 py-3 dark:border-violet-600 border-violet-700 border-2 dark:text-violet-400 text-violet-700 rounded-full font-semibold hover:dark:bg-violet-600/10 hover:bg-violet-700/10 transition-all duration-300">
                Learn More
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full sm:h-[50svh] h-full mx-auto lg:ml-auto">
            <Image
              src="/PostPilotHomePage-removebg-preview.png"
              alt="PostPilot Dashboard Preview"
              width={1000}
              height={1000}
              className="md:w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
