"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Play, Pause, Users, Grid, List, ChevronUp, ChevronDown } from 'lucide-react';

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

interface ExamFormData {
  name: string;
  exam_code: string;
  category: 'Gengo' | 'Bunka';
  duration: number;
  start_time: string;
  end_time: string;
}

export function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'category' | 'start_time' | 'status' | 'participants'>('start_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState<ExamFormData>({
    name: '',
    exam_code: '',
    category: 'Gengo',
    duration: 60,
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExam 
        ? `/api/admin/exams/${editingExam.id}`
        : '/api/admin/exams';
      
      const method = editingExam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchExams();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save exam');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to save exam');
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      exam_code: exam.exam_code,
      category: exam.category,
      duration: exam.duration,
      start_time: exam.start_time ? exam.start_time.slice(0, 16) : '',
      end_time: exam.end_time ? exam.end_time.slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? This will also delete all associated scores.')) return;

    try {
      const response = await fetch(`/api/admin/exams/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExams();
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
    }
  };

  const handleToggleActive = async (exam: Exam) => {
    try {
      const response = await fetch(`/api/admin/exams/${exam.id}/toggle-active`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await fetchExams();
      } else {
        alert('Failed to toggle exam status');
      }
    } catch (error) {
      console.error('Error toggling exam status:', error);
      alert('Failed to toggle exam status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      exam_code: '',
      category: 'Gengo',
      duration: 60,
      start_time: '',
      end_time: ''
    });
    setEditingExam(null);
    setShowForm(false);
  };

  const getExamStatus = (exam: Exam) => {
    if (!exam.start_time || !exam.end_time) return 'Draft';
    
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);
    
    if (now < startTime) return 'Scheduled';
    if (now >= startTime && now <= endTime && exam.is_active) return 'Active';
    if (now > endTime) return 'Completed';
    return 'Inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExams = exams.filter(exam => {
    return exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           exam.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           exam.exam_code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExams = [...filteredExams].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'start_time':
        const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
        comparison = aTime - bTime;
        break;
      case 'status':
        const aStatus = getExamStatus(a);
        const bStatus = getExamStatus(b);
        comparison = aStatus.localeCompare(bStatus);
        break;
      case 'participants':
        const aCount = a._count?.scores || 0;
        const bCount = b._count?.scores || 0;
        comparison = aCount - bCount;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm sm:text-base text-gray-500">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Exam Management</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          Create Exam
        </button>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search exams by category or exam code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
            />
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

      {/* Exam Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={resetForm}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {editingExam ? 'Edit Exam' : 'Create New Exam'}
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
                    onClick={resetForm}
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
        )}

      {/* Exams Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredExams.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm ? `No exams found matching "${searchTerm}"` : 'No exams found'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
                >
                  Create your first exam
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">
                    Total: {sortedExams.length} exam{sortedExams.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    Active: {sortedExams.filter(exam => getExamStatus(exam) === 'Active').length}
                  </span>
                  <span>
                    Scheduled: {sortedExams.filter(exam => getExamStatus(exam) === 'Scheduled').length}
                  </span>
                  <span>
                    Completed: {sortedExams.filter(exam => getExamStatus(exam) === 'Completed').length}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Exam Details
                        {sortField === 'category' && (
                          sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('start_time')}
                    >
                      <div className="flex items-center">
                        Schedule
                        {sortField === 'start_time' && (
                          sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('participants')}
                    >
                      <div className="flex items-center">
                        Participants
                        {sortField === 'participants' && (
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
                  {sortedExams.map((exam) => {
                    const status = getExamStatus(exam);
                    return (
                      <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm sm:text-base font-medium text-gray-900">
                              {exam.name}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-indigo-600">
                              {exam.exam_code}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {exam.category} • Duration: {exam.duration} minutes
                            </div>
                            {/* Mobile: Show additional info */}
                            <div className="mt-1 sm:hidden space-y-1">
                              {exam.start_time && exam.end_time && (
                                <div className="text-xs text-gray-500">
                                  {new Date(exam.start_time).toLocaleDateString()} - {new Date(exam.end_time).toLocaleDateString()}
                                </div>
                              )}
                              {exam._count && (
                                <div className="text-xs text-blue-600 flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {exam._count.scores} participants
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          {exam.start_time && exam.end_time ? (
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">
                                {new Date(exam.start_time).toLocaleDateString()}
                              </div>
                              <div className="text-gray-500">
                                {new Date(exam.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(exam.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not scheduled</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {exam._count ? (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-blue-600" />
                              {exam._count.scores}
                            </div>
                          ) : (
                            <span>0</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(exam)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                              title="Edit exam"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(exam.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete exam"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {(status === 'Scheduled' || status === 'Active') && (
                              <button
                                onClick={() => handleToggleActive(exam)}
                                className={`p-1 rounded transition-colors ${
                                  exam.is_active
                                    ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                }`}
                                title={exam.is_active ? 'Deactivate exam' : 'Activate exam'}
                              >
                                {exam.is_active ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
          {sortedExams.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium mr-2">Sort by:</span>
                <button
                  onClick={() => handleSort('category')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'category' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('start_time')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'start_time' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Schedule {sortField === 'start_time' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'status' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('participants')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sortField === 'participants' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Participants {sortField === 'participants' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          )}
          
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {sortedExams.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-16">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm ? `No exams found matching "${searchTerm}"` : 'No exams found'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium"
              >
                Create your first exam
              </button>
            )}
          </div>
        ) : (
          sortedExams.map((exam) => {
            const status = getExamStatus(exam);
            return (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      {exam.name}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600 mt-1">
                      {exam.exam_code}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {exam.category} • Duration: {exam.duration} minutes
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>

                {exam.start_time && exam.end_time && (
                  <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Start:</p>
                        <p>{new Date(exam.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">End:</p>
                        <p>{new Date(exam.end_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {exam._count && (
                  <div className="flex items-center text-sm text-gray-600 mb-4 p-2 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700">
                      {exam._count.scores} student{exam._count.scores !== 1 ? 's' : ''} participated
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      title="Edit exam"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete exam"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {(status === 'Scheduled' || status === 'Active') && (
                    <button
                      onClick={() => handleToggleActive(exam)}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 min-w-0 ${
                        exam.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {exam.is_active ? (
                        <>
                          <Pause className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Deactivate</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Activate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        </div>
        </>
      )}
    </div>
  );
}
