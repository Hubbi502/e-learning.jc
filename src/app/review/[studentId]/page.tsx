"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ExamReview } from '@/components/exam';

export default function StudentReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const studentId = params.studentId as string;
  const examCode = searchParams.get('examCode');
  
  const [isDark, setIsDark] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    if (!studentId || !examCode) {
      setError('Missing student ID or exam code');
      setLoading(false);
      return;
    }

    loadReviewData();
  }, [studentId, examCode]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/exam-review?studentId=${studentId}&examCode=${examCode}`);
      const result = await response.json();

      if (result.success) {
        setReviewData(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error loading review data:', error);
      setError('Failed to load review data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/review');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading review data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Unable to Load Review
          </h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={handleBack}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
              isDark
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No review data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <ExamReview 
      reviewData={reviewData}
      isDark={isDark}
      toggleTheme={toggleTheme}
      onBack={handleBack}
    />
  );
}
