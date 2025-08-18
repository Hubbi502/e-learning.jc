import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category, Option } from "@prisma/client";

// GET all questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (category) {
      where.question_categories = {
        some: {
          category: category
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
          question_categories: {
            select: {
              id: true,
              category: true,
              created_at: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.question.count({ where })
    ]);

    // Transform questions to include categories array
    const transformedQuestions = questions.map(question => ({
      ...question,
      categories: question.question_categories.map(qc => qc.category)
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
      { 
        success: false, 
        message: "Failed to fetch questions" 
      },
      { status: 500 }
    );
  }
}

// POST create new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categories,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option
    } = body;

    // Basic validation
    if (!categories || !Array.isArray(categories) || categories.length === 0 || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return NextResponse.json(
        { 
          success: false, 
          message: "All fields are required. Categories must be an array with at least one category." 
        },
        { status: 400 }
      );
    }

    // Validate categories
    const validCategories = categories.every(cat => Object.values(Category).includes(cat));
    if (!validCategories) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid category provided" 
        },
        { status: 400 }
      );
    }

    // Check for duplicate categories
    if (new Set(categories).size !== categories.length) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate categories are not allowed" 
        },
        { status: 400 }
      );
    }

    // Validate correct option
    if (!Object.values(Option).includes(correct_option)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid correct option" 
        },
        { status: 400 }
      );
    }

    // Create question with categories in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the question
      const question = await tx.question.create({
        data: {
          question_text: question_text.trim(),
          option_a: option_a.trim(),
          option_b: option_b.trim(),
          option_c: option_c.trim(),
          option_d: option_d.trim(),
          correct_option
        }
      });

      // Create question categories
      await tx.questionCategory.createMany({
        data: categories.map(category => ({
          question_id: question.id,
          category
        }))
      });

      // Return question with categories
      return await tx.question.findUnique({
        where: { id: question.id },
        include: {
          question_categories: {
            select: {
              id: true,
              category: true,
              created_at: true
            }
          }
        }
      });
    });

    // Transform result to include categories array
    const transformedQuestion = {
      ...result,
      categories: result!.question_categories.map(qc => qc.category)
    };

    return NextResponse.json({
      success: true,
      message: "Question created successfully",
      question: transformedQuestion
    });

  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create question" 
      },
      { status: 500 }
    );
  }
}
