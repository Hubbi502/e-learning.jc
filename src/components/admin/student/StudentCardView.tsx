import React, { useState, useEffect } from 'react';
import { Trash2, Eye, BookOpen, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Student } from './types';
import { calculateStudentStats, getPerformanceGrade } from './utils';

interface StudentCardViewProps {
  students: Student[];
  selectedStudents: string[];
  isDeleting: string | null;
  onSelectAll: () => void;
  onSelectStudent: (studentId: string) => void;
  onViewDetail: (student: Student) => void;
  onViewAnswers?: (student: Student) => void;
  onDelete: (id: string, name: string) => void;
}

export function StudentCardView({
  students,
  selectedStudents,
  isDeleting,
  onSelectAll,
  onSelectStudent,
  onViewDetail,
  onViewAnswers,
  onDelete
}: StudentCardViewProps) {
  return (
    <div className="p-6">
      {/* Card View Header with Select All */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={students.length > 0 && students.every(student => selectedStudents.includes(student.id))}
            onChange={onSelectAll}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Select all on this page
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {students.length} student{students.length !== 1 ? 's' : ''} displayed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student, index) => {
          const stats = calculateStudentStats(student);
          const grade = stats.totalExams > 0 ? getPerformanceGrade(stats.averageScore) : null;

          return (
            <div
              key={student.id}
              className={`relative bg-white border rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${
                selectedStudents.includes(student.id) ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => onSelectStudent(student.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* Student Header */}
              <div className="flex items-center mb-4 pl-8">
                <div className="flex-shrink-0 w-12 h-12">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-lg font-bold text-indigo-700">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.class}</p>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exam Code:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {student.exam_code}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    student.category === 'Gengo' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {student.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    student.is_submitted 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      student.is_submitted ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    {student.is_submitted ? 'Submitted' : 'In Progress'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance:</span>
                  {stats.totalExams > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${grade?.color}`}>
                        {grade?.grade}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.averageScore.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                      N/A
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Violations:</span>
                  {student.violations > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      ⚠️ {student.violations}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ✓ 0
                    </span>
                  )}
                </div>

                {stats.totalExams > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Exams taken: {stats.totalExams}</span>
                      <span>Best: {stats.bestScore.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onViewDetail(student)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors duration-200"
                  title="View Details"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Detail
                </button>
                {onViewAnswers && student.is_submitted && (
                  <button
                    onClick={() => onViewAnswers(student)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-200"
                    title="View Answers"
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Jawaban
                  </button>
                )}
                <button
                  onClick={() => onDelete(student.id, student.name)}
                  disabled={isDeleting === student.id}
                  className="inline-flex items-center p-1.5 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Student"
                >
                  {isDeleting === student.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
