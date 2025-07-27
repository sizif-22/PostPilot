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
export default function Home() {
  const { user } = useUser();
  return (
    <>
        <main className="min-h-screen transition-colors duration-300 dark:bg-black light:bg-gradient-to-b from-violet-100 via-violet-50 to-white">
          {/* Navigation */}
          <Navigation />

          {/* Hero Section */}
          <Hero />

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
        </main>
    </>
  );
}
