import React from 'react';
import { Sun, Zap, FileText, MapPin, TrendingUp, Target } from 'lucide-react';

const features = [
  {
    icon: <Sun className="h-6 w-6 text-[#10B981]" />,
    title: 'AI Yield Forecasting',
    description: '95% accurate predictions using SARIMAX models and NREL irradiance data.'
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-[#10B981]" />,
    title: 'Optimal Tilt Optimizer',
    description: 'Automatically finds perfect panel angles for maximum annual energy capture.'
  },
  {
    icon: <MapPin className="h-6 w-6 text-[#10B981]" />,
    title: 'Location Intelligence',
    description: 'India-optimized with precise geocoding and regional weather patterns.'
  },
  {
    icon: <Zap className="h-6 w-6 text-[#10B981]" />,
    title: 'Instant ROI Calculator',
    description: 'Payback periods, monthly savings, and 25-year NPV in seconds.'
  },
  {
    icon: <FileText className="h-6 w-6 text-[#10B981]" />,
    title: 'Professional PDF Reports',
    description: 'Branded 3-page exports with charts, maps, and optimization insights.'
  },
  {
    icon: <Target className="h-6 w-6 text-[#10B981]" />,
    title: 'AI Recommendations',
    description: 'GPT-powered insights for batteries, maintenance, and cost savings.'
  }
];

const SolarFeaturesSection = () => {
  return (
    <div className="bg-transparent py-16 md:py-24 transition-colors duration-300">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 gradient-text !leading-tight">
            Powerful <span className="block">AI Features to Maximize</span>
      
            <span className="block text-[var(--text-primary)]">Your Solar Yield</span>
          </h2>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Precision forecasting, perfect angles, and instant ROI analysis—all powered by cutting-edge AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card group p-8" // Uses card from index.css
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-[rgba(16,185,129,0.1)] group-hover:bg-[rgba(16,185,129,0.2)] w-14 h-14 flex items-center justify-center rounded-xl mb-6 transition-colors duration-300 border border-[var(--border-emerald)] group-hover:border-[#10B981]">
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)] group-hover:text-[#10B981] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolarFeaturesSection;