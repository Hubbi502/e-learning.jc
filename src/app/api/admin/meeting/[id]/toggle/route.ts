import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetingId = id;
    const { is_active } = await request.json();

    // Cek apakah meeting ada
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: "Meeting tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update status
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { 
        is_active: is_active,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Meeting berhasil ${is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      meeting: updatedMeeting
    });
  } catch (error) {
    console.error("Toggle meeting status error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengubah status meeting" },
      { status: 500 }
    );
  }
}
