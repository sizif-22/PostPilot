"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ParallaxBackground = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll();

    // Subtle parallax transforms
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div
            ref={ref}
            className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Gradient Mesh - Subtle professional glow spots */}
            <motion.div
                style={{ y: y1 }}
                className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full dark:bg-violet-900/[0.07] bg-violet-200/30 blur-[120px]"
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full dark:bg-indigo-900/[0.05] bg-indigo-200/20 blur-[100px]"
            />
            <motion.div
                style={{ y: y3 }}
                className="absolute -bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full dark:bg-purple-900/[0.06] bg-purple-200/20 blur-[100px]"
            />

            {/* Subtle Dot Grid Pattern */}
            <div className="absolute inset-0 dark:opacity-[0.03] opacity-[0.04]">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern
                            id="dotGrid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse">
                            <circle
                                cx="20"
                                cy="20"
                                r="1"
                                className="dark:fill-violet-400 fill-violet-600"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotGrid)" />
                </svg>
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-transparent dark:via-[#0a0a0f]/50 dark:to-[#0a0a0f] bg-gradient-to-b from-transparent via-white/30 to-white pointer-events-none" />

            {/* Noise Texture Overlay for depth */}
            <div
                className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};
