import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    // Validasi category
    if (!Object.values(Category).includes(category as Category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid category. Must be 'Gengo' or 'Bunka'" 
        },
        { status: 400 }
      );
    }

    // Get questions for the specific category
    const questions = await prisma.question.findMany({
      where: {
        question_categories: {
          some: {
            category: category as Category
          }
        }
      },
      select: {
        id: true,
        question_text: true,
        option_a: true,
        option_b: true,
        option_c: true,
        option_d: true,
        // Don't include correct_option for security
        question_categories: {
          select: {
            category: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `No questions found for category: ${category}` 
        },
        { status: 404 }
      );
    }

    // Transform questions to match frontend format
    const transformedQuestions = questions.map((question, index) => ({
      id: question.id,
      questionNumber: index + 1,
      question_text: question.question_text,
      options: [
        { id: "A", text: question.option_a },
        { id: "B", text: question.option_b },
        { id: "C", text: question.option_c },
        { id: "D", text: question.option_d }
      ],
      categories: question.question_categories.map(qc => qc.category)
    }));

    return NextResponse.json({
      success: true,
      questions: transformedQuestions,
      total: questions.length,
      category
    });

  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
