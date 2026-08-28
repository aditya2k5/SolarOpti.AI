import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';
import About from '@/components/About';
const Index = () => {
  return <div className="min-h-screen bg-transparent">
    <Navbar />
    <main>
      <section id="home" className="scroll-mt-24">
        <HeroSection />
      </section>
      <section id="about" className="scroll-mt-24">
        <About />
      </section>
      <section id="features" className="scroll-mt-24">
        <FeaturesSection />
      </section>
      <section id="contact" className="scroll-mt-24">
        <CtaSection />
      </section>
    </main>
    <Footer />
  </div>;
};
export default Index;