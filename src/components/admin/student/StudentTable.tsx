"use client"
import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Trash2, Eye, MoreVertical, User, BookOpen, Clock, AlertTriangle, Menu, Grid3X3, List, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Student, SortField, SortDirection } from './types';
import { calculateStudentStats, getPerformanceGrade } from './utils';

interface StudentTableProps {
  students: Student[];
  selectedStudents: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  isDeleting: string | null;
  onSort: (field: SortField) => void;
  onSelectAll: () => void;
  onSelectStudent: (studentId: string) => void;
  onViewDetail: (student: Student) => void;
  onViewAnswers?: (student: Student) => void;
  onDelete: (id: string, name: string) => void;
}

export function StudentTable({
  students,
  selectedStudents,
  sortField,
  sortDirection,
  isDeleting, 
  onSort,
  onSelectAll,
  onSelectStudent,
  onViewDetail,
  onViewAnswers,
  onDelete
}: StudentTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-switch to cards on mobile
      if (width < 768) {
        setViewMode('cards');
      } else if (viewMode === 'cards' && width >= 768) {
        setViewMode('table');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [viewMode]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Mobile Card Component
  const StudentCard = ({ student, index }: { student: Student; index: number }) => {
    const stats = calculateStudentStats(student);
    const grade = stats.totalExams > 0 ? getPerformanceGrade(stats.averageScore) : null;

    return (
      <div className={`
        bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm transition-all duration-200
        ${selectedStudents.includes(student.id) ? 'ring-2 ring-indigo-500 bg-indigo-50 shadow-md' : 'hover:shadow-md'}
        active:scale-[0.98]
      `}>
        {/* Header with selection and name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => onSelectStudent(student.id)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-sm font-bold text-indigo-700">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 leading-tight">{student.name}</h3>
                <p className="text-sm text-gray-500">{student.class}</p>
              </div>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className={`w-3 h-3 rounded-full ${
            student.is_submitted ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase font-medium mb-1">Exam Code</p>
            <span className="text-sm font-semibold text-gray-900">
              {student.exam_code}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase font-medium mb-1">Category</p>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              student.category === 'Gengo' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {student.category}
            </span>
          </div>
        </div>

        {/* Status and Performance */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
              student.is_submitted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {student.is_submitted ? 'Submitted' : 'In Progress'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Violations</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              student.violations > 0 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {student.violations > 0 ? `⚠️ ${student.violations}` : '✓ 0'}
            </span>
          </div>

          {/* Performance */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Performance</span>
            {stats.totalExams > 0 ? (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${grade?.color}`}>
                  {grade?.grade}
                </span>
                <span className="text-sm font-semibold text-gray-900">{stats.averageScore.toFixed(1)}%</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No exams</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetail(student)}
            className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors touch-manipulation"
          >
            <Eye className="h-4 w-4 mr-2" />
            Detail
          </button>
          
          {onViewAnswers && student.is_submitted && (
            <button
              onClick={() => onViewAnswers(student)}
              className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors touch-manipulation"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Jawaban
            </button>
          )}
          
          <button
            onClick={() => onDelete(student.id, student.name)}
            disabled={isDeleting === student.id}
            className="px-4 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 touch-manipulation"
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
  };

  return (
    <div className="w-full">
      {/* View Mode Toggle - Only show on tablet and up */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Students ({students.length})
            </h3>
            {selectedStudents.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {/* Mobile header with count */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Students ({students.length})
              </h3>
              {selectedStudents.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </span>
              )}
            </div>
          )}
          
          {/* Select All for cards */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={students.length > 0 && students.every(student => selectedStudents.includes(student.id))}
                onChange={onSelectAll}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Select All Students</span>
            </label>
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-4 ${
            isMobile 
              ? 'grid-cols-1' 
              : isTablet 
                ? 'grid-cols-2' 
                : 'grid-cols-3'
          }`}>
            {students.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} />
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-3 lg:px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={students.length > 0 && students.every(student => selectedStudents.includes(student.id))}
                      onChange={onSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  <th 
                    className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => onSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Student</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  
                  {/* Hide exam code on smaller screens */}
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Exam Code</span>
                    </div>
                  </th>
                  
                  <th 
                    className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => onSort('category')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className="hidden sm:inline">Category</span>
                      <span className="sm:hidden">Cat.</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  
                  <th 
                    className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => onSort('status')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  
                  {/* Hide performance on mobile */}
                  <th 
                    className="hidden md:table-cell px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => onSort('performance')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Performance</span>
                      {getSortIcon('performance')}
                    </div>
                  </th>
                  
                  <th 
                    className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => onSort('violations')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className="hidden sm:inline">Violations</span>
                      <span className="sm:hidden">⚠️</span>
                      {getSortIcon('violations')}
                    </div>
                  </th>
                  
                  <th className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => {
                  const stats = calculateStudentStats(student);
                  const grade = stats.totalExams > 0 ? getPerformanceGrade(stats.averageScore) : null;
                  
                  return (
                    <tr key={student.id} className={`
                      hover:bg-gray-50 transition-colors duration-150
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                      ${selectedStudents.includes(student.id) ? 'bg-indigo-50' : ''}
                    `}>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => onSelectStudent(student.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 lg:w-10 h-8 lg:h-10">
                            <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                              <span className="text-xs lg:text-sm font-bold text-indigo-700">
                                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 lg:ml-4">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-32 lg:max-w-none">
                              {student.name}
                            </p>
                            <p className="text-xs lg:text-sm text-gray-500">{student.class}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Exam Code - Hidden on smaller screens */}
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {student.exam_code}
                        </span>
                      </td>
                      
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 lg:px-3 py-1 text-xs font-semibold rounded-full ${
                          student.category === 'Gengo' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          <span className="hidden sm:inline">{student.category}</span>
                          <span className="sm:hidden">{student.category.slice(0, 1)}</span>
                        </span>
                      </td>
                      
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center px-2 lg:px-3 py-1 text-xs font-semibold rounded-full ${
                            student.is_submitted 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            <div className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full mr-1 lg:mr-2 ${
                              student.is_submitted ? 'bg-green-400' : 'bg-yellow-400'
                            }`}></div>
                            <span className="hidden sm:inline">
                              {student.is_submitted ? 'Submitted' : 'In Progress'}
                            </span>
                            <span className="sm:hidden">
                              {student.is_submitted ? '✓' : '⏳'}
                            </span>
                          </span>
                        </div>
                      </td>
                      
                      {/* Performance - Hidden on mobile */}
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                        {stats.totalExams > 0 ? (
                          <div className="flex flex-col items-center">
                            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${grade?.color}`}>
                              {grade?.grade}
                            </div>
                            <div className="mt-1">
                              <p className="text-sm font-semibold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{stats.totalExams} exam{stats.totalExams !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                              N/A
                            </span>
                            <p className="text-xs text-gray-400 mt-1">No exams</p>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {student.violations > 0 ? (
                            <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <span className="hidden sm:inline">⚠️ {student.violations}</span>
                              <span className="sm:hidden">{student.violations}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <span className="hidden sm:inline">✓ 0</span>
                              <span className="sm:hidden">0</span>
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1 lg:space-x-2">
                          <button
                            onClick={() => onViewDetail(student)}
                            className="inline-flex items-center px-2 lg:px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors duration-200 touch-manipulation"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 lg:mr-1" />
                            <span className="hidden lg:inline">Detail</span>
                          </button>
                          
                          {onViewAnswers && student.is_submitted && (
                            <button
                              onClick={() => onViewAnswers(student)}
                              className="inline-flex items-center px-2 lg:px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-200 touch-manipulation"
                              title="View Answers"
                            >
                              <svg className="h-3 w-3 lg:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="hidden lg:inline">Jawaban</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => onDelete(student.id, student.name)}
                            disabled={isDeleting === student.id}
                            className="inline-flex items-center p-1.5 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            title="Delete Student"
                          >
                            {isDeleting === student.id ? (
                              <div className="h-3 lg:h-4 w-3 lg:w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <Trash2 className="h-3 lg:h-4 w-3 lg:w-4" />
                            )}
                          </button>
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

      {/* Empty State */}
      {students.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding some students to your system.
          </p>
        </div>
      )}
    </div>
  );
}
