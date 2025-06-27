"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  CalendarIcon,
  ChartBarIcon,
  BoltIcon,
  UserGroupIcon,
  CheckIcon,
  StarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  BsTwitterX,
  BsFacebook,
  BsLinkedin,
  BsInstagram,
  BsTiktok,
} from "react-icons/bs";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import Image from "next/image";
import { ThemeToggle } from "@/components/DashboardComponents/Sidebar/ThemeToggle";

export default function Home() {
  const { user } = useUser();
  const { theme } = useTheme();

  const Buttons = [
    {
      name: "About",
      href: "#about",
    },
    {
      name: "Contact-Us",
      href: "#contact",
    },
    {
      name: "Privacy-Policy",
      href: "/privacy-policy",
    },
  ];

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

  const platforms = [
    { name: "Instagram", logo: <BsInstagram size={22} /> },
    { name: "X", logo: <BsTwitterX size={22} /> },
    { name: "Facebook", logo: <BsFacebook size={22} /> },
    { name: "LinkedIn", logo: <BsLinkedin size={22} /> },
    { name: "TikTok", logo: <BsTiktok size={22} /> },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for individuals and small creators",
      features: [
        "3 social media accounts",
        "30 scheduled posts/month",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for growing businesses and agencies",
      features: [
        "10 social media accounts",
        "Unlimited scheduled posts",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "AI content suggestions",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large organizations with advanced needs",
      features: [
        "Unlimited accounts",
        "Unlimited posts",
        "Custom analytics",
        "Advanced team features",
        "24/7 phone support",
        "API access",
        "Custom integrations",
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "TechStart Inc.",
      content:
        "PostPilot has transformed our social media strategy. We've seen a 300% increase in engagement since switching.",
      avatar: "/avatar1.jpg",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Content Creator",
      company: "Independent",
      content:
        "The AI-powered content suggestions are incredible. I save hours every week on content creation.",
      avatar: "/avatar2.jpg",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Social Media Director",
      company: "Fashion Forward",
      content:
        "The analytics insights help us understand our audience better and create more targeted content.",
      avatar: "/avatar3.jpg",
      rating: 5,
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
                      className="text-sm sm:text-base dark:text-zinc-400 text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors">
                      {button.name}
                    </Link>
                  ))}
                  <ThemeToggle />
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
                  className="space-y-6 sm:space-y-8 text-center md:text-left">
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
                      className="group px-6 sm:px-8 py-3 sm:py-4 dark:bg-violet-600 bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden text-sm sm:text-base">
                      <span className="absolute inset-0 dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                      <span className="relative">Get Started</span>
                    </Link>
                    {/* <button className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 dark:border-violet-600 border-violet-700 border-2 dark:text-violet-400 text-violet-700 rounded-full font-semibold hover:dark:bg-violet-600/10 hover:bg-violet-700/10 transition-all duration-300 text-sm sm:text-base">
                      <PlayIcon className="w-4 h-4" />
                      <span>Watch Demo</span>
                    </button> */}
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

          {/* Features Section */}
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

          {/* Supported Platforms Section */}
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
                  Manage all your social media accounts from one central
                  dashboard.
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

          {/* Pricing Section */}
          {/* 
          <section className="py-16 sm:py-24 px-6 dark:bg-gradient-to-b dark:from-violet-950/20 dark:to-black bg-gradient-to-b from-violet-50 to-white">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900 mb-6">
                  Choose Your{" "}
                  <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                    Perfect Plan
                  </span>
                </h3>
                <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
                  Start for free and scale as you grow. No hidden fees, cancel
                  anytime.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative rounded-2xl p-8 ${
                      plan.popular
                        ? "dark:bg-gradient-to-b dark:from-violet-900/50 dark:to-violet-950/50 bg-gradient-to-b from-violet-100 to-violet-50 dark:border-violet-500 border-violet-400 border-2"
                        : "dark:bg-violet-950/30 bg-white/70 dark:border-violet-800/30 border-violet-200/30 border"
                    } backdrop-blur-sm hover:scale-105 transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="dark:bg-violet-600 bg-violet-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h4 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
                        {plan.name}
                      </h4>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-4xl font-bold dark:text-violet-400 text-violet-700">
                          {plan.price}
                        </span>
                        <span className="dark:text-zinc-400 text-gray-600">
                          {plan.period}
                        </span>
                      </div>
                      <p className="dark:text-zinc-400 text-gray-600 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <CheckIcon className="w-5 h-5 dark:text-violet-400 text-violet-700 mt-0.5 flex-shrink-0" />
                          <span className="dark:text-zinc-300 text-gray-700 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                        plan.popular
                          ? "dark:bg-violet-600 bg-violet-700 text-white hover:dark:bg-violet-500 hover:bg-violet-600"
                          : "dark:border-violet-600 border-violet-700 border-2 dark:text-violet-400 text-violet-700 hover:dark:bg-violet-600/10 hover:bg-violet-700/10"
                      }`}
                    >
                      Get Started
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section> */}

          {/* Testimonials Section */}
          <section className="py-16 sm:py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900 mb-6">
                  What Our{" "}
                  <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                    Customers Say
                  </span>
                </h3>
                <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who have transformed
                  their social media strategy.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="dark:bg-violet-950/30 bg-white/70 backdrop-blur-sm rounded-2xl p-6 dark:border-violet-800/30 border-violet-200/30 border">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="w-5 h-5 dark:text-violet-400 text-violet-700 fill-current"
                        />
                      ))}
                    </div>

                    <p className="dark:text-zinc-300 text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 dark:bg-violet-600/20 bg-violet-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold dark:text-violet-400 text-violet-700">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold dark:text-white text-gray-900">
                          {testimonial.name}
                        </h5>
                        <p className="text-sm dark:text-zinc-400 text-gray-600">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-24 px-6 dark:bg-gradient-to-r dark:from-violet-950/50 dark:via-black dark:to-violet-950/50 bg-gradient-to-r from-violet-100 via-white to-violet-100">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900">
                  Ready to Transform Your{" "}
                  <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                    Social Media Strategy?
                  </span>
                </h3>
                <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
                  Join thousands of successful businesses and creators who trust
                  PostPilot to manage their social media presence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href={user?.isLoggedIn ? "/channels" : "/signin"}
                    className="group px-8 py-4 dark:bg-violet-600 bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden">
                    <span className="absolute inset-0 dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    <span className="relative">Start Free Trial</span>
                  </Link>
                  <button className="px-8 py-4 dark:border-violet-600 border-violet-700 border-2 dark:text-violet-400 text-violet-700 rounded-full font-semibold hover:dark:bg-violet-600/10 hover:bg-violet-700/10 transition-all duration-300">
                    Schedule Demo
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-6 dark:bg-black/50 bg-gray-50 dark:border-t dark:border-violet-900 border-t border-violet-200">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-PlaywriteHU dark:text-violet-400 text-violet-700 font-bold">
                    PostPilot
                  </h4>
                  <p className="dark:text-zinc-400 text-gray-600 text-sm">
                    Automate your social media presence with intelligent
                    scheduling and analytics.
                  </p>
                </div>

                <div className="space-y-4">
                  <h5 className="font-semibold dark:text-white text-gray-900">
                    Product
                  </h5>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        API
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h5 className="font-semibold dark:text-white text-gray-900">
                    Company
                  </h5>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        Contact
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h5 className="font-semibold dark:text-white text-gray-900">
                    Legal
                  </h5>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/privacy-policy"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="/terms"
                        className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t dark:border-violet-900 border-violet-200 mt-8 pt-8 text-center">
                <p className="dark:text-zinc-400 text-gray-600 text-sm">
                  © 2025 PostPilot. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <Loading />
      )}
    </>
  );
}
