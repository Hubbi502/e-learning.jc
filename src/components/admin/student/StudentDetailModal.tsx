import React from 'react';
import { Student } from './types';
import { calculateStudentStats, getPerformanceGrade } from './utils';

interface StudentDetailModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onViewAnswers?: () => void;
}

export function StudentDetailModal({ student, isOpen, onClose, onViewAnswers }: StudentDetailModalProps) {
  if (!isOpen) return null;

  const stats = calculateStudentStats(student);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <span className="text-lg font-bold text-indigo-700">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-500">Student Details & Performance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Close"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
            {/* Student Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{student.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exam Code:</span>
                  <span className="font-medium">{student.exam_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{student.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    student.is_submitted ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {student.is_submitted ? 'Submitted' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Violations:</span>
                  <span className={`font-medium ${
                    student.violations > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {student.violations}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              {student.scores.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-medium">{stats.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Best Score:</span>
                    <span className="font-medium">{stats.bestScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Exams:</span>
                    <span className="font-medium">{stats.totalExams}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No exam scores available</p>
              )}
            </div>
          </div>

          {/* Exam History */}
          {student.scores.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Exam History</h3>
                <span className="text-sm text-gray-500">
                  {student.scores.length} exam{student.scores.length !== 1 ? 's' : ''} taken
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Exam ID
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date Taken
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {student.scores
                      .sort((a, b) => new Date(b.exam.created_at).getTime() - new Date(a.exam.created_at).getTime())
                      .map((score, index) => {
                        // Handle percentage as Decimal (from Prisma) - convert to number
                        let percentage: number;
                        if (score.percentage !== null && score.percentage !== undefined) {
                          const percentageValue = typeof score.percentage === 'number' ? score.percentage : parseFloat(score.percentage.toString());
                          percentage = !isNaN(percentageValue) ? percentageValue : (score.total_questions > 0 ? (score.score / score.total_questions) * 100 : 0);
                        } else {
                          // Fallback: calculate percentage from score and total_questions
                          percentage = score.total_questions > 0 ? (score.score / score.total_questions) * 100 : 0;
                        }
                        
                        const gradeInfo = getPerformanceGrade(percentage);
                        const examDate = new Date(score.exam.created_at);
                        
                        return (
                          <tr key={score.id} className={`
                            hover:bg-gray-50 transition-colors duration-150
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                          `}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {score.exam.id.slice(-8)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                score.exam.category === 'Gengo' 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {score.exam.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-gray-900">
                                  {score.score} / {score.total_questions}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${gradeInfo.color}`}>
                                {gradeInfo.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm text-gray-900">
                                  {examDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {examDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mt-8 pt-6 border-t border-gray-200">
            {onViewAnswers && student.is_submitted && (
              <button
                onClick={onViewAnswers}
                className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lihat Semua Jawaban
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
