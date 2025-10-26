import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetingId = id;

    const attendances = await prisma.attendance.findMany({
      where: { meeting_id: meetingId },
      include: {
        student: {
          select: {
            name: true,
            class: true
          }
        }
      },
      orderBy: {
        recorded_at: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      attendances 
    });
  } catch (error) {
    console.error("Get attendances error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data kehadiran" },
      { status: 500 }
    );
  }
}
