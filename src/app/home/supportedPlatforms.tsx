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
          className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-6">
            Connect All Your{" "}
            <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
              Favorite Platforms
            </span>
          </h3>
          <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
            Manage all your social media accounts from one central dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-around gap-8 items-center">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="flex flex-col w-44 items-center space-y-3 dark:bg-violet-950/20 bg-white/50 rounded-xl p-6 hover:dark:bg-violet-950/40 hover:bg-white/80 transition-all duration-300">
              <div className="w-12 h-12 dark:bg-violet-600/20 bg-violet-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold dark:text-violet-400 text-violet-700">
                  {platform.logo}
                </span>
              </div>
              <span className="text-sm font-medium dark:text-zinc-300 text-gray-800">
                {platform.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
