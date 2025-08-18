"use client"

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeToggleProps } from '../types/types';

export default function ThemeToggle({ isDark, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
        isDark 
          ? 'bg-purple-800 text-yellow-300 hover:bg-purple-700' 
          : 'bg-red-100 text-orange-600 hover:bg-red-200'
      }`}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
