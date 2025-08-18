"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Grid, List, ChevronUp, ChevronDown } from 'lucide-react';

interface Question {
  id: string;
  categories: ('Gengo' | 'Bunka')[];
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  created_at: string;
  updated_at: string;
  question_categories?: Array<{
    id: string;
    category: 'Gengo' | 'Bunka';
    created_at: string;
  }>;
}

interface QuestionFormData {
  categories: ('Gengo' | 'Bunka')[];
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
}

export function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Gengo' | 'Bunka'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [sortField, setSortField] = useState<'question_text' | 'categories' | 'created_at' | 'correct_option'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState<QuestionFormData>({
    categories: ['Gengo'],
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one category is selected
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
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
        const error = await response.json();
        alert(error.message || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      categories: question.categories || [],
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
      categories: ['Gengo'],
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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.option_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.option_b.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.option_c.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.option_d.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                          (question.categories && question.categories.includes(categoryFilter as 'Gengo' | 'Bunka'));
    
    return matchesSearch && matchesCategory;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'question_text':
        comparison = a.question_text.localeCompare(b.question_text);
        break;
      case 'categories':
        comparison = a.categories.join(', ').localeCompare(b.categories.join(', '));
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'correct_option':
        comparison = a.correct_option.localeCompare(b.correct_option);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm sm:text-base text-gray-500">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Question Management</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          Add Question
        </button>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'Gengo' | 'Bunka')}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
              >
                <option value="all">All Categories</option>
                <option value="Gengo">Gengo (Language)</option>
                <option value="Bunka">Bunka (Culture)</option>
              </select>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
        </div>
      </div>

      {/* Question Form Modal */}
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
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                      Categories (Select one or more)
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes('Gengo')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ 
                                ...formData, 
                                categories: [...formData.categories, 'Gengo'] 
                              });
                            } else {
                              setFormData({ 
                                ...formData, 
                                categories: formData.categories.filter(cat => cat !== 'Gengo') 
                              });
                            }
                          }}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Gengo (Language)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes('Bunka')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ 
                                ...formData, 
                                categories: [...formData.categories, 'Bunka'] 
                              });
                            } else {
                              setFormData({ 
                                ...formData, 
                                categories: formData.categories.filter(cat => cat !== 'Bunka') 
                              });
                            }
                          }}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Bunka (Culture)</span>
                      </label>
                    </div>
                    {formData.categories.length === 0 && (
                      <p className="mt-1 text-sm text-red-600">At least one category must be selected</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option A
                      </label>
                      <input
                        type="text"
                        value={formData.option_a}
                        onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option B
                      </label>
                      <input
                        type="text"
                        value={formData.option_b}
                        onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option C
                      </label>
                      <input
                        type="text"
                        value={formData.option_c}
                        onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option D
                      </label>
                      <input
                        type="text"
                        value={formData.option_d}
                        onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <select
                      value={formData.correct_option}
                      onChange={(e) => setFormData({ ...formData, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                      required
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
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

      {/* Questions Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm || categoryFilter !== 'all' ? 'No questions found matching your criteria' : 'No questions found'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
                >
                  Create your first question
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">
                    Total: {sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    Gengo: {sortedQuestions.filter(q => q.categories.includes('Gengo')).length}
                  </span>
                  <span>
                    Bunka: {sortedQuestions.filter(q => q.categories.includes('Bunka')).length}
                  </span>
                  <span>
                    Both: {sortedQuestions.filter(q => q.categories.includes('Gengo') && q.categories.includes('Bunka')).length}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
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
                      <th 
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('categories')}
                      >
                        <div className="flex items-center">
                          Categories
                          {sortField === 'categories' && (
                            sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors hidden sm:table-cell"
                        onClick={() => handleSort('correct_option')}
                      >
                        <div className="flex items-center">
                          Correct Answer
                          {sortField === 'correct_option' && (
                            sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors hidden md:table-cell"
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
                      <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="max-w-sm">
                            <p className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                              {question.question_text}
                            </p>
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              <div>A: <span className="font-medium">{question.option_a}</span></div>
                              <div>B: <span className="font-medium">{question.option_b}</span></div>
                              <div>C: <span className="font-medium">{question.option_c}</span></div>
                              <div>D: <span className="font-medium">{question.option_d}</span></div>
                            </div>
                            {/* Mobile: Show additional info */}
                            <div className="mt-2 sm:hidden space-y-1">
                              <div className="flex items-center flex-wrap gap-1">
                                {question.categories.map((category) => (
                                  <span key={category} className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    category === 'Gengo' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {category}
                                  </span>
                                ))}
                                <span className="ml-2 text-xs text-gray-500">
                                  Answer: Option {question.correct_option}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {question.categories.map((category) => (
                              <span key={category} className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                category === 'Gengo' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {category}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          <span className="font-medium">Option {question.correct_option}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {question.correct_option === 'A' ? question.option_a :
                             question.correct_option === 'B' ? question.option_b :
                             question.correct_option === 'C' ? question.option_c :
                             question.option_d}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(question.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(question)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                              title="Edit question"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(question.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
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
            </>
          )}
        </div>
      ) : (
        /* Card View */
        <>
          {/* Sort Controls for Card View */}
          {sortedQuestions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium mr-2">Sort by:</span>
                <button
                  onClick={() => handleSort('question_text')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'question_text' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Question {sortField === 'question_text' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('categories')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'categories' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Category {sortField === 'categories' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('created_at')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'created_at' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('correct_option')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'correct_option' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Answer {sortField === 'correct_option' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {sortedQuestions.length === 0 ? (
              <div className="col-span-full text-center py-12 sm:py-16">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  {searchTerm || categoryFilter !== 'all' ? 'No questions found matching your criteria' : 'No questions found'}
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
                  >
                    Create your first question
                  </button>
                )}
              </div>
            ) : (
              sortedQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-1">
                      {question.categories.map((category) => (
                        <span key={category} className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          category === 'Gengo' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 leading-relaxed">
                      {question.question_text}
                    </h3>
                    
                    <div className="space-y-2">
                      {(['A', 'B', 'C', 'D'] as const).map((option) => (
                        <div 
                          key={option}
                          className={`p-2 rounded-lg text-sm border ${
                            question.correct_option === option
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="font-medium">{option}:</span> {
                            option === 'A' ? question.option_a :
                            option === 'B' ? question.option_b :
                            option === 'C' ? question.option_c :
                            question.option_d
                          }
                          {question.correct_option === option && (
                            <span className="ml-2 text-green-600 font-medium text-xs">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-3">
                    Created: {new Date(question.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
