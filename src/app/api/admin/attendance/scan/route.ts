import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

// POST: record attendance when a QR is scanned. Body: { student_id, meeting_id, status, scanned_admin_id }
export async function POST(request: NextRequest) {
  try {
    const { student_id, meeting_id, status, scanned_admin_id } = await request.json();

    if (!student_id || !meeting_id || !status || !scanned_admin_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure meeting exists
    const meeting = await prisma.meeting.findUnique({ where: { id: meeting_id } });
    if (!meeting) return NextResponse.json({ success: false, message: 'Meeting not found' }, { status: 404 });

    // Upsert attendance for student/date/meeting to prevent duplicates
    const dateOnly = new Date().toISOString();

    const attendance = await prisma.attendance.upsert({
      where: { id: undefined as any }, // force fallback to create; unique constraint is student_id+date but Prisma upsert needs unique field — we'll try create and catch duplicate error
      create: {
        student_id,
        meeting_id,
        status,
        recorded_at: new Date(),
        scanned_admin_id,
      },
      update: {
        status,
        scanned_admin_id,
        updated_at: new Date(),
      }
    }).catch(async (err) => {
      // Fallback: create may fail if unique constraint exists; try find then update
      const existing = await prisma.attendance.findFirst({ where: { student_id, meeting_id } });
      if (existing) {
        return prisma.attendance.update({ where: { id: existing.id }, data: { status, scanned_admin_id, updated_at: new Date() } });
      }
      throw err;
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Record attendance error:', error);
    return NextResponse.json({ success: false, message: 'Failed to record attendance' }, { status: 500 });
  }
}
