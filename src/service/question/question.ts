import prisma from "@/config/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionFilter,
  GetAllQuestionsOptions,
  SearchQuestionsOptions,
  ServiceResponse,
  QuestionListResponse,
  QuestionStatistics,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateGetAllOptions,
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
      const { exam_id, exam_ids, question_text, option_a, option_b, option_c, option_d, correct_option } = validatedData;

      // Create the question
      const question = await prisma.question.create({
        data: {
          question_text: question_text.trim(),
          option_a: option_a.trim(),
          option_b: option_b.trim(),
          option_c: option_c.trim(),
          option_d: option_d.trim(),
          correct_option,
        },
        include: {
          exam_questions: {
            include: {
              exam: {
                select: {
                  id: true,
                  name: true,
                  exam_code: true,
                  category: true
                }
              }
            }
          }
        }
      });

      // Handle exam relationships - prioritize exam_ids over exam_id
      const examIdsToLink = exam_ids || (exam_id ? [exam_id] : []);
      
      if (examIdsToLink.length > 0) {
        await prisma.examQuestion.createMany({
          data: examIdsToLink.map(examId => ({
            exam_id: examId,
            question_id: question.id
          }))
        });
      }

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
        if (filter.exam_id) {
          where.exam_questions = {
            some: {
              exam_id: filter.exam_id
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
            exam_questions: {
              include: {
                exam: {
                  select: {
                    id: true,
                    name: true,
                    exam_code: true,
                    category: true
                  }
                }
              }
            }
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
          exam_questions: {
            include: {
              exam: {
                select: {
                  id: true,
                  name: true,
                  exam_code: true,
                  category: true
                }
              }
            }
          }
        },
      });

      if (!question) {
        return { success: false, error: "Question not found" };
      }

      return { success: true, data: question };
    } catch (error) {
      console.error("Error fetching question by ID:", error);
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
      // Validate ID and update data
      const validatedId = validateId(id);
      const validatedData = validateUpdateQuestion(data);
      
      // Extract exam IDs before updating the question
      const { exam_id, exam_ids, ...questionData } = validatedData;

      // Update the question
      const question = await prisma.question.update({
        where: { id: validatedId },
        data: questionData,
        include: {
          exam_questions: {
            include: {
              exam: {
                select: {
                  id: true,
                  name: true,
                  exam_code: true,
                  category: true
                }
              }
            }
          }
        }
      });

      // Handle exam relationships if provided
      const examIdsToLink = exam_ids || (exam_id ? [exam_id] : null);
      
      if (examIdsToLink !== null) {
        // Remove existing exam relationships
        await prisma.examQuestion.deleteMany({
          where: { question_id: validatedId }
        });

        // Add new exam relationships
        if (examIdsToLink.length > 0) {
          await prisma.examQuestion.createMany({
            data: examIdsToLink.map(examId => ({
              exam_id: examId,
              question_id: validatedId
            }))
          });
        }
      }

      // Fetch updated question with relationships
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: validatedId },
        include: {
          exam_questions: {
            include: {
              exam: {
                select: {
                  id: true,
                  name: true,
                  exam_code: true,
                  category: true
                }
              }
            }
          }
        }
      });

      return { success: true, data: updatedQuestion };
    } catch (error) {
      console.error("Error updating question:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return { success: false, error: "Question not found" };
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
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return { success: false, error: "Question not found" };
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
            in: validatedIds
          }
        }
      });

      return { 
        success: true, 
        message: `Successfully deleted ${result.count} question(s)`,
        data: { deletedCount: result.count }
      };
    } catch (error) {
      console.error("Error deleting multiple questions:", error);
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
      const { exam_id, count } = validateRandomQuestionsParams(params);
      
      // Build where clause for exam
      const where: Prisma.QuestionWhereInput = exam_id ? {
        exam_questions: {
          some: {
            exam_id: exam_id
          }
        }
      } : {};
      
      // First get the total count of questions in the exam
      const totalQuestions = await prisma.question.count({ where });

      if (totalQuestions < count) {
        return { 
          success: false, 
          error: `Not enough questions available. Requested: ${count}, Available: ${totalQuestions}` 
        };
      }

      // Get random questions using a more efficient approach
      const allQuestions = await prisma.question.findMany({
        where,
        include: {
          exam_questions: {
            include: {
              exam: {
                select: {
                  id: true,
                  name: true,
                  exam_code: true,
                  category: true
                }
              }
            }
          }
        },
      });

      // Shuffle the array and take the requested count
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const randomQuestions = shuffled.slice(0, count);

      return { success: true, data: randomQuestions };
    } catch (error) {
      console.error("Error getting random questions:", error);
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
      const totalQuestions = await prisma.question.count();

      // Get count by exam through ExamQuestion table
      const examQuestions = await prisma.examQuestion.findMany({
        include: {
          exam: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const byExam: Record<string, number> = {};
      for (const examQuestion of examQuestions) {
        const examId = examQuestion.exam_id;
        byExam[examId] = (byExam[examId] || 0) + 1;
      }

      // Get questions without any exam relationship
      const questionsWithExam = await prisma.question.count({
        where: {
          exam_questions: {
            some: {}
          }
        }
      });

      const questionsWithoutExam = totalQuestions - questionsWithExam;
      if (questionsWithoutExam > 0) {
        byExam['standalone'] = questionsWithoutExam;
      }

      return {
        success: true,
        data: {
          total: totalQuestions,
          byExam,
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
      const { exam_id, skip = 0, take = 50 } = validatedOptions || {};
      
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

      if (exam_id) {
        where.exam_questions = {
          some: {
            exam_id: exam_id
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
            exam_questions: {
              include: {
                exam: {
                  select: {
                    id: true,
                    name: true,
                    exam_code: true,
                    category: true
                  }
                }
              }
            }
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
