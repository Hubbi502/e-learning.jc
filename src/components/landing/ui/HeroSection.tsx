"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Globe, ChevronRight, Search } from 'lucide-react';

interface HeroSectionProps {
  isDark: boolean;
  isVisible: boolean;
}

export default function HeroSection({ isDark, isVisible }: HeroSectionProps) {
  const router = useRouter();

  const handleTakeTest = (category: 'gengo' | 'bunka') => {
    router.push(`/exam/${category}`);
  };

  const handleReviewAnswers = () => {
    router.push('/review');
  };

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            日本語を
            <span className={`block mt-2 ${
              isDark ? 'text-purple-300' : 'text-red-600'
            }`}>
              学ぼう
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto transition-colors ${
            isDark ? 'text-purple-100' : 'text-gray-700'
          }`}>
            Master Japanese language and culture through our comprehensive learning management system
          </p>

          {/* Choice Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {/* Gengo Card */}
              <div className={`group relative overflow-hidden rounded-3xl p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1 flex flex-col ${
                isDark 
                ? 'bg-gradient-to-br from-purple-800/50 to-indigo-900/50 border border-purple-500/30' 
                : 'bg-gradient-to-br from-white to-red-50 border border-red-200 shadow-xl'
              }`}>
                <div className="relative z-10 flex flex-col flex-grow">
                <div className={`text-6xl mb-4 transition-transform duration-500 group-hover:scale-110 ${
                  isDark ? 'text-purple-300' : 'text-red-500'
                }`}>
                  言語
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Gengo
                </h3>
                <p className={`text-lg mb-6 flex-grow ${
                  isDark ? 'text-purple-100' : 'text-gray-600'
                }`}>
                  Focus on Japanese language learning with comprehensive grammar, vocabulary, and conversation practice
                </p>
                <button 
                  onClick={() => handleTakeTest('gengo')}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  isDark 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-500' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                }`}>
                  <span>Take a test</span>
                  <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                </button>
                </div>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                isDark ? 'bg-purple-400' : 'bg-red-400'
                }`}></div>
              </div>

              {/* Bunka Card */}
              <div className={`group relative overflow-hidden rounded-3xl p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1 flex flex-col ${
                isDark 
                ? 'bg-gradient-to-br from-indigo-800/50 to-purple-900/50 border border-indigo-500/30' 
                : 'bg-gradient-to-br from-white to-orange-50 border border-orange-200 shadow-xl'
              }`}>
                <div className="relative z-10 flex flex-col flex-grow">
                <div className={`text-6xl mb-4 transition-transform duration-500 group-hover:scale-110 ${
                  isDark ? 'text-indigo-300' : 'text-orange-500'
                }`}>
                  文化
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Bunka
                </h3>
                <p className={`text-lg mb-6 flex-grow ${
                  isDark ? 'text-indigo-100' : 'text-gray-600'
                }`}>
                  Immerse yourself in Japanese culture, traditions, history, and modern society
                </p>
                <button 
                  onClick={() => handleTakeTest('bunka')}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  isDark 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                }`}>
                  <span>Take a test</span>
                  <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                </button>
                </div>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                isDark ? 'bg-indigo-400' : 'bg-orange-400'
                }`}></div>
              </div>
            </div>

          {/* Review Button */}
          <div className="text-center">
            <button
              onClick={handleReviewAnswers}
              className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 transform hover:shadow-2xl ${
                isDark 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border border-indigo-500' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl'
              }`}
            >
              <Search className="w-6 h-6" />
              <span>Review My Exam Answers</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className={`mt-3 text-sm ${
              isDark ? 'text-purple-200' : 'text-gray-600'
            }`}>
              Already took an exam? Check your detailed results and review answers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
