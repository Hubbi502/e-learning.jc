import React from 'react';
import { Flag, Shield, Clock } from 'lucide-react';

interface Question {
  id: string;
  questionNumber: number;
  question_text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  categories: string[];
}

interface NavigationPanelProps {
  questions: Question[];
  answers: Record<string, string>;
  currentQuestion: number;
  onQuestionSelect: (index: number) => void;
  flaggedQuestions: Set<number>;
  isDark: boolean;
  violations?: number;
  nextViolationCheck?: number;
}

export default function NavigationPanel({
  questions,
  answers,
  currentQuestion,
  onQuestionSelect,
  flaggedQuestions,
  isDark,
  violations = 0,
  nextViolationCheck = 10
}: NavigationPanelProps) {
  return (
    <div className={`backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border ${
      isDark 
        ? 'bg-slate-800/30 border-purple-500/20' 
        : 'bg-white/80 border-blue-200/50'
    }`}>
      
      <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Question Navigator
      </h3>

      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-1.5 sm:gap-2">
        {questions.map((question, index) => {
          const isAnswered = answers[question.id];
          const isCurrent = index === currentQuestion;
          const isFlagged = flaggedQuestions.has(index);

          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
                isCurrent
                  ? isDark
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : isAnswered
                    ? isDark
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 active:bg-slate-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-300'
              }`}
            >
              {index + 1}
              {isFlagged && (
                <Flag className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${
            isDark ? 'bg-slate-700' : 'bg-gray-200'
          }`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Not answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Flagged</span>
        </div>
        
        {/* Violation Status */}
        <div className="pt-2 mt-3 border-t border-gray-200 dark:border-gray-600">
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            violations >= 2
              ? 'bg-red-500/20 text-red-600'
              : violations >= 1
                ? 'bg-yellow-500/20 text-yellow-600'
                : isDark 
                  ? 'bg-slate-700/50 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
          }`}>
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Violations</span>
            </div>
            <span className="font-bold">{violations}/3</span>
          </div>
          
          {/* Next Violation Check Countdown */}
          <div className={`mt-2 p-2 rounded-lg ${
            isDark ? 'bg-slate-600/50 text-slate-300' : 'bg-blue-50 text-blue-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">Next Check</span>
              </div>
              <span className="text-xs font-bold">{nextViolationCheck}s</span>
            </div>
          </div>
          
          {violations >= 2 && (
            <p className="text-red-500 text-xs mt-1 text-center font-medium">
              ⚠️ Exam will auto-submit at 3 violations
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
