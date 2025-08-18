"use client"

import React from 'react';

interface FloatingCharactersLandingProps {
  isDark: boolean;
}

export default function FloatingCharactersLanding({ isDark }: FloatingCharactersLandingProps) {
  const characters = ['桜', '和', '道', '心', '美', '雅'];
  
  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className={`absolute opacity-20 animate-pulse ${
        isDark ? 'text-purple-300' : 'text-red-300'
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: `${3 + i * 0.5}s`,
      }}
    >
      {characters[i]}
    </div>
  ));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {floatingElements}
    </div>
  );
}
