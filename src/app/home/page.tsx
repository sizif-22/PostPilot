"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/context/UserContext";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import Loading from "@/components/ui/Loading";
export default function Home() {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const Buttons = [
    {
      name: "About",
      href: "#",
    },
    {
      name: "Plans",
      href: "/channels",
    },
    {
      name: "Contact",
      href: "#",
    },
  ];
  return (
    <>
      {user ? (
        <main className="min-h-screen transition-colors duration-300 dark:bg-black light:bg-gradient-to-b from-violet-100 via-violet-50 to-white">
          {/* Navigation */}
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
                      className="text-sm sm:text-base dark:text-zinc-400 text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors"
                    >
                      {button.name}
                    </Link>
                  ))}
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 sm:p-2 rounded-full dark:bg-violet-950 bg-violet-100 dark:hover:bg-violet-900 hover:bg-violet-200 transition-colors"
                  >
                    {theme === "dark" ? (
                      <SunIcon className="w-4 h-4 sm:w-5 sm:h-5 dark:text-violet-400 text-violet-700" />
                    ) : (
                      <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5 dark:text-violet-400 text-violet-700" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="min-h-screen flex items-center px-6 sm:px-6 lg:px-20 pt-16 sm:pt-20">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 md:px-20 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 sm:space-y-8 text-center lg:text-left"
                >
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold dark:text-white text-gray-900 leading-tight">
                    Automate Your{" "}
                    <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:via-violet-300 dark:to-white bg-gradient-to-r from-violet-700 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Social Media
                    </span>{" "}
                    Presence
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto lg:mx-0">
                    Schedule, analyze, and optimize your social media content
                    with PostPilot's intelligent automation platform.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link
                      href={user ? "/channels" : "/signin"}
                      className="group px-6 sm:px-8 py-3 sm:py-4 dark:bg-violet-600 bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden text-sm sm:text-base"
                    >
                      <span className="absolute inset-0 dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                      <span className="relative">Get Started</span>
                    </Link>
                  </div>
                </motion.div>

                {/* <Features /> */}
              </div>
            </div>
          </section>
        </main>
      ) : (
        <Loading />
      )}
    </>
  );
}
const Features = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-[500px] mx-auto lg:ml-auto"
    >
      <div className="aspect-square rounded-2xl dark:bg-gradient-to-br dark:from-violet-950 dark:via-violet-900 dark:to-black bg-gradient-to-br from-violet-200 via-violet-100 to-white p-4 sm:p-6 shadow-2xl dark:border-violet-800 border-violet-300 border">
        <div className="absolute inset-0 dark:bg-violet-500/5 bg-violet-500/10 backdrop-blur-sm rounded-2xl"></div>
        <div className="relative grid grid-cols-2 gap-3 sm:gap-4 h-full">
          {/* Social Media Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 bg-white dark:bg-black/40 rounded-lg p-3 sm:p-4 border dark:border-violet-800/50 border-violet-300/50"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex -space-x-1 sm:-space-x-2">
                <FaTwitter className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                <FaInstagram className="w-4 h-4 sm:w-6 sm:h-6 text-pink-500" />
                <FaLinkedin className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                <FaFacebook className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <span className="text-xs sm:text-sm dark:text-zinc-400 text-gray-600">
                Connected Platforms
              </span>
            </div>
            <div className="h-16 sm:h-24 grid grid-cols-3 gap-2">
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-1 sm:p-2 flex flex-col items-center justify-center">
                <span className="text-lg sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
                  45
                </span>
                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-zinc-400">
                  Posts
                </span>
              </div>
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-1 sm:p-2 flex flex-col items-center justify-center">
                <span className="text-lg sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
                  12K
                </span>
                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-zinc-400">
                  Reach
                </span>
              </div>
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-1 sm:p-2 flex flex-col items-center justify-center">
                <span className="text-lg sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
                  89%
                </span>
                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-zinc-400">
                  Engagement
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-black/40 rounded-lg p-3 sm:p-4 border dark:border-violet-800/50 border-violet-300/50"
          >
            <h3 className="text-xs sm:text-sm font-medium dark:text-zinc-400 text-gray-600 mb-2 sm:mb-3">
              Quick Schedule
            </h3>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs dark:text-zinc-400 text-gray-600">
                <FaCalendarAlt className="text-violet-500" />
                <span>Next: Today, 2PM</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs dark:text-zinc-400 text-gray-600">
                <FaClock className="text-violet-500" />
                <span>3 posts queued</span>
              </div>
            </div>
          </motion.div>

          {/* Analytics Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-black/40 rounded-lg p-3 sm:p-4 border dark:border-violet-800/50 border-violet-300/50"
          >
            <h3 className="text-xs sm:text-sm font-medium dark:text-zinc-400 text-gray-600 mb-2 sm:mb-3">
              Analytics
            </h3>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs dark:text-zinc-400 text-gray-600">
                <FaChartLine className="text-green-500" />
                <span>+27% this week</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs dark:text-zinc-400 text-gray-600">
                <FaCheckCircle className="text-violet-500" />
                <span>All metrics up</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
