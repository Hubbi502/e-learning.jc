"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sun, Moon, User, GraduationCap, Key, ArrowRight, AlertCircle } from 'lucide-react';

interface StudentFormData {
  name: string;
  class: string;
  exam_code: string;
}

export default function StudentLoginPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.exam_category as string;

  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    class: '',
    exam_code: ''
  });

  const toggleTheme = () => setIsDark(!isDark);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: category.charAt(0).toUpperCase() + category.slice(1) // Capitalize first letter
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store student data in localStorage for the exam
        localStorage.setItem('studentData', JSON.stringify({
          student: data.student,
          exam: data.exam
        }));
        
        // Redirect to exam page
        router.push(`/exam/${category}/test`);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryTitle = () => {
    return category === 'gengo' ? 'Japanese Language (言語)' : 'Japanese Culture (文化)';
  };

  const getCategoryColor = () => {
    return category === 'gengo' ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600';
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg border-b transition-all duration-500 ${
        isDark 
          ? 'bg-slate-900/90 border-purple-500/20' 
          : 'bg-white/90 border-red-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className={`text-2xl font-bold transition-colors ${
              isDark ? 'text-purple-300' : 'text-red-600'
            }`}>
              <span className="text-3xl mr-2">学</span>
              LearnJP
            </div>
            
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getCategoryColor()} mb-4`}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Student Login
            </h1>
            <p className={`text-lg ${
              isDark ? 'text-purple-300' : 'text-red-600'
            }`}>
              {getCategoryTitle()}
            </p>
          </div>

          {/* Login Form */}
          <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-all duration-1000 ${
            isDark 
              ? 'bg-slate-800/30 border-purple-500/20' 
              : 'bg-white/80 border-red-200/50'
          }`}>
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-400 focus:border-purple-400' 
                        : 'bg-white/70 border-red-200 text-gray-900 placeholder-gray-500 focus:border-red-400'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      isDark ? 'focus:ring-purple-500' : 'focus:ring-red-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Class Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-300' : 'text-gray-700'
                }`}>
                  Class
                </label>
                <div className="relative">
                  <GraduationCap className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-400 focus:border-purple-400' 
                        : 'bg-white/70 border-red-200 text-gray-900 placeholder-gray-500 focus:border-red-400'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      isDark ? 'focus:ring-purple-500' : 'focus:ring-red-500'
                    }`}
                    placeholder="e.g., X RPL 1"
                  />
                </div>
              </div>

              {/* Exam Code Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-300' : 'text-gray-700'
                }`}>
                  Exam Code
                </label>
                <div className="relative">
                  <Key className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="exam_code"
                    value={formData.exam_code}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-400 focus:border-purple-400' 
                        : 'bg-white/70 border-red-200 text-gray-900 placeholder-gray-500 focus:border-red-400'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      isDark ? 'focus:ring-purple-500' : 'focus:ring-red-500'
                    }`}
                    placeholder="Enter exam code from your teacher"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${getCategoryColor()} hover:shadow-lg hover:scale-105 active:scale-95`
                } flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Start Exam</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className={`mt-6 p-4 rounded-xl ${
              isDark ? 'bg-purple-900/30' : 'bg-blue-50'
            }`}>
              <p className={`text-sm ${
                isDark ? 'text-purple-300' : 'text-blue-700'
              }`}>
                Make sure you have a stable internet connection and enough time to complete the exam. 
                Once started, the timer cannot be paused.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
