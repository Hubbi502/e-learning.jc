import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetingId = id;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: "Meeting tidak ditemukan" },
        { status: 404 }
      );
    }

    // ===== CEK STATUS MEETING =====
    const now = new Date();
    let meetingStatus = {
      is_active: meeting.is_active,
      is_ended: false,
      message: ""
    };

    // Auto-disable jika sudah lewat ends_at
    if (meeting.ends_at && now > new Date(meeting.ends_at)) {
      meetingStatus.is_ended = true;
      meetingStatus.message = "Meeting telah berakhir";
      
      // Update status di database jika masih aktif
      if (meeting.is_active) {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { is_active: false }
        });
        meetingStatus.is_active = false;
      }
    }

    // Cek apakah meeting belum dimulai
    if (meeting.starts_at && now < new Date(meeting.starts_at)) {
      meetingStatus.message = "Meeting belum dimulai";
    }

    // Cek apakah meeting di-disable manual
    if (!meeting.is_active && !meetingStatus.is_ended) {
      meetingStatus.message = "Meeting tidak aktif";
    }

    return NextResponse.json({ 
      success: true, 
      meeting: {
        ...meeting,
        status: meetingStatus
      }
    });
  } catch (error) {
    console.error("Get meeting error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data meeting" },
      { status: 500 }
    );
  }
}
