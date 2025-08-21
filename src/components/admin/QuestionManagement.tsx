"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Grid, List, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { japaneseTheme, japaneseText, getCardClasses, getButtonClasses } from './theme';

interface Question {
  id: string;
  exam_questions?: Array<{
    exam: {
      id: string;
      name: string;
      exam_code: string;
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
  const [exams, setExams] = useState<Array<{id: string; name: string; exam_code: string;}>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
  }, [currentPage, itemsPerPage, searchTerm, examFilter]);

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
  const handleSort = (field: 'question_text' | 'created_at' | 'correct_option') => {
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
<>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">質問管理</h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">Question Management</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={`${getButtonClasses('primary')} px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg`}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium">{japaneseText.add.jp} • {japaneseText.add.en}</span>
        </button>
      </div>

      {/* Filters with Japanese design */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="質問を検索... Search questions..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white placeholder-gray-500 text-sm transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center">
          <select
            value={examFilter}
            onChange={(e) => handleExamFilterChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white text-sm min-w-[180px]"
          >
            <option value="all">すべての試験 • All Exams</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} ({exam.exam_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
        <button
          onClick={() => setViewMode('cards')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'cards'
              ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Grid className="h-4 w-4 mr-2" />
          カード • Cards
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'table'
              ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <List className="h-4 w-4 mr-2" />
          テーブル • Table
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
            {searchTerm  || examFilter !== 'all' ? 'No questions found matching your criteria' : 'No questions found'}
          </p>
          {!searchTerm  && examFilter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
            >
              Create your first question
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('question_text')}
                  >
                    <div className="flex items-center">
                      <span className="mr-1">質問 • Question</span>
                      {sortField === 'question_text' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    試験 • Exam
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('correct_option')}
                  >
                    <div className="flex items-center">
                      <span className="mr-1">正解 • Answer</span>
                      {sortField === 'correct_option' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors hidden lg:table-cell"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      <span className="mr-1">作成日 • Created</span>
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作 • Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedQuestions.map((question, index) => (
                  <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {index + 1 + (currentPage - 1) * itemsPerPage}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                            {question.question_text}
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {[
                              { letter: 'A', text: question.option_a, isCorrect: question.correct_option === 'A' },
                              { letter: 'B', text: question.option_b, isCorrect: question.correct_option === 'B' },
                              { letter: 'C', text: question.option_c, isCorrect: question.correct_option === 'C' },
                              { letter: 'D', text: question.option_d, isCorrect: question.correct_option === 'D' }
                            ].map((option) => (
                              <div key={option.letter} className="flex items-center space-x-1">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                                  option.isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {option.letter}
                                </span>
                                <span className={`truncate ${
                                  option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'
                                }`}>
                                  {option.text}
                                </span>
                              </div>
                            ))}
                          </div>
                          {/* Mobile info */}
                          <div className="mt-2 sm:hidden">
                            {question.exam_questions && question.exam_questions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {question.exam_questions.slice(0, 2).map((eq) => (
                                  <span key={eq.exam.id} className="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">
                                    {eq.exam.name}
                                  </span>
                                ))}
                                {question.exam_questions.length > 2 && (
                                  <span className="text-xs text-gray-500">+{question.exam_questions.length - 2} more</span>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Created: {new Date(question.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      {question.exam_questions && question.exam_questions.length > 0 ? (
                        <div className="space-y-1">
                          {question.exam_questions.slice(0, 2).map((eq) => (
                            <div key={eq.exam.id} className="bg-indigo-50 rounded-md p-2">
                              <div className="text-sm font-medium text-indigo-900">{eq.exam.name}</div>
                              <div className="text-xs text-indigo-600">{eq.exam.exam_code}</div>
                            </div>
                          ))}
                          {question.exam_questions.length > 2 && (
                            <div className="text-xs text-gray-500">+{question.exam_questions.length - 2} more exams</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">No exams</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          question.correct_option === 'A' ? 'bg-green-100 text-green-800' :
                          question.correct_option === 'B' ? 'bg-blue-100 text-blue-800' :
                          question.correct_option === 'C' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {question.correct_option}
                        </span>
                        <span className="ml-2 text-sm text-gray-700">Option {question.correct_option}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(question.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(question.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(question)}
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit question"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete question"
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
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedQuestions.map((question) => (
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
                      onClick={() => handleEdit(question)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Edit question"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
            {' - '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
            {' of '}
            <span className="font-medium">{totalItems}</span>
            {' results'}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {generatePageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={resetForm}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingQuestion ? 'Edit Question' : 'Create New Question'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
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
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
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
      )}
</>
  );
}
