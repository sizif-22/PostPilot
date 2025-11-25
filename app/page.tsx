'use client';

import CallToAction from '@/components/call-to-action';
import FooterSection from '@/components/footer';
import HeroSection from '@/components/hero-section';
import IntegrationsSection from '@/components/integrations-5';

const Home = () => {
  return (
    <>
      <HeroSection />
      <IntegrationsSection />
      <CallToAction />
      <FooterSection />
    </>
  );
};
export default Home;
