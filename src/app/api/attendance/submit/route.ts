import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

export async function POST(request: NextRequest) {
  try {
    const { meeting_id, name, class: className } = await request.json();

    // Validasi input
    if (!meeting_id || !name || !className) {
      return NextResponse.json(
        { success: false, message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Cek apakah meeting ada
    const meeting = await prisma.meeting.findUnique({
      where: { id: meeting_id }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: "Meeting tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cari atau buat student
    let student = await prisma.student.findFirst({
      where: {
        name: name.trim(),
        class: className.trim()
      }
    });

    // Jika student belum ada, buat baru (dengan data minimal)
    if (!student) {
      student = await prisma.student.create({
        data: {
          name: name.trim(),
          class: className.trim(),
          exam_code: '', // Bisa diisi nanti saat ikut ujian
          category: 'Gengo', // Default category
        }
      });
    }

    // Cek apakah sudah absen untuk meeting ini
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        student_id: student.id,
        meeting_id: meeting_id
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: "Anda sudah mengisi absensi untuk meeting ini" },
        { status: 400 }
      );
    }

    // Tentukan status kehadiran berdasarkan waktu
    let status = 'HADIR';
    if (meeting.starts_at) {
      const now = new Date();
      const meetingStart = new Date(meeting.starts_at);
      const diffMinutes = (now.getTime() - meetingStart.getTime()) / (1000 * 60);
      
      if (diffMinutes > 15) {
        status = 'TERLAMBAT';
      }
    }

    // Buat record attendance (tanpa admin_id karena ini self-attendance)
    // Kita perlu membuat admin dummy atau modifikasi schema
    // Untuk sementara, kita ambil admin pertama atau buat logic berbeda
    const firstAdmin = await prisma.adminUser.findFirst();
    
    if (!firstAdmin) {
      return NextResponse.json(
        { success: false, message: "Sistem belum dikonfigurasi dengan benar" },
        { status: 500 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        student_id: student.id,
        meeting_id: meeting_id,
        status: status as any,
        scanned_admin_id: firstAdmin.id, // Menggunakan admin pertama sebagai placeholder
        date: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dicatat",
      attendance: {
        id: attendance.id,
        student_name: student.name,
        class: student.class,
        status: attendance.status,
        recorded_at: attendance.recorded_at
      }
    });

  } catch (error: any) {
    console.error("Submit attendance error:", error);
    
    // Handle unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: "Anda sudah mengisi absensi hari ini" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Gagal mencatat absensi" },
      { status: 500 }
    );
  }
}
