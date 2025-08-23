import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category } from "@prisma/client";
import { generateExamCode, validateExamCode } from "@/utils/examCodeGenerator";

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
      name,
      exam_code,
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
    if (!name || !category || !duration) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Name, category and duration are required" 
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

    // Handle exam code
    let finalExamCode: string = existingExam.exam_code;
    
    if (exam_code && exam_code.trim()) {
      // Manual exam code provided
      const trimmedCode = exam_code.trim().toUpperCase();
      
      // Only validate and check uniqueness if the code is different from existing
      if (trimmedCode !== existingExam.exam_code) {
        // Validate format
        if (!validateExamCode(trimmedCode)) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Invalid exam code format. Use GNG-YYYY-XXX for Gengo or BNK-YYYY-XXX for Bunka" 
            },
            { status: 400 }
          );
        }
        
        // Check if exam code already exists
        const codeExists = await prisma.exam.findUnique({
          where: { exam_code: trimmedCode }
        });
        
        if (codeExists) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Exam code already exists. Please choose a different code." 
            },
            { status: 400 }
          );
        }
        
        finalExamCode = trimmedCode;
      }
    } else {
      // If category changed and no manual code provided, generate new one
      if (existingExam.category !== category) {
        finalExamCode = await generateExamCode(category);
      }
    }

    // Validate times if both are provided
    if (start_time && start_time !== 'null' && end_time && end_time !== 'null') {
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
      name,
      exam_code: finalExamCode,
      category,
      duration
    };

    // Only add datetime fields if they are provided and not null
    if (start_time && start_time !== 'null') {
      updateData.start_time = new Date(start_time);
    } else if (start_time === null) {
      updateData.start_time = null;
    }

    if (end_time && end_time !== 'null') {
      updateData.end_time = new Date(end_time);
    } else if (end_time === null) {
      updateData.end_time = null;
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
