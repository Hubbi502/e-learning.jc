// Types for KanjiAPI.dev response
export interface KanjiMeaning {
  glossary: string[];
}

export interface KanjiReading {
  reading: string;
  primary: boolean;
}

export interface KanjiKunyomi {
  hiragana: string;
  romaji: string;
}

export interface KanjiOnyomi {
  katakana: string;
  romaji: string;
}

export interface KanjiData {
  kanji: string;
  grade: number;
  stroke_count: number;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  jlpt: number | null;
  unicode: string;
  heisig_en?: string;
}

export interface KanjiSearchParams {
  grade?: number;
  jlpt?: number;
  stroke?: number;
}
