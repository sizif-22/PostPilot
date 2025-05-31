'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaFacebook,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className=" transition-colors duration-300 dark:bg-black light:bg-gradient-to-b from-violet-100 via-violet-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full transition-all duration-300 dark:bg-black/90 bg-white/90 backdrop-blur-sm z-50 dark:border-violet-900 border-violet-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-[PlaywriteHU] dark:text-violet-400 text-violet-700 font-bold">PostPilot</h1>
            <div className="flex items-center gap-6">
              <Link href="/channels" className="dark:text-zinc-400 text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="dark:text-zinc-400 text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors">
                About
              </Link>
              <Link href="/contact" className="dark:text-zinc-400 text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors">
                Contact
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full dark:bg-violet-950 bg-violet-100 dark:hover:bg-violet-900 hover:bg-violet-200 transition-colors"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 dark:text-violet-400 text-violet-700" />
                ) : (
                  <MoonIcon className="w-5 h-5 dark:text-violet-400 text-violet-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-5xl sm:text-6xl font-bold dark:text-white text-gray-900 leading-tight">
                Automate Your <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:via-violet-300 dark:to-white bg-gradient-to-r from-violet-700 via-violet-600 to-purple-600 bg-clip-text text-transparent">Social Media</span> Presence
              </h2>
              <p className="text-xl dark:text-zinc-400 text-gray-700">
                Schedule, analyze, and optimize your social media content with PostPilot's intelligent automation platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/channels"
                  className="group px-8 py-4 dark:bg-violet-600 bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden"
                >
                  <span className="absolute inset-0 dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative">Get Started</span>
                </Link>
                <Link 
                  href="/demo"
                  className="px-8 py-4 bg-transparent dark:text-violet-400 text-violet-700 rounded-full font-semibold dark:border-violet-800 border-violet-300 border dark:hover:border-violet-400 hover:border-violet-700 transition-all duration-300 dark:hover:bg-violet-950 hover:bg-violet-50"
                >
                  Watch Demo
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl dark:bg-gradient-to-br dark:from-violet-950 dark:via-violet-900 dark:to-black bg-gradient-to-br from-violet-200 via-violet-100 to-white p-6 shadow-2xl dark:border-violet-800 border-violet-300 border">
                <div className="absolute inset-0 dark:bg-violet-500/5 bg-violet-500/10 backdrop-blur-sm rounded-2xl"></div>
                <div className="relative grid grid-cols-2 gap-4 h-full">
                  {/* Social Media Preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-2 bg-white dark:bg-black/40 rounded-lg p-4 border dark:border-violet-800/50 border-violet-300/50"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        <FaTwitter className="w-6 h-6 text-blue-400" />
                        <FaInstagram className="w-6 h-6 text-pink-500" />
                        <FaLinkedin className="w-6 h-6 text-blue-600" />
                        <FaFacebook className="w-6 h-6 text-blue-500" />
                      </div>
                      <span className="text-sm dark:text-zinc-400 text-gray-600">Connected Platforms</span>
                    </div>
                    <div className="h-24 grid grid-cols-3 gap-2">
                      <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">45</span>
                        <span className="text-xs text-gray-600 dark:text-zinc-400">Posts</span>
                      </div>
                      <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">12K</span>
                        <span className="text-xs text-gray-600 dark:text-zinc-400">Reach</span>
                      </div>
                      <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">89%</span>
                        <span className="text-xs text-gray-600 dark:text-zinc-400">Engagement</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-black/40 rounded-lg p-4 border dark:border-violet-800/50 border-violet-300/50"
                  >
                    <h3 className="text-sm font-medium dark:text-zinc-400 text-gray-600 mb-3">Quick Schedule</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs dark:text-zinc-400 text-gray-600">
                        <FaCalendarAlt className="text-violet-500" />
                        <span>Next: Today, 2PM</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs dark:text-zinc-400 text-gray-600">
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
                    className="bg-white dark:bg-black/40 rounded-lg p-4 border dark:border-violet-800/50 border-violet-300/50"
                  >
                    <h3 className="text-sm font-medium dark:text-zinc-400 text-gray-600 mb-3">Analytics</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs dark:text-zinc-400 text-gray-600">
                        <FaChartLine className="text-green-500" />
                        <span>+27% this week</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs dark:text-zinc-400 text-gray-600">
                        <FaCheckCircle className="text-violet-500" />
                        <span>All metrics up</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { number: '10K+', label: 'Active Users' },
              { number: '5M+', label: 'Posts Scheduled' },
              { number: '98%', label: 'Customer Satisfaction' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 dark:bg-black bg-white rounded-xl dark:border-violet-900 border-violet-200 border dark:hover:border-violet-700 hover:border-violet-300 transition-all duration-300">
                <h3 className="text-4xl font-bold dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">{stat.number}</h3>
                <p className="dark:text-zinc-400 text-gray-700 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
