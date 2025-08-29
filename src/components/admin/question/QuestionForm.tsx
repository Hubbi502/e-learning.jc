"use client";

import React from 'react';
import type { Question, QuestionFormData, Exam } from './types';

interface QuestionFormProps {
  showForm: boolean;
  editingQuestion: Question | null;
  formData: QuestionFormData;
  exams: Exam[];
  onFormDataChange: (data: QuestionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function QuestionForm({
  showForm,
  editingQuestion,
  formData,
  exams,
  onFormDataChange,
  onSubmit,
  onCancel
}: QuestionFormProps) {
  if (!showForm) return null;

  const handleExamToggle = (examId: string, checked: boolean) => {
    if (checked) {
      onFormDataChange({ 
        ...formData, 
        exam_ids: [...formData.exam_ids, examId] 
      });
    } else {
      onFormDataChange({ 
        ...formData, 
        exam_ids: formData.exam_ids.filter(id => id !== examId) 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onCancel}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {editingQuestion ? 'Edit Question' : 'Create New Question'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exams *
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {exams.map((exam) => (
                  <label key={exam.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.exam_ids.includes(exam.id)}
                      onChange={(e) => handleExamToggle(exam.id, e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">
                      {exam.name} ({exam.exam_code})
                    </span>
                  </label>
                ))}
                {exams.length === 0 && (
                  <p className="text-sm text-gray-500">No exams available</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                value={formData.question_text}
                onChange={(e) => onFormDataChange({ ...formData, question_text: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                rows={3}
                placeholder="Enter the question text"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option A *
                </label>
                <input
                  type="text"
                  value={formData.option_a}
                  onChange={(e) => onFormDataChange({ ...formData, option_a: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                  placeholder="Enter option A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option B *
                </label>
                <input
                  type="text"
                  value={formData.option_b}
                  onChange={(e) => onFormDataChange({ ...formData, option_b: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                  placeholder="Enter option B"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option C *
                </label>
                <input
                  type="text"
                  value={formData.option_c}
                  onChange={(e) => onFormDataChange({ ...formData, option_c: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                  placeholder="Enter option C"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option D *
                </label>
                <input
                  type="text"
                  value={formData.option_d}
                  onChange={(e) => onFormDataChange({ ...formData, option_d: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                  placeholder="Enter option D"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <select
                value={formData.correct_option}
                onChange={(e) => onFormDataChange({ ...formData, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                value={formData.explanation || ''}
                onChange={(e) => onFormDataChange({ ...formData, explanation: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                rows={3}
                placeholder="Enter explanation for the correct answer (will be shown in review)"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
            >
              {editingQuestion ? 'Update' : 'Create'} Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
