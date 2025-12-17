"use client";
import { motion } from "framer-motion";
import {
  BsTwitterX,
  BsFacebook,
  BsLinkedin,
  BsInstagram,
  BsTiktok,
  BsYoutube,
} from "react-icons/bs";

export const SupportedPlatforms = () => {
  const platforms = [
    { name: "Instagram", logo: <BsInstagram size={22} /> },
    { name: "X", logo: <BsTwitterX size={22} /> },
    { name: "Facebook", logo: <BsFacebook size={22} /> },
    { name: "LinkedIn", logo: <BsLinkedin size={22} /> },
    { name: "TikTok", logo: <BsTiktok size={22} /> },
    { name: "YouTube", logo: <BsYoutube size={22} /> },
  ];

  return (
    <section className="py-16 sm:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4 sm:mb-6">
            Connect All Your{" "}
            <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
              Favorite Platforms
            </span>
          </h3>
          <p className="text-base sm:text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto px-4">
            Manage all your social media accounts from one central dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex flex-col items-center space-y-3 dark:bg-[#12121a]/60 bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 dark:border-violet-500/10 border-violet-200/30 border hover:dark:bg-[#16161f]/80 hover:dark:border-violet-500/20 hover:bg-white/80 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 dark:bg-violet-500/10 bg-violet-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold dark:text-violet-400 text-violet-700">
                  {platform.logo}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-medium dark:text-zinc-300 text-gray-800">
                {platform.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

