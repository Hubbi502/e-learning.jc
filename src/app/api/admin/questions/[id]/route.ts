import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category, Option } from "@prisma/client";

// GET single question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
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

    if (!question) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Question not found" 
        },
        { status: 404 }
      );
    }

    // Transform question to include categories array
    const transformedQuestion = {
      ...question,
      categories: question.question_categories.map(qc => qc.category)
    };

    return NextResponse.json({
      success: true,
      question: transformedQuestion
    });

  } catch (error) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch question" 
      },
      { status: 500 }
    );
  }
}

// PUT update question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Question not found" 
        },
        { status: 404 }
      );
    }

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

    // Update question with categories in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the question
      const updatedQuestion = await tx.question.update({
        where: { id },
        data: {
          question_text: question_text.trim(),
          option_a: option_a.trim(),
          option_b: option_b.trim(),
          option_c: option_c.trim(),
          option_d: option_d.trim(),
          correct_option
        }
      });

      // Delete existing question categories
      await tx.questionCategory.deleteMany({
        where: { question_id: id }
      });

      // Create new question categories
      await tx.questionCategory.createMany({
        data: categories.map(category => ({
          question_id: id,
          category
        }))
      });

      // Return question with categories
      return await tx.question.findUnique({
        where: { id },
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
      message: "Question updated successfully",
      question: transformedQuestion
    });

  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update question" 
      },
      { status: 500 }
    );
  }
}

// DELETE question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Question not found" 
        },
        { status: 404 }
      );
    }

    // Delete question (this will cascade delete related answers)
    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully"
    });

  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete question" 
      },
      { status: 500 }
    );
  }
}
