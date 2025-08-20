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

    if (!question) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Question not found" 
        },
        { status: 404 }
      );
    }

    // Transform question to include exams information
    const transformedQuestion = {
      ...question,
      exams: question.exam_questions.map(eq => eq.exam),
      category: question.exam_questions[0]?.exam?.category || null
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
    const { exam_ids, question_text, option_a, option_b, option_c, option_d, correct_option } = body;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // Update the question using transaction
    const question = await prisma.$transaction(async (tx) => {
      // Update question basic data
      const updatedQuestion = await tx.question.update({
        where: { id },
        data: {
          question_text: question_text?.trim(),
          option_a: option_a?.trim(),
          option_b: option_b?.trim(),
          option_c: option_c?.trim(),
          option_d: option_d?.trim(),
          correct_option
        }
      });

      // Update exam relationships if exam_ids provided
      if (exam_ids !== undefined) {
        // Delete existing exam relationships
        await tx.examQuestion.deleteMany({
          where: { question_id: id }
        });

        // Create new exam relationships
        if (exam_ids && exam_ids.length > 0) {
          await tx.examQuestion.createMany({
            data: exam_ids.map((exam_id: string) => ({
              exam_id,
              question_id: id
            }))
          });
        }
      }

      // Return question with relationships
      return await tx.question.findUnique({
        where: { id },
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
    });

    // Transform result to include exams information
    const transformedQuestion = {
      ...question,
      exams: question?.exam_questions.map(eq => eq.exam) || [],
      category: question?.exam_questions[0]?.exam?.category || null
    };

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
      question: transformedQuestion
    });

  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update question" },
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
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // Delete the question
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
      { success: false, message: "Failed to delete question" },
      { status: 500 }
    );
  }
}
