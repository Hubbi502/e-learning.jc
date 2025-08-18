"use client";

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Trash2, Trophy, Award, TrendingUp, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreVertical, Grid, List } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class: string;
  exam_code: string;
  category: 'Gengo' | 'Bunka';
  started_at: string | null;
  violations: number;
  is_submitted: boolean;
  created_at: string;
  scores: Array<{
    id: string;
    score: number;
    total_questions: number;
    percentage: number;
    exam: {
      id: string;
      category: 'Gengo' | 'Bunka';
      created_at: string;
    };
  }>;
}

interface StudentStats {
  totalScore: number;
  totalExams: number;
  averageScore: number;
  bestScore: number;
  rank: number;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Gengo' | 'Bunka'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'in-progress'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  
  // New state for table improvements
  const [sortField, setSortField] = useState<'name' | 'class' | 'category' | 'status' | 'performance' | 'violations' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Auto-switch to card view on mobile devices
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('card');
      }
    };

    // Check on initial load
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This will remove all their exam data.`)) return;

    try {
      setIsDeleting(id);
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStudents();
        setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
      } else {
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)? This will remove all their exam data.`)) return;

    try {
      setLoading(true);
      const deletePromises = selectedStudents.map(id => 
        fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      await fetchStudents();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error deleting students:', error);
      alert('Failed to delete students');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    const allCurrentPageIds = paginatedStudents.map(student => student.id);
    if (selectedStudents.length === allCurrentPageIds.length && 
        allCurrentPageIds.every(id => selectedStudents.includes(id))) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allCurrentPageIds);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleExportData = () => {
    const dataToExport = selectedStudents.length > 0 
      ? students.filter(s => selectedStudents.includes(s.id))
      : sortedStudents;

    const csvData = dataToExport.map(student => {
      const stats = calculateStudentStats(student);
      return {
        Name: student.name,
        Class: student.class,
        'Exam Code': student.exam_code,
        Category: student.category,
        Status: student.is_submitted ? 'Submitted' : 'In Progress',
        'Average Score': stats.averageScore.toFixed(1) + '%',
        'Best Score': stats.bestScore.toFixed(1) + '%',
        'Total Exams': stats.totalExams,
        Violations: student.violations,
        'Created At': new Date(student.created_at).toLocaleDateString()
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateStudentStats = (student: Student): StudentStats => {
    if (student.scores.length === 0) {
      return {
        totalScore: 0,
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        rank: 0
      };
    }

    const totalScore = student.scores.reduce((sum, score) => sum + score.score, 0);
    const totalExams = student.scores.length;
    const averageScore = totalScore / totalExams;
    const bestScore = Math.max(...student.scores.map(score => 
      typeof score.percentage === 'number' ? score.percentage : 0
    ));

    // Calculate rank among all students
    const allAverages = students.map(s => {
      if (s.scores.length === 0) return 0;
      return s.scores.reduce((sum, score) => {
        const percentage = typeof score.percentage === 'number' ? score.percentage : 0;
        return sum + percentage;
      }, 0) / s.scores.length;
    }).sort((a, b) => b - a);
    
    const rank = allAverages.indexOf(averageScore) + 1;

    return {
      totalScore,
      totalExams,
      averageScore,
      bestScore,
      rank
    };
  };

  const getTopStudents = () => {
    return students
      .map(student => ({
        ...student,
        stats: calculateStudentStats(student)
      }))
      .filter(student => student.stats.totalExams > 0)
      .sort((a, b) => b.stats.averageScore - a.stats.averageScore)
      .slice(0, 10);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.exam_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || student.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'submitted' && student.is_submitted) ||
                         (statusFilter === 'in-progress' && !student.is_submitted);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortField) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'class':
        valueA = a.class.toLowerCase();
        valueB = b.class.toLowerCase();
        break;
      case 'category':
        valueA = a.category;
        valueB = b.category;
        break;
      case 'status':
        valueA = a.is_submitted ? 1 : 0;
        valueB = b.is_submitted ? 1 : 0;
        break;
      case 'performance':
        const statsA = calculateStudentStats(a);
        const statsB = calculateStudentStats(b);
        valueA = statsA.averageScore;
        valueB = statsB.averageScore;
        break;
      case 'violations':
        valueA = a.violations;
        valueB = b.violations;
        break;
      case 'created_at':
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const topStudents = getTopStudents();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-500">
            Total Students: <span className="font-medium text-gray-900">{students.length}</span>
          </div>
          {sortedStudents.length !== students.length && (
            <div className="text-indigo-600">
              Filtered: <span className="font-medium">{sortedStudents.length}</span>
            </div>
          )}
          {selectedStudents.length > 0 && (
            <div className="text-green-600">
              Selected: <span className="font-medium">{selectedStudents.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Submitted Exams</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.is_submitted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.scores.length > 0).length > 0 
                  ? (students
                      .filter(s => s.scores.length > 0)
                      .reduce((sum, s) => sum + calculateStudentStats(s).averageScore, 0) / 
                      students.filter(s => s.scores.length > 0).length
                    ).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Award className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">With Violations</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.violations > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Top 10 Students</h2>
        </div>
        
        {topStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topStudents.map((student, index) => (
              <div key={student.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.class}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-medium">{student.stats.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best Score:</span>
                    <span className="font-medium">{student.stats.bestScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exams Taken:</span>
                    <span className="font-medium">{student.stats.totalExams}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No student performance data available</p>
        )}
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'Gengo' | 'Bunka')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Gengo">Gengo (Language)</option>
              <option value="Bunka">Bunka (Culture)</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'submitted' | 'in-progress')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Table View (Better for desktop)"
                disabled={typeof window !== 'undefined' && window.innerWidth < 768}
              >
                <List className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'card'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Card View (Better for mobile)"
              >
                <Grid className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
          <div>
            <button
              onClick={handleExportData}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
            >
              Export Data
            </button>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedStudents([])}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {sortedStudents.length === 0 ? 'No students found' : 'No students on this page'}
            </p>
            {sortedStudents.length > 0 && (
              <button
                onClick={() => setCurrentPage(1)}
                className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Go to first page
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={paginatedStudents.length > 0 && paginatedStudents.every(student => selectedStudents.includes(student.id))}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Student</span>
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Exam Code</span>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Category</span>
                          {getSortIcon('category')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Status</span>
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('performance')}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Performance</span>
                          {getSortIcon('performance')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('violations')}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Violations</span>
                          {getSortIcon('violations')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedStudents.map((student, index) => {
                      const stats = calculateStudentStats(student);
                      const getPerformanceGrade = (average: number) => {
                        if (average >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-50 border-green-200' };
                        if (average >= 80) return { grade: 'A', color: 'text-green-600 bg-green-50 border-green-200' };
                        if (average >= 70) return { grade: 'B', color: 'text-blue-600 bg-blue-50 border-blue-200' };
                        if (average >= 60) return { grade: 'C', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
                        return { grade: 'D', color: 'text-red-600 bg-red-50 border-red-200' };
                      };
                      
                      const grade = stats.totalExams > 0 ? getPerformanceGrade(stats.averageScore) : null;
                      
                      return (
                        <tr key={student.id} className={`
                          hover:bg-gray-50 transition-colors duration-150
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                          ${selectedStudents.includes(student.id) ? 'bg-indigo-50' : ''}
                        `}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                                  <span className="text-sm font-bold text-indigo-700">
                                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-500">{student.class}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              {student.exam_code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              student.category === 'Gengo' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {student.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
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
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              {student.violations > 0 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  ⚠️ {student.violations}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  ✓ 0
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowStudentDetail(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors duration-200"
                                title="View Details"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(student.id, student.name)}
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                {/* Card View Header with Select All */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={paginatedStudents.length > 0 && paginatedStudents.every(student => selectedStudents.includes(student.id))}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select all on this page
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {paginatedStudents.length} student{paginatedStudents.length !== 1 ? 's' : ''} displayed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedStudents.map((student, index) => {
                    const stats = calculateStudentStats(student);
                    const getPerformanceGrade = (average: number) => {
                      if (average >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-50 border-green-200' };
                      if (average >= 80) return { grade: 'A', color: 'text-green-600 bg-green-50 border-green-200' };
                      if (average >= 70) return { grade: 'B', color: 'text-blue-600 bg-blue-50 border-blue-200' };
                      if (average >= 60) return { grade: 'C', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
                      return { grade: 'D', color: 'text-red-600 bg-red-50 border-red-200' };
                    };
                    
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
                            onChange={() => handleSelectStudent(student.id)}
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
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowStudentDetail(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.name)}
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedStudents.length)} of {sortedStudents.length} students
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (currentPage <= 4) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white border border-indigo-600'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={() => setShowStudentDetail(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <span className="text-lg font-bold text-indigo-700">
                        {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedStudent.name}
                      </h2>
                      <p className="text-sm text-gray-500">Student Details & Performance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStudentDetail(false)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    title="Close"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedStudent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Class:</span>
                        <span className="font-medium">{selectedStudent.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exam Code:</span>
                        <span className="font-medium">{selectedStudent.exam_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedStudent.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          selectedStudent.is_submitted ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {selectedStudent.is_submitted ? 'Submitted' : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Violations:</span>
                        <span className={`font-medium ${
                          selectedStudent.violations > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {selectedStudent.violations}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                    {selectedStudent.scores.length > 0 ? (
                      <div className="space-y-2">
                        {(() => {
                          const stats = calculateStudentStats(selectedStudent);
                          return (
                            <>
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
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-gray-500">No exam scores available</p>
                    )}
                  </div>
                </div>

                {/* Exam History */}
                {selectedStudent.scores.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Exam History</h3>
                      <span className="text-sm text-gray-500">
                        {selectedStudent.scores.length} exam{selectedStudent.scores.length !== 1 ? 's' : ''} taken
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
                          {selectedStudent.scores
                            .sort((a, b) => new Date(b.exam.created_at).getTime() - new Date(a.exam.created_at).getTime())
                            .map((score, index) => {
                              const percentage = typeof score.percentage === 'number' ? score.percentage : 0;
                              const getGradeInfo = (perc: number) => {
                                if (perc >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800 border-green-200' };
                                if (perc >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800 border-green-200' };
                                if (perc >= 70) return { grade: 'B', color: 'bg-blue-100 text-blue-800 border-blue-200' };
                                if (perc >= 60) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
                                return { grade: 'D', color: 'bg-red-100 text-red-800 border-red-200' };
                              };
                              
                              const gradeInfo = getGradeInfo(percentage);
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

                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowStudentDetail(false)}
                    className="inline-flex items-center px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
