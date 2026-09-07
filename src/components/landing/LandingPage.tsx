import React from 'react';
import { LandingHeroSection } from './LandingHeroSection';
import { LandingDemoSection } from './LandingDemoSection';
import { LandingFeaturesSection } from './LandingFeaturesSection';

interface LandingPageProps {
  onOpenApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/30">
      <LandingHeroSection onOpenApp={onOpenApp} />
      <LandingDemoSection onOpenApp={onOpenApp} />
      <LandingFeaturesSection />
    </div>
  );
};
