import prisma from "@/config/prisma";
import { Category, Prisma } from "@prisma/client";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionFilter,
  GetAllQuestionsOptions,
  GetByCategoryOptions,
  SearchQuestionsOptions,
  ServiceResponse,
  QuestionListResponse,
  QuestionStatistics,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateGetAllOptions,
  validateGetByCategoryOptions,
  validateSearchOptions,
  validateRandomQuestionsParams,
  validateSearchTerm,
  validateId,
  validateMultipleIds,
} from "./question.dto";

const questionService = {
  /**
   * Create a new question
   */
  async create(data: unknown): Promise<ServiceResponse> {
    try {
      // Validate input data
      const validatedData = validateCreateQuestion(data);
      const { categories, ...questionData } = validatedData;
      
      const question = await prisma.question.create({
        data: {
          ...questionData,
          question_categories: {
            create: categories.map(category => ({ category }))
          }
        },
        include: {
          answers: true,
          question_categories: true,
        },
      });
      return { success: true, data: question };
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Get all questions with optional filtering and pagination
   */
  async getAll(options?: unknown): Promise<QuestionListResponse> {
    try {
      // Validate options
      const validatedOptions = validateGetAllOptions(options);
      const { filter, skip = 0, take = 50, orderBy = { created_at: 'desc' }, includeAnswers = false } = validatedOptions || {};
      
      const where: Prisma.QuestionWhereInput = {};
      
      if (filter) {
        if (filter.categories && filter.categories.length > 0) {
          where.question_categories = {
            some: {
              category: {
                in: filter.categories
              }
            }
          };
        }
        if (filter.question_text) {
          where.question_text = {
            contains: filter.question_text,
            mode: 'insensitive',
          };
        }
        if (filter.created_at) {
          where.created_at = filter.created_at;
        }
      }

      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            answers: includeAnswers,
            question_categories: true,
          },
        }),
        prisma.question.count({ where }),
      ]);

      return { 
        success: true, 
        data: questions, 
        pagination: {
          total,
          skip,
          take,
          hasMore: skip + take < total,
        }
      };
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Get a question by ID
   */
  async getById(id: unknown, includeAnswers: boolean = false): Promise<ServiceResponse> {
    try {
      // Validate ID
      const validatedId = validateId(id);
      
      const question = await prisma.question.findUnique({
        where: { id: validatedId },
        include: {
          answers: includeAnswers,
          question_categories: true,
        },
      });

      if (!question) {
        return { success: false, error: "Question not found" };
      }

      return { success: true, data: question };
    } catch (error) {
      console.error("Error fetching question:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Get questions by category
   */
  async getByCategory(category: Category, options?: unknown): Promise<QuestionListResponse> {
    try {
      // Validate options
      const validatedOptions = validateGetByCategoryOptions(options);
      const { skip = 0, take = 50, includeAnswers = false } = validatedOptions || {};
      
      const where = {
        question_categories: {
          some: {
            category: category
          }
        }
      };
      
      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
          include: {
            answers: includeAnswers,
            question_categories: true,
          },
        }),
        prisma.question.count({ where }),
      ]);

      return { 
        success: true, 
        data: questions,
        pagination: {
          total,
          skip,
          take,
          hasMore: skip + take < total,
        }
      };
    } catch (error) {
      console.error("Error fetching questions by category:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Update a question by ID
   */
  async update(id: unknown, data: unknown): Promise<ServiceResponse> {
    try {
      // Validate input data
      const validatedId = validateId(id);
      const validatedData = validateUpdateQuestion(data);
      const { categories, ...questionData } = validatedData;

      // Prepare update data
      const updateData: any = { ...questionData };
      
      // Handle categories update if provided
      if (categories) {
        updateData.question_categories = {
          deleteMany: {},
          create: categories.map(category => ({ category }))
        };
      }

      const question = await prisma.question.update({
        where: { id: validatedId },
        data: updateData,
        include: {
          answers: true,
          question_categories: true,
        },
      });

      return { success: true, data: question };
    } catch (error) {
      console.error("Error updating question:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return { success: false, error: "Question not found" };
        }
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Delete a question by ID
   */
  async delete(id: unknown): Promise<ServiceResponse> {
    try {
      // Validate ID
      const validatedId = validateId(id);
      
      await prisma.question.delete({
        where: { id: validatedId },
      });

      return { success: true, message: "Question deleted successfully" };
    } catch (error) {
      console.error("Error deleting question:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return { success: false, error: "Question not found" };
        }
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Delete multiple questions by IDs
   */
  async deleteMany(ids: unknown): Promise<ServiceResponse> {
    try {
      // Validate IDs
      const validatedIds = validateMultipleIds(ids);
      
      const result = await prisma.question.deleteMany({
        where: {
          id: {
            in: validatedIds,
          },
        },
      });

      return { 
        success: true, 
        message: `${result.count} questions deleted successfully`,
        data: { deletedCount: result.count }
      };
    } catch (error) {
      console.error("Error deleting questions:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Get random questions for an exam
   */
  async getRandomQuestions(params: unknown): Promise<ServiceResponse> {
    try {
      // Validate parameters
      const { categories, count } = validateRandomQuestionsParams(params);
      
      // Build where clause for categories
      const where = categories && categories.length > 0 ? {
        question_categories: {
          some: {
            category: {
              in: categories
            }
          }
        }
      } : {};
      
      // First get the total count of questions in the categories
      const totalQuestions = await prisma.question.count({ where });

      if (totalQuestions < count) {
        return { 
          success: false, 
          error: `Not enough questions available. Requested: ${count}, Available: ${totalQuestions}` 
        };
      }

      // Get random questions using a more efficient approach
      // Since PostgreSQL raw query is complex with the many-to-many relationship,
      // we'll use a simpler approach: get all matching questions and randomize in memory
      const allQuestions = await prisma.question.findMany({
        where,
        include: {
          question_categories: true,
        },
      });

      // Randomize and take the required count
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const randomQuestions = shuffled.slice(0, count);

      return { success: true, data: randomQuestions };
    } catch (error) {
      console.error("Error fetching random questions:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Get question statistics
   */
  async getStatistics(): Promise<ServiceResponse<QuestionStatistics>> {
    try {
      const [totalQuestions, gengoCount, bunkaCount] = await Promise.all([
        prisma.question.count(),
        prisma.question.count({ 
          where: { 
            question_categories: {
              some: {
                category: Category.Gengo
              }
            }
          } 
        }),
        prisma.question.count({ 
          where: { 
            question_categories: {
              some: {
                category: Category.Bunka
              }
            }
          } 
        }),
      ]);

      return {
        success: true,
        data: {
          total: totalQuestions,
          byCategory: {
            Gengo: gengoCount,
            Bunka: bunkaCount,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching question statistics:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },

  /**
   * Search questions by text content
   */
  async searchQuestions(searchTerm: unknown, options?: unknown): Promise<QuestionListResponse> {
    try {
      // Validate search term and options
      const validatedSearchTerm = validateSearchTerm(searchTerm);
      const validatedOptions = validateSearchOptions(options);
      const { category, skip = 0, take = 50 } = validatedOptions || {};
      
      const where: Prisma.QuestionWhereInput = {
        OR: [
          {
            question_text: {
              contains: validatedSearchTerm,
              mode: 'insensitive',
            },
          },
          {
            option_a: {
              contains: validatedSearchTerm,
              mode: 'insensitive',
            },
          },
          {
            option_b: {
              contains: validatedSearchTerm,
              mode: 'insensitive',
            },
          },
          {
            option_c: {
              contains: validatedSearchTerm,
              mode: 'insensitive',
            },
          },
          {
            option_d: {
              contains: validatedSearchTerm,
              mode: 'insensitive',
            },
          },
        ],
      };

      if (category) {
        where.question_categories = {
          some: {
            category: category
          }
        };
      }

      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
          include: {
            question_categories: true,
          },
        }),
        prisma.question.count({ where }),
      ]);

      return {
        success: true,
        data: questions,
        pagination: {
          total,
          skip,
          take,
          hasMore: skip + take < total,
        },
      };
    } catch (error) {
      console.error("Error searching questions:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },
};

export default questionService;