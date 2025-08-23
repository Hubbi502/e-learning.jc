"use client";

import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  examFilter: string;
  onCreateClick: () => void;
}

export function EmptyState({ searchTerm, examFilter, onCreateClick }: EmptyStateProps) {
  const hasFilters = searchTerm || examFilter !== 'all';

  return (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-sm sm:text-base">
        {hasFilters ? 'No questions found matching your criteria' : 'No questions found'}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreateClick}
          className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
        >
          Create your first question
        </button>
      )}
    </div>
  );
}
