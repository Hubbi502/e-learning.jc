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

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error("Get meeting error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data meeting" },
      { status: 500 }
    );
  }
}
