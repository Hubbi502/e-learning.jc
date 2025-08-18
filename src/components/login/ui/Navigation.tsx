"use client"

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { NavigationProps } from '../types/types';

export default function Navigation({ isDark, toggleTheme }: NavigationProps) {
  const router = useRouter();
  
  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg border-b transition-all duration-500 ${
      isDark 
        ? 'bg-slate-900/90 border-purple-500/20' 
        : 'bg-white/90 border-red-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <button
                onClick={() => router.push('/')}
            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
              isDark 
                ? 'bg-purple-800 text-purple-300 hover:bg-purple-700' 
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}>
              <ArrowLeft size={20} />
            </button>
            <div className={`text-2xl font-bold transition-colors ${
              isDark ? 'text-purple-300' : 'text-red-600'
            }`}>
              <span className="text-3xl mr-2">学</span>
              LearnJP
            </div>
          </div>
          
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}
