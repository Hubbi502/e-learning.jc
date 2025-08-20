"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Grid, List, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  exam_questions?: Array<{
    exam: {
      id: string;
      name: string;
      exam_code: string;
      category: 'Gengo' | 'Bunka';
    };
  }>;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  created_at: string;
  updated_at: string;
}

interface QuestionFormData {
  exam_ids: string[];
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
}

export function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Array<{id: string; name: string; exam_code: string; category: 'Gengo' | 'Bunka'}>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Gengo' | 'Bunka'>('all');
  const [examFilter, setExamFilter] = useState<'all' | string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [sortField, setSortField] = useState<'question_text' | 'category' | 'created_at' | 'correct_option'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState<QuestionFormData>({
    exam_ids: [],
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  });

  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, [currentPage, itemsPerPage, searchTerm, categoryFilter, examFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      if (examFilter !== 'all') {
        params.append('exam_id', examFilter);
      }
      
      const response = await fetch(`/api/admin/questions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setTotalItems(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 0);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams?limit=100');
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.exam_ids.length === 0) {
      alert('Please select at least one exam');
      return;
    }

    try {
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchQuestions();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      exam_ids: question.exam_questions ? question.exam_questions.map(eq => eq.exam.id) : [],
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchQuestions();
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({
      exam_ids: [],
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  // Handle search with debounce effect
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category: 'all' | 'Gengo' | 'Bunka') => {
    setCategoryFilter(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle exam filter change
  const handleExamFilterChange = (examId: 'all' | string) => {
    setExamFilter(examId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Sorting logic
  const handleSort = (field: 'question_text' | 'category' | 'created_at' | 'correct_option') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting to questions
  const sortedQuestions = [...questions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'question_text':
        aValue = a.question_text.toLowerCase();
        bValue = b.question_text.toLowerCase();
        break;
      case 'category':
        aValue = a.exam_questions?.[0]?.exam?.category || '';
        bValue = b.exam_questions?.[0]?.exam?.category || '';
        break;
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'correct_option':
        aValue = a.correct_option;
        bValue = b.correct_option;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Question Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage exam questions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value as 'all' | 'Gengo' | 'Bunka')}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            <option value="Gengo">Gengo (Language)</option>
            <option value="Bunka">Bunka (Culture)</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={examFilter}
            onChange={(e) => handleExamFilterChange(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
          >
            <option value="all">All Exams</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} ({exam.exam_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-6">
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

      {/* Questions Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            {searchTerm || categoryFilter !== 'all' || examFilter !== 'all' ? 'No questions found matching your criteria' : 'No questions found'}
          </p>
          {!searchTerm && categoryFilter === 'all' && examFilter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
            >
              Create your first question
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('question_text')}
                >
                  <div className="flex items-center">
                    Question
                    {sortField === 'question_text' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors hidden sm:table-cell"
                  onClick={() => handleSort('correct_option')}
                >
                  <div className="flex items-center">
                    Answer
                    {sortField === 'correct_option' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors hidden sm:table-cell"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="max-w-xs sm:max-w-sm">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {question.question_text}
                      </p>
                      <div className="mt-1 text-xs text-gray-500 grid grid-cols-2 gap-1">
                        <div>A: <span className="font-medium">{question.option_a}</span></div>
                        <div>B: <span className="font-medium">{question.option_b}</span></div>
                        <div>C: <span className="font-medium">{question.option_c}</span></div>
                        <div>D: <span className="font-medium">{question.option_d}</span></div>
                      </div>
                      {/* Mobile: Show additional info */}
                      <div className="mt-2 sm:hidden space-y-1">
                        {question.exam_questions && question.exam_questions.length > 0 && (
                          <div className="text-xs text-indigo-600 space-y-1">
                            {question.exam_questions.map((eq) => (
                              <div key={eq.exam.id}>
                                📋 {eq.exam.name} ({eq.exam.exam_code})
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            question.exam_questions?.[0]?.exam?.category === 'Gengo' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {question.exam_questions?.[0]?.exam?.category || 'No Category'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Answer: Option {question.correct_option}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.exam_questions && question.exam_questions.length > 0 ? (
                      <div className="space-y-1">
                        {question.exam_questions.map((eq) => (
                          <div key={eq.exam.id}>
                            <div className="font-medium text-indigo-600">{eq.exam.name}</div>
                            <div className="text-xs text-gray-500">{eq.exam.exam_code}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No exams</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      question.exam_questions?.[0]?.exam?.category === 'Gengo' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {question.exam_questions?.[0]?.exam?.category || 'No Category'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    <span className="font-medium">Option {question.correct_option}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {new Date(question.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      question.exam_questions?.[0]?.exam?.category === 'Gengo' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {question.exam_questions?.[0]?.exam?.category || 'No Category'}
                    </span>
                  </div>
                  {question.exam_questions && question.exam_questions.length > 0 && (
                    <div className="text-xs text-indigo-600 space-y-1">
                      {question.exam_questions.map((eq) => (
                        <div key={eq.exam.id}>
                          📋 {eq.exam.name} ({eq.exam.exam_code})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(question)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-3 line-clamp-2">
                {question.question_text}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                  <div>A: {question.option_a}</div>
                  <div>B: {question.option_b}</div>
                  <div>C: {question.option_c}</div>
                  <div>D: {question.option_d}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Answer: Option {question.correct_option}</span>
                <span>{new Date(question.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {generatePageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-sm px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ 
                                ...formData, 
                                exam_ids: [...formData.exam_ids, exam.id] 
                              });
                            } else {
                              setFormData({ 
                                ...formData, 
                                exam_ids: formData.exam_ids.filter(id => id !== exam.id) 
                              });
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">
                          {exam.name} ({exam.exam_code}) - {exam.category}
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
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
