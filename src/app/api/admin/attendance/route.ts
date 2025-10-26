import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

// POST: create a new meeting (generates a unique meeting id and returns a qr payload)
export async function POST(request: NextRequest) {
  try {
    const { title, starts_at, ends_at } = await request.json();

    const meeting = await prisma.meeting.create({
      data: {
        title: title || "Pertemuan baru",
        starts_at: starts_at ? new Date(starts_at) : new Date(),
        ends_at: ends_at ? new Date(ends_at) : null,
      }
    });

    // Get base URL from request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate full URL for QR code
    const attendanceUrl = `${baseUrl}/attendance/${meeting.id}`;
    
    return NextResponse.json({ 
      success: true, 
      meeting, 
      qr_payload: attendanceUrl // Now contains full URL instead of just ID
    });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json({ success: false, message: "Failed to create meeting" }, { status: 500 });
  }
}

// GET: list meetings
export async function GET(request: NextRequest) {
  try {
    const meetings = await prisma.meeting.findMany({ 
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { attendances: true }
        }
      }
    });
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error("List meetings error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch meetings" }, { status: 500 });
  }
}
