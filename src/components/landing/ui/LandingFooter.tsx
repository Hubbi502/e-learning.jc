"use client"

import React from 'react';

interface LandingFooterProps {
  isDark: boolean;
}

export default function LandingFooter({ isDark }: LandingFooterProps) {
  return (
    <footer className={`py-12 ${
      isDark ? 'bg-slate-900' : 'bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`text-2xl font-bold mb-4 ${
          isDark ? 'text-purple-300' : 'text-red-400'
        }`}>
          <span className="text-3xl mr-2">学</span>
          LearnJP
        </div>
        <p className="text-gray-400 mb-6">
          Your gateway to mastering Japanese language and culture
        </p>
        <div className="text-gray-500 text-sm">
          © 2025 Japanese Club SMKN 1 Cibinong.
        </div>
      </div>
    </footer>
  );
}
