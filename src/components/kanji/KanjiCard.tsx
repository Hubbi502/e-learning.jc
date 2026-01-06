'use client';

import React, { useState, useEffect } from 'react';
import { KanjiData } from '@/types/kanji';
import { KanjiService } from '@/service/kanji/kanjiService';

interface KanjiCardProps {
  kanji: string;
  onSelect?: (kanji: string) => void;
}

export const KanjiCard: React.FC<KanjiCardProps> = ({ kanji, onSelect }) => {
  const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKanjiData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await KanjiService.getKanji(kanji);
        setKanjiData(data);
      } catch (err) {
        setError('Failed to load kanji data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (kanji) {
      fetchKanjiData();
    }
  }, [kanji]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !kanjiData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center text-red-500">{error || 'No data'}</div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
      onClick={() => onSelect?.(kanji)}
    >
      <div className="text-center">
        <div className="text-6xl font-bold mb-2 text-gray-800">{kanjiData.kanji}</div>
        <div className="text-sm text-gray-500 mb-2">
          Grade: {kanjiData.grade} | Strokes: {kanjiData.stroke_count}
          {kanjiData.jlpt && ` | JLPT: N${kanjiData.jlpt}`}
        </div>
        <div className="text-sm text-blue-600 font-medium">
          {kanjiData.meanings.slice(0, 2).join(', ')}
        </div>
      </div>
    </div>
  );
};
