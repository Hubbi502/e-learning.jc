# Question Management Components

This directory contains the separated components for the Question Management feature. The original monolithic `QuestionManagement.tsx` has been split into smaller, reusable components.

## Component Structure

### Core Components

- **`QuestionManagement.tsx`** - Main container component that orchestrates all child components
- **`QuestionFilters.tsx`** - Search and filter controls
- **`ViewToggle.tsx`** - Switch between cards and table view
- **`QuestionTable.tsx`** - Table view with sorting capabilities
- **`QuestionCards.tsx`** - Card view layout
- **`QuestionForm.tsx`** - Modal form for creating/editing questions
- **`Pagination.tsx`** - Pagination controls with items per page selector
- **`EmptyState.tsx`** - Empty state when no questions are found

### Supporting Files

- **`types.ts`** - Shared TypeScript interfaces and types
- **`index.ts`** - Export barrel file for clean imports

## Component Hierarchy

```
QuestionManagement (Container)
├── QuestionFilters
├── ViewToggle
├── Content (Conditional)
│   ├── QuestionTable (Table view)
│   ├── QuestionCards (Cards view)
│   └── EmptyState (No questions)
├── Pagination
└── QuestionForm (Modal)
```

## Key Features

### Separation of Concerns
- Each component has a single responsibility
- Business logic stays in the main container
- UI components are purely presentational

### Type Safety
- Shared types across all components
- Full TypeScript support
- Consistent interfaces

### Reusability
- Components can be used independently
- Clean prop interfaces
- No tight coupling

### Maintainability
- Smaller, focused files
- Easy to test individual components
- Clear component boundaries

## Usage

```tsx
import { QuestionManagement } from './QuestionManagement';

// Use the main component as before
<QuestionManagement />
```

Or import individual components:

```tsx
import { QuestionTable, QuestionCards } from './question';
import type { Question } from './question/types';
```

## Benefits of This Structure

1. **Easier Testing** - Each component can be tested in isolation
2. **Better Performance** - Smaller components can be optimized individually
3. **Code Reuse** - Components can be reused in other parts of the application
4. **Team Collaboration** - Multiple developers can work on different components
5. **Maintenance** - Bugs and features are easier to locate and fix
