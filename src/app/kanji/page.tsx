'use client';

import React, { useState, useEffect } from 'react';
import { KanjiCard } from '@/components/kanji/KanjiCard';
import { KanjiDetailModal } from '@/components/kanji/KanjiDetailModal';
import { KanjiService } from '@/service/kanji/kanjiService';
import { KanjiData } from '@/types/kanji';

export default function KanjiLearningPage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [kanjiList, setKanjiList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<KanjiData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredKanji, setFilteredKanji] = useState<string[]>([]);

  // Load kanji by grade
  useEffect(() => {
    const loadKanji = async () => {
      setLoading(true);
      try {
        const kanji = await KanjiService.getKanjiByGrade(selectedGrade);
        setKanjiList(kanji);
        setFilteredKanji(kanji);
      } catch (error) {
        console.error('Error loading kanji:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKanji();
  }, [selectedGrade]);

  // Filter kanji based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredKanji(kanjiList);
    } else {
      const filtered = kanjiList.filter(k => k.includes(searchQuery));
      setFilteredKanji(filtered);
    }
  }, [searchQuery, kanjiList]);

  const handleKanjiSelect = async (kanji: string) => {
    try {
      const data = await KanjiService.getKanji(kanji);
      setSelectedKanji(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading kanji details:', error);
    }
  };

  const grades = [
    { value: 1, label: 'Grade 1 (80 kanji)' },
    { value: 2, label: 'Grade 2 (160 kanji)' },
    { value: 3, label: 'Grade 3 (200 kanji)' },
    { value: 4, label: 'Grade 4 (202 kanji)' },
    { value: 5, label: 'Grade 5 (193 kanji)' },
    { value: 6, label: 'Grade 6 (191 kanji)' },
    { value: 8, label: 'Secondary (1130 kanji)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🇯🇵 Pusat Belajar Kanji
              </h1>
              <p className="text-gray-600 mt-1">
                Belajar Kanji Jepang Berdasarkan Tingkat Grade
              </p>
            </div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tingkat Grade
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {grades.map((grade) => (
                  <button
                    key={grade.value}
                    onClick={() => setSelectedGrade(grade.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedGrade === grade.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Grade {grade.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Kanji
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik karakter kanji..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Menampilkan {filteredKanji.length} kanji</strong> dari Grade{' '}
                {selectedGrade}. Klik kartu kanji untuk melihat informasi detail.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading kanji...</p>
            </div>
          </div>
        )}

        {/* Kanji Grid */}
        {!loading && filteredKanji.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredKanji.slice(0, 100).map((kanji, index) => (
              <KanjiCard key={index} kanji={kanji} onSelect={handleKanjiSelect} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredKanji.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Kanji Found
            </h3>
            <p className="text-gray-500">
              Try selecting a different grade or adjusting your search.
            </p>
          </div>
        )}

        {/* Show more button */}
        {!loading && filteredKanji.length > 100 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Showing 100 of {filteredKanji.length} kanji. Scroll down to load more.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <KanjiDetailModal
        kanji={selectedKanji}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
