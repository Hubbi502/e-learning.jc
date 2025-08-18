import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category } from "@prisma/client";
import { generateExamCode } from "@/utils/examCodeGenerator";

// GET single exam
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            scores: true
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Exam not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      exam
    });

  } catch (error) {
    console.error("Get exam error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch exam" 
      },
      { status: 500 }
    );
  }
}

// PUT update exam
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      category,
      duration,
      start_time,
      end_time
    } = body;

    // Check if exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id }
    });

    if (!existingExam) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Exam not found" 
        },
        { status: 404 }
      );
    }

    // Basic validation
    if (!category || !duration) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Category and duration are required" 
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(Category).includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid category" 
        },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration < 1 || duration > 180) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Duration must be between 1 and 180 minutes" 
        },
        { status: 400 }
      );
    }

    // Validate times if provided
    if (start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { 
            success: false, 
            message: "End time must be after start time" 
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      category,
      duration
    };

    // If category changed, generate new exam code
    if (existingExam.category !== category) {
      updateData.exam_code = await generateExamCode(category);
    }

    if (start_time) {
      updateData.start_time = new Date(start_time);
    }

    if (end_time) {
      updateData.end_time = new Date(end_time);
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            scores: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
      exam
    });

  } catch (error) {
    console.error("Update exam error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update exam" 
      },
      { status: 500 }
    );
  }
}

// DELETE exam
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id }
    });

    if (!existingExam) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Exam not found" 
        },
        { status: 404 }
      );
    }

    // Delete exam (this will cascade delete related scores)
    await prisma.exam.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully"
    });

  } catch (error) {
    console.error("Delete exam error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete exam" 
      },
      { status: 500 }
    );
  }
}
