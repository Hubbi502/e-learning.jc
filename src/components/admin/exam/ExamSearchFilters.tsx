"use client";

import React from 'react';
import { Search, Grid, List } from 'lucide-react';

interface ExamSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
}

export function ExamSearchFilters({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode 
}: ExamSearchFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Search exams by category or exam code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
          />
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="h-4 w-4 mr-1" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </button>
        </div>
      </div>
    </div>
  );
}
