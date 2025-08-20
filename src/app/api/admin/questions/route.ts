import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category, Option } from "@prisma/client";

// GET all questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exam_id = searchParams.get('exam_id');
    const category = searchParams.get('category') as Category | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    // Filter by exam_id if provided
    if (exam_id) {
      where.exam_questions = {
        some: {
          exam_id: exam_id
        }
      };
    }
    
    // Filter by category through exam relationship
    if (category) {
      where.exam_questions = {
        some: {
          exam: {
            category: category
          }
        }
      };
    }
    
    if (search) {
      where.OR = [
        { question_text: { contains: search, mode: 'insensitive' } },
        { option_a: { contains: search, mode: 'insensitive' } },
        { option_b: { contains: search, mode: 'insensitive' } },
        { option_c: { contains: search, mode: 'insensitive' } },
        { option_d: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
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
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.question.count({ where })
    ]);

    // Transform questions to include exams information
    const transformedQuestions = questions.map(question => ({
      ...question,
      exams: question.exam_questions.map(eq => eq.exam),
      // Keep backward compatibility by adding category from first exam
      category: question.exam_questions[0]?.exam?.category || null
    }));

    return NextResponse.json({
      success: true,
      questions: transformedQuestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST create new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exam_ids, question_text, option_a, option_b, option_c, option_d, correct_option } = body;

    // Validate required fields
    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        question_text: question_text.trim(),
        option_a: option_a.trim(),
        option_b: option_b.trim(),
        option_c: option_c.trim(),
        option_d: option_d.trim(),
        correct_option,
        exam_questions: exam_ids && exam_ids.length > 0 ? {
          create: exam_ids.map((exam_id: string) => ({
            exam_id
          }))
        } : undefined
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

    // Transform result to include exams information
    const transformedQuestion = {
      ...question,
      exams: question.exam_questions.map(eq => eq.exam),
      category: question.exam_questions[0]?.exam?.category || null
    };

    return NextResponse.json({
      success: true,
      message: "Question created successfully",
      question: transformedQuestion
    });

  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create question" },
      { status: 500 }
    );
  }
}
