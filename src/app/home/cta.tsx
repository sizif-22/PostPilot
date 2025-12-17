import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";

export const CTA = () => {
  const { user } = useUser();
  return (
    <section className="py-16 sm:py-24 px-6 dark:bg-gradient-to-r dark:from-[#12121f]/80 dark:via-[#0d0d18] dark:to-[#12121f]/80 bg-gradient-to-r from-violet-100 via-white to-violet-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-2 rounded-full dark:bg-violet-600/20 bg-violet-100 dark:border-violet-500/30 border-violet-200/50 border">
            <RocketLaunchIcon className="w-5 h-5 dark:text-violet-400 text-violet-700" />
            <span className="text-sm font-medium dark:text-violet-300 text-violet-700">
              Start Your Journey
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900">
            Ready to Dominate{" "}
            <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
              Social Media?
            </span>
          </h3>
          <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
            Join thousands of businesses and creators who trust PostPilot to
            streamline their social media workflow. Start scheduling smarter
            and growing faster today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={user ? "/collections" : "/signin"}
              className="group px-8 py-4 dark:bg-violet-600 bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden hover:shadow-lg hover:shadow-violet-500/25">
              <span className="absolute inset-0 dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <span className="relative">Get Started Free</span>
            </Link>
            <Link
              href="https://www.webbingstone.com/contact-us/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 dark:border-violet-600 border-violet-700 border-2 dark:text-violet-400 text-violet-700 rounded-full font-semibold hover:dark:bg-violet-600/10 hover:bg-violet-700/10 transition-all duration-300">
              Contact Webbingstone
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

