'use client';

import React from 'react';
import { KanjiData } from '@/types/kanji';

interface KanjiDetailModalProps {
  kanji: KanjiData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const KanjiDetailModal: React.FC<KanjiDetailModalProps> = ({
  kanji,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !kanji) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kanji Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Main Kanji Display */}
          <div className="text-center mb-6">
            <div className="text-8xl font-bold text-gray-800 mb-4">{kanji.kanji}</div>
            <div className="text-lg text-gray-600">
              Unicode: {kanji.unicode}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Grade</div>
              <div className="text-2xl font-bold text-blue-600">{kanji.grade}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Strokes</div>
              <div className="text-2xl font-bold text-green-600">{kanji.stroke_count}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">JLPT</div>
              <div className="text-2xl font-bold text-purple-600">
                {kanji.jlpt ? `N${kanji.jlpt}` : '-'}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Heisig</div>
              <div className="text-lg font-bold text-orange-600">
                {kanji.heisig_en || '-'}
              </div>
            </div>
          </div>

          {/* Meanings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Meanings</h3>
            <div className="flex flex-wrap gap-2">
              {kanji.meanings.map((meaning, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {meaning}
                </span>
              ))}
            </div>
          </div>

          {/* Kun Readings */}
          {kanji.kun_readings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Kun Readings (訓読み)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {kanji.kun_readings.map((reading, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-2 rounded text-lg"
                    >
                      {reading}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* On Readings */}
          {kanji.on_readings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                On Readings (音読み)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {kanji.on_readings.map((reading, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-2 rounded text-lg"
                    >
                      {reading}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Name Readings */}
          {kanji.name_readings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Name Readings (名乗り)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {kanji.name_readings.map((reading, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-3 py-2 rounded text-sm"
                    >
                      {reading}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
