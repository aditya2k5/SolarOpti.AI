import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-transparent overflow-hidden min-h-[90vh] flex items-center">
      
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#10B981] opacity-10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#10B981] opacity-10 rounded-full blur-[80px]"></div>
      <div className="absolute top-20 right-1/4 w-[250px] h-[250px] bg-[#34D399] opacity-10 rounded-full blur-[70px]"></div>

      <div className="section-container relative z-10 text-center">
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <span className="inline-block bg-[rgba(16,185,129,0.1)] text-[#34D399] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[rgba(16,185,129,0.22)] shadow-emerald">
              Introducing SolarOpti.AI
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-[var(--text-primary)]">
              Solar Intelligence Unleashed <br /><span className="gradient-text">AI-Powered Solar Panel Optimization</span>
            </h1>

          
            <p className="text-lg md:text-xl mb-8 text-[var(--text-muted)] max-w-2xl mx-auto">
              Design, simulate, and optimize solar installations with SolarOpti.AI. Get location-specific yield forecasts, automatic tilt optimization, instant ROI analysis, and professional PDF reports. From rooftops to rural electrification unlock maximum energy efficiency with AI precision
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
              <Button
                className="btn-primary flex items-center"
                type="button"
                onClick={() => navigate("/get-started")}
              >
                <span>Get Started Free</span>
                <ArrowRight className="ml-2 h-5 w-5" /> 
              </Button>
            </div>
          </div>

          <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#34D399] blur-xl opacity-20 rounded-xl"></div>
              <div className="card relative p-2 transform transition-all duration-500 hover:scale-[1.01]">
                <video src="assets/solarvideo.mp4" autoPlay loop muted className="w-full rounded-xl" />
                
             
                <div className="absolute bottom-4 left-4 bg-[var(--background)] opacity-90 backdrop-blur-sm border border-[var(--border-emerald)] px-4 py-2 rounded-lg text-[var(--text-primary)] text-sm font-medium">
                  Modern Dashboard Interface
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     
      <div className="absolute bottom-10 left-10 w-20 h-20 border border-[var(--border-emerald)] rounded-full"></div>
      <div className="absolute top-20 right-10 w-10 h-10 border border-[var(--border-emerald)] rounded-full"></div>
      <div className="absolute top-40 left-20 w-5 h-5 bg-[var(--border-emerald)] rounded-full"></div>
    </div>
  );
};

export default HeroSection;