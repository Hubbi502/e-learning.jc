export interface Material {
  id: string;
  title: string;
  content: string;
  category: 'Gengo' | 'Bunka';
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    email: string;
  };
}

export interface MaterialFormData {
  title: string;
  content: string;
  category: 'Gengo' | 'Bunka';
  description: string;
  is_published: boolean;
}

export type SortField = 'title' | 'category' | 'created_at' | 'is_published';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'cards' | 'table';
export type StatusFilter = 'all' | 'published' | 'draft';
