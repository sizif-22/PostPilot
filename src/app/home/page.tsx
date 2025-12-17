"use client";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import { Hero } from "./hero";
import { Features } from "./features";
import { SupportedPlatforms } from "./supportedPlatforms";
import { Testimonial } from "./testimonial";
import { Pricing } from "./pricing";
import { CTA } from "./cta";
import { Footer } from "./footer";
import { Navigation } from "./navigation";
import { AboutSection } from "./aboutSection";
import { ParallaxBackground } from "./parallaxBackground";

export default function Home() {
  const { user } = useUser();
  return (
    <>
      <main className="min-h-screen transition-colors duration-300 dark:bg-gradient-to-b dark:from-[#0a0a0f] dark:via-[#0d0d18] dark:to-[#0a0a12] bg-gradient-to-b from-violet-100 via-violet-50 to-white relative overflow-hidden">
        {/* Parallax Background with SVGs */}
        <ParallaxBackground />

        {/* Main Content */}
        <div className="relative z-10">
          {/* Navigation */}
          <Navigation />

          {/* Hero Section */}
          <Hero />

          {/* About PostPilot & Webbingstone Section */}
          <AboutSection />

          {/* Features Section */}
          <Features />

          {/* Supported Platforms Section */}
          <SupportedPlatforms />

          {/* Pricing Section */}
          {/* <Pricing /> */}

          {/* Testimonials Section */}
          <Testimonial />

          {/* CTA Section */}
          <CTA />

          {/* Footer */}
          <Footer />
        </div>
      </main>
    </>
  );
}


