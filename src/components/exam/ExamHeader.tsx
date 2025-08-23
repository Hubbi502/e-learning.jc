import React from 'react';
import { Sun, Moon, Clock, Shield } from 'lucide-react';

interface StudentData {
  student: {
    id: string;
    name: string;
    class: string;
    exam_code: string;
    category: string;
  };
  exam: {
    id: string;
    exam_code: string;
    category: string;
    duration: number;
    start_time: string | null;
    end_time: string | null;
  };
}

interface ExamHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  timeLeft: number;
  violations: number;
  studentData: StudentData | null;
  answeredCount: number;
  totalQuestions: number;
  progressPercentage: number;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function ExamHeader({
  isDark,
  toggleTheme,
  timeLeft,
  violations,
  studentData,
  answeredCount,
  totalQuestions,
  progressPercentage
}: ExamHeaderProps) {
  return (
    <div className={`sticky top-0 z-50 backdrop-blur-lg border-b ${
      isDark 
        ? 'bg-slate-900/90 border-purple-500/20' 
        : 'bg-white/90 border-blue-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        
        {/* Desktop and Tablet Layout */}
        <div className="hidden sm:flex items-center justify-between">
          
          {/* Logo and Info */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className={`text-lg lg:text-xl font-bold ${
              isDark ? 'text-purple-300' : 'text-blue-600'
            }`}>
              <span className="text-xl lg:text-2xl mr-1 lg:mr-2">学</span>
              LearnJP
            </div>
            <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} hidden md:block`}>
              {studentData?.student.name} - {studentData?.student.class}
            </div>
          </div>

          {/* Timer and Progress */}
          <div className="flex items-center space-x-3 lg:space-x-6">
            {/* Violation Counter */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
              violations >= 2
                ? 'bg-red-500/20 text-red-600'
                : violations >= 1
                  ? 'bg-yellow-500/20 text-yellow-600'
                  : isDark 
                    ? 'bg-slate-800/30 text-slate-400' 
                    : 'bg-gray-100 text-gray-500'
            }`}>
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">
                {violations}/3
              </span>
            </div>

            <div className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl ${
              timeLeft < 300 
                ? 'bg-red-500/20 text-red-600' 
                : isDark 
                  ? 'bg-purple-800/30 text-purple-300' 
                  : 'bg-blue-100 text-blue-600'
            }`}>
              <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="font-mono font-semibold text-sm lg:text-base">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} hidden lg:block`}>
              {answeredCount}/{totalQuestions} answered
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-purple-800 text-yellow-300 hover:bg-purple-700' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Top Row - Logo and Theme Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className={`text-lg font-bold ${
              isDark ? 'text-purple-300' : 'text-blue-600'
            }`}>
              <span className="text-xl mr-1">学</span>
              LearnJP
            </div>
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDark 
                  ? 'bg-purple-800 text-yellow-300' 
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Second Row - Student Info and Timer */}
          <div className="flex items-center justify-between mb-3">
            <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} truncate flex-1 mr-3`}>
              {studentData?.student.name} - {studentData?.student.class}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Violation Counter Mobile */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                violations >= 2
                  ? 'bg-red-500/20 text-red-600'
                  : violations >= 1
                    ? 'bg-yellow-500/20 text-yellow-600'
                    : isDark 
                      ? 'bg-slate-800/30 text-slate-400' 
                      : 'bg-gray-100 text-gray-500'
              }`}>
                <Shield className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {violations}/3
                </span>
              </div>

              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                timeLeft < 300 
                  ? 'bg-red-500/20 text-red-600' 
                  : isDark 
                    ? 'bg-purple-800/30 text-purple-300' 
                    : 'bg-blue-100 text-blue-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Third Row - Progress Info */}
          <div className="flex items-center justify-center">
            <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {answeredCount}/{totalQuestions} questions answered
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 sm:mt-4">
          <div className={`w-full bg-gray-200 rounded-full h-1.5 sm:h-2 ${
            isDark ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                isDark ? 'bg-purple-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
