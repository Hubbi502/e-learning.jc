"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, ChevronRight, Search, Filter } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  content: string;
  category: 'Gengo' | 'Bunka';
  description: string | null;
  created_at: string;
  updated_at: string;
  author: {
    email: string;
  };
}

interface MaterialsSectionProps {
  isDark: boolean;
}

export default function MaterialsSection({ isDark }: MaterialsSectionProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Gengo' | 'Bunka'>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      });

      const response = await fetch(`/api/public/materials?${params}`);
      const data = await response.json();

      if (data.success) {
        setMaterials(data.data.materials);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, searchTerm, categoryFilter]);

  const getCategoryColor = (category: string) => {
    return category === 'Gengo' 
      ? isDark 
        ? 'bg-blue-900/50 text-blue-300 border-blue-700'
        : 'bg-blue-100 text-blue-800 border-blue-200'
      : isDark
        ? 'bg-purple-900/50 text-purple-300 border-purple-700'
        : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  if (loading) {
    return (
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
        isDark 
          ? 'bg-gradient-to-b from-slate-800 to-slate-900' 
          : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className={`h-8 w-8 mr-3 ${
              isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <h2 className={`text-3xl md:text-4xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Learning Materials
            </h2>
          </div>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Explore our comprehensive collection of Japanese language and culture materials
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white shadow-sm border border-gray-200'
          }`}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className={`h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'Gengo' | 'Bunka')}
                className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="Gengo">Gengo (Language)</option>
                <option value="Bunka">Bunka (Culture)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {materials.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className={`h-12 w-12 mx-auto mb-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No materials found
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Materials will appear here when they are published'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div
                key={material.id}
                className={`rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
                    : 'bg-white shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300'
                }`}
                onClick={() => setSelectedMaterial(material)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {material.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        getCategoryColor(material.category)
                      }`}>
                        {material.category}
                      </span>
                    </div>
                  </div>

                  {material.description && (
                    <p className={`text-sm mb-4 line-clamp-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {material.description}
                    </p>
                  )}

                  <div className={`flex items-center justify-between text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {material.author.email.split('@')[0]}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(material.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      Read more
                    </span>
                    <ChevronRight className={`h-4 w-4 ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>
              <span className={`px-4 py-2 text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedMaterial.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      getCategoryColor(selectedMaterial.category)
                    }`}>
                      {selectedMaterial.category}
                    </span>
                    <div className={`flex items-center ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <User className="h-3 w-3 mr-1" />
                      {selectedMaterial.author.email.split('@')[0]}
                    </div>
                    <div className={`flex items-center ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(selectedMaterial.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedMaterial.description && (
                <div className="mb-6">
                  <p className={`text-lg ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {selectedMaterial.description}
                  </p>
                </div>
              )}

              <div className={`prose max-w-none ${
                isDark ? 'prose-invert' : ''
              }`}>
                <div className={`whitespace-pre-wrap ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {selectedMaterial.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
