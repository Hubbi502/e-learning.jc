import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

// GET: Get single attendance record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            name: true,
            class: true
          }
        },
        meeting: {
          select: {
            title: true,
            starts_at: true,
            ends_at: true
          }
        }
      }
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance record" },
      { status: 500 }
    );
  }
}

// PATCH: Update attendance record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, name, class: className } = await request.json();

    // Check if attendance exists
    const existing = await prisma.attendance.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Update student info if provided
    if (name || className) {
      await prisma.student.update({
        where: { id: existing.student_id },
        data: {
          ...(name && { name: name.trim() }),
          ...(className && { class: className.trim() })
        }
      });
    }

    // Update attendance status if provided
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status })
      },
      include: {
        student: {
          select: {
            name: true,
            class: true
          }
        },
        meeting: {
          select: {
            title: true,
            starts_at: true,
            ends_at: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update attendance record" },
      { status: 500 }
    );
  }
}

// DELETE: Delete single attendance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    await prisma.attendance.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Attendance deleted successfully"
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete attendance record" },
      { status: 500 }
    );
  }
}
