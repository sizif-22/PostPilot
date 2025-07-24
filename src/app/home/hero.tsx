"use client";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/firebase/auth";
export const Hero = () => {
  const router = useRouter();
  const { user } = useUser();
  return (
    <section className="min-h-screen flex items-center px-6 sm:px-6 md:px-10 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="md:grid md:grid-cols-2 flex flex-col gap-2 md:px-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold dark:text-white text-gray-900 leading-tight">
              Automate Your{" "}
              <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:via-violet-300 dark:to-white bg-gradient-to-r from-violet-700 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Social Media
              </span>{" "}
              Presence
            </h2>
            <p className="text-base sm:text-lg lg:text-xl dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto lg:mx-0">
              Schedule, analyze, and optimize your social media content with
              PostPilot's intelligent automation platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center md:justify-start">
              {user?.email ? (
                <Button onClick={() => router.push("/channels")}>
                  Channels
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    await signInWithGoogle();
                    window.location.href = "/";
                  }}>
                  <FaGoogle />
                  Sign In with Google
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full sm:h-[50svh] h-full mx-auto lg:ml-auto">
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
  );
};
