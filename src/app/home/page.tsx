"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import Image from "next/image";
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
          <section className="min-h-screen flex items-center px-6 sm:px-6 md:px-10 pt-16 sm:pt-20">
            <div className="max-w-7xl mx-auto w-full">
              <div className="md:grid md:grid-cols-2 flex flex-col gap-2 md:px-10 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 sm:space-y-8 text-center md:text-left"
                >
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold dark:text-white text-gray-900 leading-tight">
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
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center md:justify-start">
                    <Link
                      href={user?.isLoggedIn ? "/channels" : "/signin"}
                      className="group px-6 sm:px-8 py-3 sm:py-4 dark:bg-violet-600 bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden text-sm sm:text-base"
                    >
                      <span className="absolute inset-0 dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                      <span className="relative">Get Started</span>
                    </Link>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative w-full sm:h-[50svh] h-full mx-auto lg:ml-auto"
                >
                  <Image
                    src="/PostPilotHomePage-removebg-preview.png"
                    alt="Homepage"
                    width={1000}
                    height={1000}
                    className=" md:w-full h-full object-contain"
                  />
                </motion.div>
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
