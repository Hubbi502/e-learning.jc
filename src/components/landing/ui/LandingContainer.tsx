"use client"

import React from 'react';
import LandingNavigation from './LandingNavigation';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import LandingFooter from './LandingFooter';

interface LandingContainerProps {
  isDark: boolean;
  toggleTheme: () => void;
  isVisible: boolean;
}

export default function LandingContainer({ 
  isDark, 
  toggleTheme, 
  isVisible 
}: LandingContainerProps) {
  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>

      {/* Navigation */}
      <LandingNavigation isDark={isDark} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <HeroSection isDark={isDark} isVisible={isVisible} />

      {/* Features Section */}
      <FeaturesSection isDark={isDark} />

      {/* Footer */}
      <LandingFooter isDark={isDark} />
    </div>
  );
}
