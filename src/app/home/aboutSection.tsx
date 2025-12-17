"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    SparklesIcon,
    RocketLaunchIcon,
    GlobeAltIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const AboutSection = () => {
    const benefits = [
        "Schedule posts across multiple platforms simultaneously",
        "AI-powered content suggestions and optimization",
        "Comprehensive analytics and performance tracking",
        "Team collaboration with approval workflows",
        "Automated posting at optimal engagement times",
    ];

    return (
        <section
            id="about"
            className="py-16 sm:py-24 px-6 dark:bg-gradient-to-b dark:from-[#0a0a12]/80 dark:via-[#0d0d18]/60 dark:to-[#0a0a12]/80 bg-gradient-to-b from-violet-50 to-white relative">
            <div className="max-w-7xl mx-auto">
                {/* What is PostPilot */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full dark:bg-violet-600/20 bg-violet-100 dark:border-violet-500/30 border-violet-200/50 border">
                        <SparklesIcon className="w-5 h-5 dark:text-violet-400 text-violet-700" />
                        <span className="text-sm font-medium dark:text-violet-300 text-violet-700">
                            About PostPilot
                        </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900 mb-6">
                        Your All-in-One{" "}
                        <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                            Social Media Command Center
                        </span>
                    </h3>
                    <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-3xl mx-auto mb-8">
                        PostPilot is a powerful social media management platform designed to
                        help businesses, agencies, and creators streamline their online
                        presence. From scheduling and publishing to analytics and team
                        collaboration, we provide everything you need to dominate social
                        media.
                    </p>

                    {/* Benefits Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl dark:bg-violet-950/30 bg-white/70 backdrop-blur-sm dark:border-violet-800/30 border-violet-200/30 border">
                                <CheckCircleIcon className="w-5 h-5 dark:text-violet-400 text-violet-700 flex-shrink-0" />
                                <span className="text-sm dark:text-zinc-300 text-gray-700 text-left">
                                    {benefit}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Webbingstone Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mt-20">
                    <div className="relative overflow-hidden rounded-3xl dark:bg-gradient-to-br dark:from-violet-950/50 dark:via-black dark:to-violet-950/30 bg-gradient-to-br from-white via-violet-50 to-white dark:border-violet-800/30 border-violet-200/50 border p-8 md:p-12">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 dark:bg-violet-600/10 bg-violet-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 dark:bg-violet-600/10 bg-violet-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                            {/* Webbingstone Logo */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl dark:bg-white/10 bg-white shadow-xl dark:border-violet-800/30 border-violet-200/50 border flex items-center justify-center p-4 backdrop-blur-sm">
                                    <Image
                                        src="/webbingstone.png"
                                        alt="Webbingstone Logo"
                                        width={120}
                                        height={120}
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Webbingstone Info */}
                            <div className="flex-grow text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full dark:bg-violet-600/20 bg-violet-100 dark:border-violet-500/30 border-violet-200/50 border">
                                    <RocketLaunchIcon className="w-4 h-4 dark:text-violet-400 text-violet-700" />
                                    <span className="text-xs font-medium dark:text-violet-300 text-violet-700">
                                        Developed By
                                    </span>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-900 mb-4">
                                    Webbingstone
                                </h4>
                                <p className="dark:text-zinc-400 text-gray-700 mb-6 max-w-2xl">
                                    Founded in 2015 and headquartered in Cairo, Egypt,{" "}
                                    <strong className="dark:text-white text-gray-900">
                                        Webbingstone
                                    </strong>{" "}
                                    is a leading digital transformation company operating across
                                    the USA, UAE, Canada, and the UK. We specialize in custom
                                    software development, web and mobile applications, and
                                    results-driven digital marketing strategies that help
                                    businesses thrive in the digital landscape.
                                </p>

                                {/* Services Tags */}
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                                    {[
                                        "Web Development",
                                        "Digital Marketing",
                                        "Mobile Apps",
                                        "Brand Identity",
                                        "Motion Graphics",
                                    ].map((service, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 text-xs font-medium rounded-full dark:bg-violet-600/20 dark:text-violet-300 bg-violet-100 text-violet-700 dark:border-violet-500/30 border-violet-200/50 border">
                                            {service}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href="https://www.webbingstone.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-full dark:bg-violet-600 bg-violet-700 text-white font-semibold transition-all duration-300 hover:dark:bg-violet-500 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/25">
                                    <GlobeAltIcon className="w-5 h-5" />
                                    <span>Visit Webbingstone</span>
                                    <svg
                                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
