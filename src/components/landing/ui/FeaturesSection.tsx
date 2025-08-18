"use client"

import React from 'react';
import { Play, Users, Award } from 'lucide-react';

interface FeaturesSectionProps {
  isDark: boolean;
}

export default function FeaturesSection({ isDark }: FeaturesSectionProps) {
  const features = [
    {
      icon: <Play className="w-8 h-8" />,
      title: "Interactive Lessons",
      description: "Engaging multimedia content with native pronunciation guides",
      gradient: isDark ? "from-purple-600 to-pink-600" : "from-red-500 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Learning",
      description: "Connect with fellow learners and native speakers",
      gradient: isDark ? "from-indigo-600 to-purple-600" : "from-blue-500 to-indigo-500"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Why Choose LearnJP?
          </h2>
          <p className={`text-xl ${
            isDark ? 'text-purple-100' : 'text-gray-600'
          }`}>
            Comprehensive learning experience designed for all levels
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-105 ${
              isDark 
                ? 'bg-slate-800/50 border border-slate-700' 
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
