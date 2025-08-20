// Japanese-inspired theme constants for admin components

export const japaneseTheme = {
  // Color schemes
  colors: {
    primary: {
      gradient: 'from-slate-900 via-indigo-900 to-slate-900',
      solid: 'bg-slate-900',
      light: 'bg-slate-100',
      text: 'text-slate-900'
    },
    secondary: {
      gradient: 'from-indigo-500 to-purple-600',
      solid: 'bg-indigo-600',
      light: 'bg-indigo-50',
      text: 'text-indigo-700'
    },
    accent: {
      gradient: 'from-yellow-400 to-amber-500',
      solid: 'bg-yellow-400',
      light: 'bg-yellow-50',
      text: 'text-yellow-700'
    },
    success: {
      gradient: 'from-emerald-500 to-teal-600',
      solid: 'bg-emerald-500',
      light: 'bg-emerald-50',
      text: 'text-emerald-700'
    },
    warning: {
      gradient: 'from-amber-500 to-orange-600',
      solid: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-700'
    },
    danger: {
      gradient: 'from-red-500 to-red-600',
      solid: 'bg-red-500',
      light: 'bg-red-50',
      text: 'text-red-700'
    }
  },

  // Background styles
  backgrounds: {
    main: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    card: 'bg-white/80 backdrop-blur-sm',
    cardHover: 'hover:shadow-2xl hover:transform hover:scale-[1.02]',
    sidebar: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
  },

  // Border and shadow styles
  effects: {
    border: 'border border-slate-200/50',
    borderHover: 'hover:border-indigo-200',
    shadow: 'shadow-xl',
    shadowHover: 'hover:shadow-2xl',
    rounded: 'rounded-2xl',
    transition: 'transition-all duration-300'
  },

  // Button styles
  buttons: {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
    secondary: 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 hover:from-slate-300 hover:to-slate-400 transition-all duration-300',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300'
  },

  // Typography
  typography: {
    heading: 'font-bold text-slate-900 tracking-tight',
    subheading: 'font-semibold text-slate-700 tracking-wide',
    body: 'text-slate-600',
    caption: 'text-slate-500 text-sm font-medium'
  },

  // Animation classes
  animations: {
    fadeIn: 'animate-in fade-in duration-300',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-300'
  }
};

// Japanese text translations
export const japaneseText = {
  // Common actions
  add: { jp: '追加', en: 'Add' },
  edit: { jp: '編集', en: 'Edit' },
  delete: { jp: '削除', en: 'Delete' },
  save: { jp: '保存', en: 'Save' },
  cancel: { jp: 'キャンセル', en: 'Cancel' },
  search: { jp: '検索', en: 'Search' },
  filter: { jp: 'フィルター', en: 'Filter' },
  view: { jp: '表示', en: 'View' },
  
  // Navigation
  overview: { jp: '概要', en: 'Overview' },
  questions: { jp: '質問', en: 'Questions' },
  exams: { jp: '試験', en: 'Exams' },
  students: { jp: '学生', en: 'Students' },
  
  // Status
  active: { jp: 'アクティブ', en: 'Active' },
  inactive: { jp: '非アクティブ', en: 'Inactive' },
  loading: { jp: '読み込み中', en: 'Loading' },
  
  // Messages
  noData: { jp: 'データがありません', en: 'No data available' },
  success: { jp: '成功', en: 'Success' },
  error: { jp: 'エラー', en: 'Error' },
  
  // Admin specific
  administrator: { jp: '管理者', en: 'Administrator' },
  adminPanel: { jp: '管理パネル', en: 'Admin Panel' },
  quickActions: { jp: 'クイックアクション', en: 'Quick Actions' },
  recentActivity: { jp: '最近の活動', en: 'Recent Activity' },
  topStudents: { jp: '優秀な学生', en: 'Top Students' }
};

// Utility functions for consistent styling
export const getCardClasses = (variant: 'default' | 'primary' | 'secondary' = 'default') => {
  const base = `${japaneseTheme.backgrounds.card} ${japaneseTheme.effects.rounded} ${japaneseTheme.effects.shadow} ${japaneseTheme.effects.border} ${japaneseTheme.effects.transition} `;
  
  switch (variant) {
    case 'primary':
      return `${base} border-indigo-200/50`;
    case 'secondary':
      return `${base} border-slate-200/50`;
    default:
      return base;
  }
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' = 'primary') => {
  const base = `px-4 py-2 rounded-xl font-medium ${japaneseTheme.effects.transition}`;
  return `${base} ${japaneseTheme.buttons[variant]}`;
};

export const getIconButtonClasses = (variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' = 'ghost') => {
  const base = `p-2 rounded-lg ${japaneseTheme.effects.transition}`;
  return `${base} ${japaneseTheme.buttons[variant]}`;
};
