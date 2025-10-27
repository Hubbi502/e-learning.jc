import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { meeting_id, name, class: className, deviceId } = await request.json();

    // Validasi input
    if (!meeting_id || !name || !className || !deviceId) {
      return NextResponse.json(
        { success: false, message: "Semua field harus diisi termasuk deviceId" },
        { status: 400 }
      );
    }

    // ===== VALIDASI COOKIE: Cek apakah device ini sudah absen untuk meeting ini =====
    const cookieStore = await cookies();
    const cookieName = `attendance_${meeting_id}_${deviceId}`;
    const existingCookie = cookieStore.get(cookieName);
    
    if (existingCookie) {
      const cookieData = JSON.parse(existingCookie.value);
      return NextResponse.json(
        { 
          success: false, 
          message: `Device ini sudah digunakan untuk absensi oleh ${cookieData.name} (${cookieData.class})`,
          type: "COOKIE_DUPLICATE",
          previousUser: cookieData
        },
        { status: 409 }
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

    // ===== VALIDASI GANDA: USER DAN DEVICE =====
    // Tentukan rentang waktu untuk "hari ini" (00:00:00 - 23:59:59)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Query untuk mencari absensi yang sudah ada hari ini
    // Menggunakan OR untuk cek user ATAU device
    const existingAttendance: any = await prisma.attendance.findFirst({
      where: {
        OR: [
          {
            // Cek User: apakah user ini sudah absen hari ini?
            student_id: student.id,
            meeting_id: meeting_id,
            recorded_at: {
              gte: startOfToday,
              lte: endOfToday
            }
          },
          {
            // Cek Device: apakah device ini sudah digunakan untuk absen hari ini?
            device_id: deviceId,
            meeting_id: meeting_id,
            recorded_at: {
              gte: startOfToday,
              lte: endOfToday
            }
          }
        ]
      } as any,
      include: {
        student: true
      }
    }) as any;

    // Jika ada record yang cocok, tentukan alasan penolakan
    if (existingAttendance) {
      let errorMessage = "";
      
      // Cek apakah ini user yang sama
      if (existingAttendance.student_id === student.id) {
        errorMessage = "Anda sudah mengisi absensi untuk meeting ini hari ini";
      } 
      // Cek apakah ini device yang sama
      else if (existingAttendance.device_id === deviceId) {
        errorMessage = `Device ini sudah digunakan untuk absensi hari ini oleh ${existingAttendance?.student?.name} (${existingAttendance?.student?.class})`;
      }

      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          type: existingAttendance.student_id === student.id ? "USER_DUPLICATE" : "DEVICE_DUPLICATE"
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Tentukan status kehadiran berdasarkan waktu
    let status = 'HADIR';
    if (meeting.starts_at) {
      const meetingStart = new Date(meeting.starts_at);
      const diffMinutes = (now.getTime() - meetingStart.getTime()) / (1000 * 60);
      
      if (diffMinutes > 15) {
        status = 'TERLAMBAT';
      }
    }

    // Ambil admin pertama sebagai placeholder untuk scanned_admin_id
    const firstAdmin = await prisma.adminUser.findFirst();
    
    if (!firstAdmin) {
      return NextResponse.json(
        { success: false, message: "Sistem belum dikonfigurasi dengan benar" },
        { status: 500 }
      );
    }

    // ===== BUAT RECORD ABSENSI BARU =====
    const attendance = await prisma.attendance.create({
      data: {
        student_id: student.id,
        meeting_id: meeting_id,
        status: status as any,
        scanned_admin_id: firstAdmin.id,
        device_id: deviceId, // Simpan device ID
        date: new Date(),
        recorded_at: new Date()
      } as any
    });

    // ===== SET COOKIE: Simpan informasi absensi di cookie =====
    // Cookie ini akan mencegah device yang sama digunakan untuk absen lagi
    const cookieData = {
      name: student.name,
      class: student.class,
      attendanceId: attendance.id,
      timestamp: new Date().toISOString()
    };
    
    // Cookie berlaku sampai akhir hari (23:59:59)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    cookieStore.set(cookieName, JSON.stringify(cookieData), {
      expires: endOfDay,
      httpOnly: true, // Tidak bisa diakses via JavaScript client
      secure: process.env.NODE_ENV === 'production', // HTTPS only di production
      sameSite: 'strict', // CSRF protection
      path: '/'
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
    }, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error("Submit attendance error:", error);
    
    // Handle unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: "Anda sudah mengisi absensi untuk meeting ini" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Gagal mencatat absensi: " + error.message },
      { status: 500 }
    );
  }
}
