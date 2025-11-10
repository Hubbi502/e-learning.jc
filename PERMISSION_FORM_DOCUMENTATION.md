# Fitur Form Izin - Dokumentasi

## 📋 Overview
Fitur Form Izin memungkinkan admin untuk mencatat izin siswa yang tidak dapat hadir secara manual melalui dashboard admin.

## ✨ Fitur yang Ditambahkan

### 1. **Database Schema Update**
- Menambahkan field `reason` (opsional, String) pada model `Attendance` di Prisma schema
- Field ini menyimpan alasan izin siswa

### 2. **Permission Form Modal** 
Komponen modal untuk admin mengisi form izin dengan field:
- **Nama Lengkap**: Nama siswa yang izin
- **Kelas**: Kelas siswa
- **Pilih Meeting**: Dropdown untuk memilih meeting yang diizinkan
- **Alasan Izin**: Text area untuk mencatat alasan izin (minimal 10 karakter, maksimal 500 karakter)

**File**: `src/components/admin/PermissionFormModal.tsx`

### 3. **API Endpoint**
**POST** `/api/admin/attendance/permission`

Request Body:
```json
{
  "name": "Nama Siswa",
  "class": "10A",
  "meeting_id": "meeting-uuid",
  "reason": "Alasan izin minimal 10 karakter"
}
```

Response Success (201):
```json
{
  "success": true,
  "message": "Izin berhasil dicatat",
  "attendance": {
    "id": "attendance-uuid",
    "student_name": "Nama Siswa",
    "class": "10A",
    "status": "IZIN",
    "reason": "Alasan izin...",
    "recorded_at": "2025-11-10T12:00:00Z",
    "meeting_title": "Meeting Title"
  }
}
```

**GET** `/api/admin/attendance/permission`
- Mengembalikan daftar semua attendance dengan status IZIN

**File**: `src/app/api/admin/attendance/permission/route.ts`

### 4. **Integration ke Attendance Management**
- Tombol **"Form Izin"** ditambahkan di action bar AttendanceManagement
- Tombol berwarna biru dengan icon FileText
- Clicking tombol akan membuka PermissionFormModal

**File**: `src/components/admin/AttendanceManagement.tsx`

### 5. **Display Reason di Attendance Detail**
- Kolom **"Keterangan"** ditambahkan di tabel AttendanceDetailModal
- Menampilkan alasan izin untuk attendance dengan status IZIN
- Jika tidak ada alasan atau status bukan IZIN, menampilkan "-"

**File**: `src/components/admin/AttendanceDetailModal.tsx`

## 🚀 Cara Menggunakan

### Untuk Admin:

1. **Akses Dashboard Attendance**
   - Login sebagai admin
   - Buka menu Attendance Management

2. **Buka Form Izin**
   - Klik tombol **"Form Izin"** di action bar (tombol biru dengan icon dokumen)
   - Modal form akan muncul

3. **Isi Form Izin**
   - Masukkan nama lengkap siswa
   - Masukkan kelas siswa
   - Pilih meeting yang akan diizinkan dari dropdown
   - Tulis alasan izin (minimal 10 karakter)

4. **Submit**
   - Klik tombol **"Simpan Izin"**
   - Sistem akan validasi dan menyimpan data izin
   - Modal sukses akan muncul jika berhasil

5. **Lihat Data Izin**
   - Klik "View Details" pada meeting yang dipilih
   - Data izin akan muncul dengan status IZIN
   - Kolom "Keterangan" akan menampilkan alasan izin

## ⚠️ Validasi & Error Handling

### Validasi Input:
- ✅ Semua field wajib diisi
- ✅ Alasan izin minimal 10 karakter
- ✅ Alasan izin maksimal 500 karakter
- ✅ Meeting harus valid dan ada di database

### Error Handling:
- **409 Conflict**: Siswa sudah memiliki data absensi untuk meeting ini
- **404 Not Found**: Meeting tidak ditemukan
- **400 Bad Request**: Input tidak valid
- **500 Internal Server Error**: Error server

## 🔧 Technical Details

### Database Migration
```bash
npx prisma migrate dev --name add_reason_to_attendance
```

File migration: `prisma/migrations/20251110044544_add_reason_to_attendance/migration.sql`

### Field Properties:
```prisma
model Attendance {
  // ... existing fields
  reason String? // Optional string field untuk alasan izin
}
```

### Identifikasi Izin Manual:
- `device_id`: Set ke `"admin-manual"` untuk membedakan dari absensi QR
- `fingerprint_hash`: `null` karena tidak ada device fingerprint
- `status`: `"IZIN"`
- `reason`: Berisi alasan izin dari admin

## 📊 Data Flow

```
Admin → Form Izin Button 
  → PermissionFormModal 
    → Fetch Meetings (GET /api/admin/attendance)
    → Fill Form
    → Submit (POST /api/admin/attendance/permission)
      → Validate Input
      → Check Meeting Exists
      → Find/Create Student
      → Check Duplicate Attendance
      → Create Attendance with Status IZIN
      → Return Success
  → Modal Success
  → Refresh Meeting List
```

## 🎨 UI/UX Features

### Modal Design:
- ✨ Modern gradient header (blue to purple)
- 📝 Clear form layout dengan labels dan icons
- ⚠️ Error messages dengan color coding
- ℹ️ Info box dengan penjelasan
- ✅ Success animation setelah submit

### Responsive:
- ✅ Mobile-friendly
- ✅ Tablet optimized
- ✅ Desktop full layout

### Accessibility:
- ✅ Keyboard navigation
- ✅ Required field indicators
- ✅ Clear error messages
- ✅ Loading states

## 🔐 Security Considerations

### To Implement (Future):
- [ ] Authentication check di API endpoint
- [ ] Authorization - hanya admin yang bisa akses
- [ ] Rate limiting untuk prevent spam
- [ ] Input sanitization
- [ ] CSRF protection

### Current Implementation:
- ✅ Field validation (length, required)
- ✅ Duplicate check (student + meeting)
- ✅ Meeting validation
- ✅ Error handling

## 📝 Notes

1. **Auto-create Student**: Jika siswa belum ada di database, akan dibuat otomatis dengan:
   - Category default: `Gengo`
   - Exam_code: empty string (akan diisi saat ikut ujian)

2. **Meeting Selection**: Hanya menampilkan meeting dari 7 hari terakhir untuk kemudahan pilihan

3. **Device ID**: Izin manual menggunakan `"admin-manual"` sebagai device_id untuk tracking

4. **Alasan Tampilan**: Alasan izin hanya tampil jika status = IZIN, menggunakan `line-clamp-2` untuk text yang panjang

## 🐛 Troubleshooting

### Error: "Gagal memuat meeting"
- Cek koneksi ke database
- Pastikan API endpoint `/api/admin/attendance` berjalan

### Error: "Siswa sudah memiliki data absensi"
- Cek data attendance di meeting tersebut
- Siswa dengan nama dan kelas yang sama hanya boleh satu absensi per meeting

### Reason tidak muncul di tabel
- Pastikan Prisma Client sudah di-regenerate: `npx prisma generate`
- Restart development server
- Cek migration sudah applied: `npx prisma migrate status`

## 🎯 Future Enhancements

1. **Bulk Permission**: Upload CSV untuk multiple students
2. **Permission History**: Halaman khusus untuk melihat semua izin
3. **Edit Permission**: Kemampuan edit alasan izin
4. **Delete Permission**: Hapus data izin (dengan confirmation)
5. **Export Permission**: Export data izin ke Excel/PDF
6. **Notification**: Email/notification ke siswa saat izin dicatat
7. **Approval System**: Sistem persetujuan izin (request → approve)
8. **Attachment**: Upload surat izin/dokumen pendukung

## 📞 Support

Jika ada pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

---
**Created**: November 10, 2025
**Version**: 1.0.0
**Last Updated**: November 10, 2025
