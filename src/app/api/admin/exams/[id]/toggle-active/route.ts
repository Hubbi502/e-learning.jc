import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

// PATCH toggle exam active status
export async function PATCH(
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

    // Toggle the active status
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        is_active: !existingExam.is_active
      },
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
      message: `Exam ${exam.is_active ? 'activated' : 'deactivated'} successfully`,
      exam
    });

  } catch (error) {
    console.error("Toggle exam active error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to toggle exam status" 
      },
      { status: 500 }
    );
  }
}
