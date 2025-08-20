import { z } from "zod";
import { Category, Option } from "@prisma/client";

// Zod enums for validation
export const CategorySchema = z.nativeEnum(Category);
export const OptionSchema = z.nativeEnum(Option);

// Create Question Validation Schema
export const CreateQuestionSchema = z.object({
  exam_id: z.string().uuid("Invalid exam ID").optional(), // Keep for backward compatibility but won't be used in create
  exam_ids: z.array(z.string().uuid("Invalid exam ID")).optional(), // New field for multiple exams
  question_text: z.string()
    .min(10, "Question text must be at least 10 characters long")
    .max(1000, "Question text must not exceed 1000 characters")
    .trim(),
  option_a: z.string()
    .min(1, "Option A cannot be empty")
    .max(255, "Option A must not exceed 255 characters")
    .trim(),
  option_b: z.string()
    .min(1, "Option B cannot be empty")
    .max(255, "Option B must not exceed 255 characters")
    .trim(),
  option_c: z.string()
    .min(1, "Option C cannot be empty")
    .max(255, "Option C must not exceed 255 characters")
    .trim(),
  option_d: z.string()
    .min(1, "Option D cannot be empty")
    .max(255, "Option D must not exceed 255 characters")
    .trim(),
  correct_option: OptionSchema,
});

// Update Question Validation Schema (all fields optional)
export const UpdateQuestionSchema = z.object({
  exam_id: z.string().uuid("Invalid exam ID").optional(), // Keep for backward compatibility
  exam_ids: z.array(z.string().uuid("Invalid exam ID")).optional(), // New field for multiple exams
  question_text: z.string()
    .min(10, "Question text must be at least 10 characters long")
    .max(1000, "Question text must not exceed 1000 characters")
    .trim()
    .optional(),
  option_a: z.string()
    .min(1, "Option A cannot be empty")
    .max(255, "Option A must not exceed 255 characters")
    .trim()
    .optional(),
  option_b: z.string()
    .min(1, "Option B cannot be empty")
    .max(255, "Option B must not exceed 255 characters")
    .trim()
    .optional(),
  option_c: z.string()
    .min(1, "Option C cannot be empty")
    .max(255, "Option C must not exceed 255 characters")
    .trim()
    .optional(),
  option_d: z.string()
    .min(1, "Option D cannot be empty")
    .max(255, "Option D must not exceed 255 characters")
    .trim()
    .optional(),
  correct_option: OptionSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided for update",
  }
);

// Question Filter Validation Schema
export const QuestionFilterSchema = z.object({
  exam_id: z.string().uuid("Invalid exam ID").optional(),
  question_text: z.string()
    .min(1, "Search text cannot be empty")
    .max(255, "Search text must not exceed 255 characters")
    .trim()
    .optional(),
  created_at: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }).optional(),
}).optional();

// Pagination Schema
export const PaginationSchema = z.object({
  skip: z.number()
    .int("Skip must be an integer")
    .min(0, "Skip must be non-negative")
    .default(0),
  take: z.number()
    .int("Take must be an integer")
    .min(1, "Take must be at least 1")
    .max(100, "Take must not exceed 100")
    .default(50),
});

// Get All Questions Options Schema
export const GetAllQuestionsOptionsSchema = z.object({
  filter: QuestionFilterSchema,
  skip: z.number()
    .int("Skip must be an integer")
    .min(0, "Skip must be non-negative")
    .default(0)
    .optional(),
  take: z.number()
    .int("Take must be an integer")
    .min(1, "Take must be at least 1")
    .max(100, "Take must not exceed 100")
    .default(50)
    .optional(),
  orderBy: z.object({
    created_at: z.enum(['asc', 'desc']).optional(),
    updated_at: z.enum(['asc', 'desc']).optional(),
    question_text: z.enum(['asc', 'desc']).optional(),
  }).optional(),
  includeAnswers: z.boolean().default(false).optional(),
}).optional();

// Get By Category Options Schema
export const GetByCategoryOptionsSchema = z.object({
  skip: z.number()
    .int("Skip must be an integer")
    .min(0, "Skip must be non-negative")
    .default(0)
    .optional(),
  take: z.number()
    .int("Take must be an integer")
    .min(1, "Take must be at least 1")
    .max(100, "Take must not exceed 100")
    .default(50)
    .optional(),
  includeAnswers: z.boolean().default(false).optional(),
}).optional();

// Search Questions Options Schema
export const SearchQuestionsOptionsSchema = z.object({
  exam_id: z.string().uuid("Invalid exam ID").optional(),
  skip: z.number()
    .int("Skip must be an integer")
    .min(0, "Skip must be non-negative")
    .default(0)
    .optional(),
  take: z.number()
    .int("Take must be an integer")
    .min(1, "Take must be at least 1")
    .max(100, "Take must not exceed 100")
    .default(50)
    .optional(),
}).optional();

// Random Questions Schema
export const GetRandomQuestionsSchema = z.object({
  exam_id: z.string().uuid("Invalid exam ID").optional(),
  count: z.number()
    .int("Count must be an integer")
    .min(1, "Count must be at least 1")
    .max(50, "Count must not exceed 50"),
});

// Search Term Schema
export const SearchTermSchema = z.string()
  .min(1, "Search term cannot be empty")
  .max(255, "Search term must not exceed 255 characters")
  .trim();

// ID Validation Schema
export const IdSchema = z.string()
  .uuid("Invalid ID format");

// Multiple IDs Schema
export const MultipleIdsSchema = z.array(
  z.string().uuid("Invalid ID format")
).min(1, "At least one ID must be provided")
.max(50, "Cannot delete more than 50 questions at once");

// Type exports (inferred from Zod schemas)
export type CreateQuestionData = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionData = z.infer<typeof UpdateQuestionSchema>;
export type QuestionFilter = z.infer<typeof QuestionFilterSchema>;
export type GetAllQuestionsOptions = z.infer<typeof GetAllQuestionsOptionsSchema>;
export type GetByCategoryOptions = z.infer<typeof GetByCategoryOptionsSchema>;
export type SearchQuestionsOptions = z.infer<typeof SearchQuestionsOptionsSchema>;
export type GetRandomQuestionsParams = z.infer<typeof GetRandomQuestionsSchema>;

// Question with exam_questions interface (updated to match new schema)
export interface QuestionWithExamQuestions {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: Option;
  created_at: Date;
  updated_at: Date;
  exam_questions?: Array<{
    exam: {
      id: string;
      name: string;
      exam_code: string;
      category: Category;
    };
  }>;
}

// Additional interfaces for service responses
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

export interface QuestionListResponse {
  success: boolean;
  data?: any[];
  pagination?: PaginationInfo;
  error?: string;
}

export interface QuestionStatistics {
  total: number;
  byExam: Record<string, number>;
}

// Validation helper functions
export const validateCreateQuestion = (data: unknown): CreateQuestionData => {
  return CreateQuestionSchema.parse(data);
};

export const validateUpdateQuestion = (data: unknown): UpdateQuestionData => {
  return UpdateQuestionSchema.parse(data);
};

export const validateQuestionFilter = (data: unknown) => {
  return QuestionFilterSchema.parse(data);
};

export const validateGetAllOptions = (data: unknown) => {
  return GetAllQuestionsOptionsSchema.parse(data);
};

export const validateGetByCategoryOptions = (data: unknown) => {
  return GetByCategoryOptionsSchema.parse(data);
};

export const validateSearchOptions = (data: unknown) => {
  return SearchQuestionsOptionsSchema.parse(data);
};

export const validateRandomQuestionsParams = (data: unknown) => {
  return GetRandomQuestionsSchema.parse(data);
};

export const validateSearchTerm = (data: unknown) => {
  return SearchTermSchema.parse(data);
};

export const validateId = (data: unknown) => {
  return IdSchema.parse(data);
};

export const validateMultipleIds = (data: unknown) => {
  return MultipleIdsSchema.parse(data);
};
