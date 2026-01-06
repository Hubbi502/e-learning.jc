import { KanjiData } from '@/types/kanji';

const BASE_URL = 'https://kanjiapi.dev/v1';

export class KanjiService {
  /**
   * Get a specific kanji by character
   */
  static async getKanji(character: string): Promise<KanjiData> {
    try {
      const response = await fetch(`${BASE_URL}/kanji/${encodeURIComponent(character)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch kanji: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching kanji:', error);
      throw error;
    }
  }

  /**
   * Get all kanji by grade (1-6 for elementary school, 8 for remaining jouyou)
   */
  static async getKanjiByGrade(grade: number): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/kanji/grade-${grade}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch kanji by grade: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching kanji by grade:', error);
      throw error;
    }
  }

  /**
   * Get all kanji by JLPT level (5 is easiest, 1 is hardest)
   */
  static async getKanjiByJLPT(level: number): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/kanji/joyo`);
      if (!response.ok) {
        throw new Error(`Failed to fetch kanji: ${response.statusText}`);
      }
      const allKanji: string[] = await response.json();
      
      // Filter by JLPT level
      const kanjiDetails = await Promise.all(
        allKanji.slice(0, 50).map(k => this.getKanji(k).catch(() => null))
      );
      
      return kanjiDetails
        .filter(k => k && k.jlpt === level)
        .map(k => k!.kanji);
    } catch (error) {
      console.error('Error fetching kanji by JLPT:', error);
      throw error;
    }
  }

  /**
   * Get all joyo kanji (常用漢字)
   */
  static async getJoyoKanji(): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/kanji/joyo`);
      if (!response.ok) {
        throw new Error(`Failed to fetch joyo kanji: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching joyo kanji:', error);
      throw error;
    }
  }

  /**
   * Search kanji by reading (hiragana or katakana)
   */
  static async searchByReading(reading: string): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/reading/${encodeURIComponent(reading)}`);
      if (!response.ok) {
        throw new Error(`Failed to search by reading: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching by reading:', error);
      throw error;
    }
  }
}
