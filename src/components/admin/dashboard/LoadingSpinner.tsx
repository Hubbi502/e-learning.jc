import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-48 sm:h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-slate-200 border-t-indigo-600 shadow-lg"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-md animate-pulse"></div>
      </div>
      <p className="text-sm sm:text-base text-slate-600 mt-6 font-medium tracking-wide">読み込み中... Loading dashboard</p>
    </div>
  );
}
