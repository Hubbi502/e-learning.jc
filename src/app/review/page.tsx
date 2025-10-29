"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, X, User, Hash, ArrowLeft } from 'lucide-react';

interface StudentFormData {
  name: string;
  examCode: string;
}

export default function ReviewExamPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    examCode: ''
  });
  const [error, setError] = useState('');

  const toggleTheme = () => setIsDark(!isDark);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, try to find student by name and exam code
      const response = await fetch('/api/student/find-for-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to review page with student data
        const reviewUrl = `/review/${result.studentId}?examCode=${formData.examCode}`;
        router.push(reviewUrl);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Review lookup error:', error);
      setError('Failed to find exam results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      
      {/* Header */}
      <div className={`backdrop-blur-lg border-b ${
        isDark 
          ? 'bg-slate-900/90 border-purple-500/20' 
          : 'bg-white/90 border-blue-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className={`mr-4 p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDark 
                    ? 'bg-purple-800 text-purple-300 hover:bg-purple-700' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              <div className={`text-xl font-bold ${
                isDark ? 'text-purple-300' : 'text-blue-600'
              }`}>
                <span className="text-2xl mr-2">学</span>
                Review Exam Results
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-purple-800 text-yellow-300 hover:bg-purple-700' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border ${
          isDark 
            ? 'bg-slate-800/30 border-purple-500/20' 
            : 'bg-white/80 border-blue-200/50'
        }`}>
          
          {/* Icon */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDark 
                ? 'bg-purple-600' 
                : 'bg-blue-600'
            }`}>
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Find Your Exam Results
            </h2>
            <p className={`mt-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter your name and exam code to review your answers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Your Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Exam Code
              </label>
              <div className="relative">
                <Hash className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  name="examCode"
                  value={formData.examCode}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="e.g., GNG-2025-001"
                  required
                />
              </div>
            </div>

            {error && (
              <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                isDark 
                  ? 'bg-red-900/50 border border-red-700 text-red-300' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <X className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                isDark
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Find My Results</span>
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className={`mt-6 p-4 rounded-lg ${
            isDark 
              ? 'bg-purple-900/30 border border-purple-700' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className={`flex items-start space-x-2 ${
              isDark ? 'text-purple-200' : 'text-blue-700'
            }`}>
              <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Note:</p>
                <p>Review is only available after you have completed and submitted your exam, and the exam period has ended.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
