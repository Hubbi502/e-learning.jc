export interface Exam {
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

export interface ExamFormData {
  name: string;
  exam_code: string;
  category: 'Gengo' | 'Bunka';
  duration: number;
  start_time: string;
  end_time: string;
}

export type SortField = 'category' | 'start_time' | 'status' | 'participants';
export type ViewMode = 'cards' | 'table';
export type SortDirection = 'asc' | 'desc';
