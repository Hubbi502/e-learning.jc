import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

interface UpdateViolationsData {
  studentId: string;
  violations: number;
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, violations }: UpdateViolationsData = await request.json();

    // Validasi input
    if (!studentId || violations === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Student ID and violations count are required" 
        },
        { status: 400 }
      );
    }

    // Cek student
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Student not found" 
        },
        { status: 404 }
      );
    }

    if (student.is_submitted) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Cannot update violations for submitted exam" 
        },
        { status: 400 }
      );
    }

    // Update violations count
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        violations: violations
      }
    });

    return NextResponse.json({
      success: true,
      message: "Violations updated successfully",
      data: {
        violations: updatedStudent.violations
      }
    });

  } catch (error) {
    console.error("Update violations error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
