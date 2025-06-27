import { motion } from "framer-motion";
import {
  CalendarIcon,
  ChartBarIcon,
  BoltIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
export const Features = () => {
     const features = [
          {
            icon: CalendarIcon,
            title: "Smart Scheduling",
            description:
              "Schedule posts across multiple platforms with optimal timing suggestions powered by AI.",
          },
          {
            icon: ChartBarIcon,
            title: "Advanced Analytics",
            description:
              "Track engagement, reach, and performance with detailed insights and reports.",
          },
          {
            icon: BoltIcon,
            title: "AI-Powered Content",
            description:
              "Generate engaging captions and hashtags with our intelligent content assistant.",
          },
          {
            icon: UserGroupIcon,
            title: "Team Collaboration",
            description:
              "Work seamlessly with your team through shared calendars and approval workflows.",
          },
        ];
  return (
     <section className="py-16 sm:py-24 px-6 dark:bg-gradient-to-b dark:from-black dark:to-violet-950/20 bg-gradient-to-b from-white to-violet-50">
     <div className="max-w-7xl mx-auto">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
         viewport={{ once: true }}
         className="text-center mb-16">
         <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900 mb-6">
           Powerful Features for{" "}
           <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
             Modern Marketers
           </span>
         </h3>
         <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-3xl mx-auto">
           Everything you need to create, schedule, and analyze your
           social media content in one powerful platform.
         </p>
       </motion.div>

       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
         {features.map((feature, index) => (
           <motion.div
             key={index}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: index * 0.1 }}
             viewport={{ once: true }}
             className="dark:bg-violet-950/30 bg-white/70 backdrop-blur-sm rounded-2xl p-6 dark:border-violet-800/30 border-violet-200/30 border hover:dark:bg-violet-950/50 hover:bg-white/90 transition-all duration-300">
             <div className="dark:bg-violet-600/20 bg-violet-100 rounded-lg p-3 w-fit mb-4">
               <feature.icon className="w-6 h-6 dark:text-violet-400 text-violet-700" />
             </div>
             <h4 className="text-xl font-semibold dark:text-white text-gray-900 mb-3">
               {feature.title}
             </h4>
             <p className="dark:text-zinc-400 text-gray-700">
               {feature.description}
             </p>
           </motion.div>
         ))}
       </div>
     </div>
   </section>
  )
}
