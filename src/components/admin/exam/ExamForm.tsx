"use client";

import React from 'react';
import { Plus } from 'lucide-react';

interface ExamFormData {
  name: string;
  exam_code: string;
  category: 'Gengo' | 'Bunka';
  duration: number;
  start_time: string;
  end_time: string;
}

interface Exam {
  id: string;
  name: string;
  exam_code: string;
  category: 'Gengo' | 'Bunka';
  duration: number;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    scores: number;
  };
}

interface ExamFormProps {
  showForm: boolean;
  editingExam: Exam | null;
  formData: ExamFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExamFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function ExamForm({ 
  showForm, 
  editingExam, 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel 
}: ExamFormProps) {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onCancel}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
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
                Exam Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                placeholder="Enter exam name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Code
              </label>
              <input
                type="text"
                value={formData.exam_code}
                onChange={(e) => setFormData({ ...formData, exam_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                placeholder="e.g., GNG-2025-001 (leave empty for auto-generation)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: GNG-YYYY-XXX for Gengo or BNK-YYYY-XXX for Bunka. Leave empty to auto-generate.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Gengo' | 'Bunka' })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                required
              >
                <option value="Gengo">Gengo (Language)</option>
                <option value="Bunka">Bunka (Culture)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                min="1"
                max="180"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
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
              {editingExam ? 'Update' : 'Create'} Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
