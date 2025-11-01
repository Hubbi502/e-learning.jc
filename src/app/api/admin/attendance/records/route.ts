import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

// GET: Get all attendance records with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meeting_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (meetingId) {
      where.meeting_id = meetingId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        {
          student: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            class: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Get total count for pagination
    const total = await prisma.attendance.count({ where });

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where,
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
      },
      orderBy: {
        recorded_at: 'desc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: attendances,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get attendance records error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete attendance records
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No attendance IDs provided" },
        { status: 400 }
      );
    }

    await prisma.attendance.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} attendance record(s) deleted successfully`
    });
  } catch (error) {
    console.error("Delete attendance records error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete attendance records" },
      { status: 500 }
    );
  }
}
