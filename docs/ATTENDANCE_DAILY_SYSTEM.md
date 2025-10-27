# Sistem Absensi Harian dengan Validasi Ganda

## 📋 Overview

Sistem absensi ini mencegah absensi ganda dengan menerapkan **dua aturan validasi di sisi server**:

1. **Validasi User**: Satu user hanya boleh absen satu kali per hari
2. **Validasi Device**: Satu perangkat hanya boleh digunakan untuk absen satu kali per hari

## 🏗️ Arsitektur Sistem

### Tumpukan Teknologi
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Frontend**: React (Client Component)
- **Device ID**: crypto.randomUUID() + localStorage

## 🔧 Komponen Implementasi

### 1. Database Schema (`prisma/schema.prisma`)

```prisma
model Attendance {
  id String @id @default(uuid())
  student_id String
  date DateTime @default(now())
  status AttendanceStatus
  recorded_at DateTime @default(now())
  scanned_admin_id String
  meeting_id String
  device_id String @default("unknown") // 🔑 Kolom baru untuk device tracking
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  student Student @relation(fields: [student_id], references: [id], onDelete: Cascade)
  scannedByAdmin AdminUser @relation(fields: [scanned_admin_id], references: [id], onDelete: Cascade)
  meeting Meeting @relation(fields: [meeting_id], references: [id], onDelete: Cascade)
  
  @@unique([student_id, meeting_id])
  @@index([device_id]) // Index untuk performa query
  @@index([recorded_at]) // Index untuk query berdasarkan waktu
  @@map("attendances")
}
```

**Perubahan:**
- ✅ Menambahkan kolom `device_id` dengan default value "unknown"
- ✅ Menambahkan index pada `device_id` untuk performa
- ✅ Menambahkan index pada `recorded_at` untuk filter waktu

### 2. Backend API (`src/app/api/attendance/submit/route.ts`)

#### Alur Logika:

```
1. Terima Request (POST)
   ├── Validasi input (meeting_id, name, class, deviceId)
   └── Cek meeting exists
   
2. Cari atau Buat Student
   └── FindFirst berdasarkan name + class
   
3. VALIDASI GANDA ⚠️
   ├── Tentukan rentang waktu hari ini (00:00:00 - 23:59:59)
   ├── Query database dengan OR condition:
   │   ├── Cek User: student_id + meeting_id + today
   │   └── Cek Device: device_id + meeting_id + today
   └── Jika ada yang cocok:
       ├── Return 409 Conflict
       └── Message spesifik (user/device duplicate)
       
4. Jika Lolos Validasi
   ├── Tentukan status (HADIR/TERLAMBAT)
   ├── Create attendance record dengan device_id
   └── Return 201 Created
```

#### Kode Validasi Kunci:

```typescript
// Tentukan rentang waktu hari ini
const now = new Date();
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

// Query dengan OR untuk cek user ATAU device
const existingAttendance = await prisma.attendance.findFirst({
  where: {
    OR: [
      {
        // Cek User
        student_id: student.id,
        meeting_id: meeting_id,
        recorded_at: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      {
        // Cek Device
        device_id: deviceId,
        meeting_id: meeting_id,
        recorded_at: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    ]
  },
  include: {
    student: true
  }
});

// Respon berdasarkan tipe duplikasi
if (existingAttendance) {
  if (existingAttendance.student_id === student.id) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Anda sudah mengisi absensi untuk meeting ini hari ini",
        type: "USER_DUPLICATE"
      },
      { status: 409 }
    );
  } else if (existingAttendance.device_id === deviceId) {
    return NextResponse.json(
      { 
        success: false, 
        message: `Device ini sudah digunakan untuk absensi hari ini oleh ${existingAttendance.student.name}`,
        type: "DEVICE_DUPLICATE"
      },
      { status: 409 }
    );
  }
}
```

### 3. Frontend Component (`src/components/attendance/AttendanceForm.tsx`)

#### Device ID Management:

```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    let storedDeviceId = localStorage.getItem('attendance_device_id');
    
    // Jika belum ada, buat UUID baru
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem('attendance_device_id', storedDeviceId);
    }
    
    setDeviceId(storedDeviceId);
  }
}, []);
```

#### Submit Handler:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!deviceId) {
    setError('Device ID belum tersedia');
    return;
  }
  
  const response = await fetch('/api/attendance/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meeting_id: meetingId,
      name: formData.name.trim(),
      class: formData.class.trim(),
      deviceId: deviceId, // 🔑 Kirim device ID
    }),
  });
  
  // Handle response...
};
```

## 🎯 Fitur Keamanan

### ✅ Validasi User
- **Cek**: Apakah `student_id` ini sudah absen hari ini untuk `meeting_id` yang sama?
- **Tujuan**: Mencegah user yang sama absen berkali-kali
- **Error**: `"Anda sudah mengisi absensi untuk meeting ini hari ini"`

### ✅ Validasi Device
- **Cek**: Apakah `device_id` ini sudah digunakan hari ini untuk `meeting_id` yang sama?
- **Tujuan**: Mencegah satu perangkat digunakan bergantian oleh banyak orang
- **Error**: `"Device ini sudah digunakan untuk absensi hari ini oleh [Nama User]"`

### ✅ Device ID Persistence
- Disimpan di `localStorage` browser
- Tetap sama selama tidak clear storage
- UUID format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

## 🚀 Testing & Skenario

### Skenario 1: Absensi Normal ✅
```
User: Budi (Device A) → Submit → Success (201)
```

### Skenario 2: User Duplikat ❌
```
User: Budi (Device A) → Submit → Success (201)
User: Budi (Device A) → Submit lagi → Error 409: "Anda sudah absen"
```

### Skenario 3: Device Duplikat ❌
```
User: Budi (Device A) → Submit → Success (201)
User: Ani (Device A) → Submit → Error 409: "Device sudah digunakan oleh Budi"
```

### Skenario 4: Beda Device, User Sama ❌
```
User: Budi (Device A) → Submit → Success (201)
User: Budi (Device B) → Submit → Error 409: "Anda sudah absen"
```

### Skenario 5: Hari Berbeda ✅
```
Hari Senin:
  User: Budi (Device A) → Submit → Success (201)
  
Hari Selasa:
  User: Budi (Device A) → Submit → Success (201) ✅
```

## 🔍 SQL Query yang Digunakan

```sql
-- Query Prisma (dikonversi ke SQL)
SELECT * FROM attendances
WHERE (
  (student_id = ? AND meeting_id = ? AND recorded_at BETWEEN ? AND ?)
  OR
  (device_id = ? AND meeting_id = ? AND recorded_at BETWEEN ? AND ?)
)
LIMIT 1;
```

## 📊 Database Migration

```bash
# Jalankan migrasi
npx prisma migrate dev --name add_device_id_to_attendance

# Generate Prisma Client
npx prisma generate
```

## 🛠️ Setup & Installation

1. **Update Schema**
   ```bash
   cd /path/to/project
   # Schema sudah diupdate di prisma/schema.prisma
   ```

2. **Run Migration**
   ```bash
   npx prisma migrate dev --name add_device_id_to_attendance
   ```

3. **Test API**
   ```bash
   # Start development server
   npm run dev
   
   # Access form
   http://localhost:3000/attendance/[meeting-id]
   ```

## 🐛 Troubleshooting

### Problem: Device ID tidak tersimpan
**Solution**: Pastikan browser mengizinkan localStorage (tidak dalam private/incognito mode)

### Problem: Error "device_id does not exist"
**Solution**: Jalankan `npx prisma generate` untuk update Prisma Client

### Problem: Validasi tidak bekerja
**Solution**: Cek timezone server dan pastikan `startOfToday`/`endOfToday` benar

### Problem: User bisa absen lagi setelah clear localStorage
**Solution**: Ini by design. Validasi user tetap berlaku di server (cek student_id)

## 📈 Performance Optimization

1. **Index pada device_id**: Mempercepat query berdasarkan device
2. **Index pada recorded_at**: Mempercepat filter tanggal
3. **findFirst dengan OR**: Single query untuk dual check
4. **localStorage**: Mengurangi overhead generate UUID berulang

## 🔐 Security Considerations

1. **Device ID bisa dimanipulasi**: User bisa edit localStorage, tapi validasi user tetap di server
2. **Not foolproof**: User teknis bisa bypass dengan clear storage + VPN, tapi tetap terdeteksi di level user
3. **Trade-off**: Balance antara keamanan dan UX

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)

---

**Dibuat**: 27 Oktober 2025  
**Last Updated**: 27 Oktober 2025  
**Version**: 1.0.0
