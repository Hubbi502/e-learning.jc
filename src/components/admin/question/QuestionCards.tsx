"use client";

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Question } from './types';

interface QuestionCardsProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export function QuestionCards({ questions, onEdit, onDelete }: QuestionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {questions.map((question) => (
        <div key={question.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                {question.exam_questions && question.exam_questions.length > 0 ? (
                  <div className="space-y-1">
                    {question.exam_questions.slice(0, 2).map((eq) => (
                      <div key={eq.exam.id} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium text-indigo-700 truncate">
                          {eq.exam.name}
                        </span>
                        <span className="text-xs text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
                          {eq.exam.exam_code}
                        </span>
                      </div>
                    ))}
                    {question.exam_questions.length > 2 && (
                      <div className="text-xs text-indigo-600 font-medium">
                        +{question.exam_questions.length - 2} more exams
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500 italic">No exams assigned</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(question)}
                  className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                  title="Edit question"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 leading-relaxed line-clamp-3">
              {question.question_text}
            </h3>
            
            {/* Options Grid */}
            <div className="space-y-3 mb-6">
              {[
                { letter: 'A', text: question.option_a },
                { letter: 'B', text: question.option_b },
                { letter: 'C', text: question.option_c },
                { letter: 'D', text: question.option_d }
              ].map((option) => (
                <div key={option.letter} className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  question.correct_option === option.letter 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    question.correct_option === option.letter
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {option.letter}
                  </div>
                  <span className={`text-sm flex-1 ${
                    question.correct_option === option.letter 
                      ? 'text-green-800 font-medium' 
                      : 'text-gray-700'
                  }`}>
                    {option.text}
                  </span>
                  {question.correct_option === option.letter && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Card Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Correct: Option {question.correct_option}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(question.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
