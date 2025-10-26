# Sistem Absensi

Sistem absensi yang memungkinkan siswa mengisi kehadiran secara mandiri melalui link yang dibagikan.

## Fitur

### 1. Halaman Absensi Siswa (`/attendance/[id]`)
- Siswa dapat mengakses halaman absensi melalui link meeting
- Form input: Nama dan Kelas
- Validasi untuk mencegah duplikasi absensi
- Status otomatis (HADIR/TERLAMBAT) berdasarkan waktu mulai meeting
- Tampilan success setelah absensi berhasil

### 2. Manajemen Meeting Admin (`/dashboard/attendance/list`)
- Membuat meeting baru dengan judul dan waktu
- Melihat daftar semua meeting
- Copy link absensi untuk dibagikan ke siswa
- Melihat jumlah kehadiran per meeting

### 3. Detail Kehadiran (`/dashboard/attendance/[id]`)
- Statistik kehadiran (Total, Hadir, Terlambat, Izin)
- Tabel daftar kehadiran dengan filter
- Export data ke CSV
- Realtime update

## Alur Sistem

1. **Admin Membuat Meeting**
   - Admin buka `/dashboard/attendance/list`
   - Klik "Buat Meeting Baru"
   - Isi judul, waktu mulai, dan waktu selesai
   - Meeting dibuat dan mendapat ID unik

2. **Admin Membagikan Link**
   - Klik tombol "Copy Link" pada meeting
   - Link format: `(domain)/attendance/[meeting-id]`
   - Bagikan link ke siswa (WhatsApp, Email, dll)

3. **Siswa Mengisi Absensi**
   - Siswa buka link yang dibagikan
   - Isi nama lengkap dan kelas
   - Submit absensi
   - Sistem validasi dan simpan ke database

4. **Admin Memantau Kehadiran**
   - Klik "Detail" pada meeting
   - Lihat siapa saja yang sudah absen
   - Monitor statistik kehadiran
   - Export data jika diperlukan

## Database Schema

### Attendance Table
```prisma
model Attendance {
  id                String @id @default(uuid())
  student_id        String
  date              DateTime @default(now())
  status            AttendanceStatus
  recorded_at       DateTime @default(now())
  scanned_admin_id  String
  meeting_id        String
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  student           Student @relation(...)
  scannedByAdmin    AdminUser @relation(...)
  meeting           Meeting @relation(...)
  
  @@unique([student_id, meeting_id])
}
```

### Meeting Table
```prisma
model Meeting {
  id            String @id @default(uuid())
  title         String
  starts_at     DateTime?
  ends_at       DateTime?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  attendances   Attendance[]
}
```

## API Endpoints

### 1. Create Meeting
```
POST /api/admin/attendance
Body: {
  title: string,
  starts_at: string (ISO datetime),
  ends_at: string (ISO datetime)
}
```

### 2. Get All Meetings
```
GET /api/admin/attendance
Response: { success: true, meetings: Meeting[] }
```

### 3. Get Meeting Detail
```
GET /api/attendance/meeting/[id]
Response: { success: true, meeting: Meeting }
```

### 4. Submit Attendance
```
POST /api/attendance/submit
Body: {
  meeting_id: string,
  name: string,
  class: string
}
Response: { success: true, attendance: {...} }
```

### 5. Get Attendance List
```
GET /api/attendance/list/[id]
Response: { success: true, attendances: Attendance[] }
```

## Status Kehadiran

- **HADIR**: Absen tepat waktu atau dalam 15 menit setelah mulai
- **TERLAMBAT**: Absen lebih dari 15 menit setelah waktu mulai
- **IZIN**: Diset manual oleh admin (future feature)
- **TIDAK_HADIR**: Default jika tidak ada catatan (future feature)

## Validasi

1. **Nama dan Kelas**: Wajib diisi
2. **Duplikasi**: Siswa hanya bisa absen 1x per meeting
3. **Meeting**: Harus meeting yang valid/exist
4. **Student**: Auto-create jika belum ada di database

## Error Handling

- Meeting tidak ditemukan: 404
- Sudah absen: 400 dengan pesan "Anda sudah mengisi absensi untuk meeting ini"
- Field kosong: 400 dengan pesan "Semua field harus diisi"
- Server error: 500

## Future Improvements

1. QR Code untuk absensi
2. Geolocation validation
3. Face recognition
4. Email/SMS notification
5. Bulk import siswa
6. Schedule meeting recurrence
7. Integration dengan Google Calendar
8. Mobile app
9. Analytics dashboard
10. Absensi dengan barcode student ID

## Testing

Untuk testing fitur ini:

1. Jalankan development server: `npm run dev`
2. Buat admin user jika belum ada
3. Login sebagai admin
4. Buka `/dashboard/attendance/list`
5. Buat meeting baru
6. Copy link dan buka di browser/tab baru (simulasi siswa)
7. Isi nama dan kelas, submit
8. Cek di halaman detail apakah data muncul

## Migration

Migration sudah dibuat: `20251025114950_update_attendance_constraint`

Untuk apply migration:
```bash
npx prisma migrate deploy
```

Untuk rollback (jika diperlukan):
```bash
npx prisma migrate reset
```
