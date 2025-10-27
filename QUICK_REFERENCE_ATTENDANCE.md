# 🚀 Quick Reference: Sistem Absensi Harian

## 📌 TL;DR (Too Long; Didn't Read)

**Tujuan**: Mencegah absensi ganda dengan validasi user + device  
**Teknologi**: Next.js + Prisma + localStorage + crypto.randomUUID()  
**Status**: ✅ Implementasi Selesai

---

## 🎯 Cara Kerja dalam 3 Langkah

### 1️⃣ Client-Side (Browser)
```javascript
// Otomatis saat page load
deviceId = localStorage.getItem('attendance_device_id') || crypto.randomUUID();
```

### 2️⃣ Request ke Server
```javascript
POST /api/attendance/submit
Body: { meeting_id, name, class, deviceId }
```

### 3️⃣ Server Validation
```javascript
// Cek: Apakah user atau device sudah absen hari ini?
if (user_absen_hari_ini || device_dipakai_hari_ini) {
  return 409 Conflict; // ❌ Ditolak
} else {
  return 201 Created;  // ✅ Sukses
}
```

---

## 🔒 Dua Aturan Validasi

### ✅ Rule 1: One User, One Attendance Per Day
```
Budi (10A) → Absen → ✅ Success
Budi (10A) → Absen lagi → ❌ "Anda sudah absen"
```

### ✅ Rule 2: One Device, One Attendance Per Day
```
Device-A: Budi → Absen → ✅ Success
Device-A: Ani → Absen → ❌ "Device sudah digunakan oleh Budi"
```

---

## 📁 File yang Diubah

| File | Perubahan | Status |
|------|-----------|--------|
| `prisma/schema.prisma` | +device_id, +indexes | ✅ Done |
| `src/app/api/attendance/submit/route.ts` | +dual validation logic | ✅ Done |
| `src/components/attendance/AttendanceForm.tsx` | +device ID management | ✅ Done |
| Database | Migration applied | ✅ Done |

---

## 🧪 Testing Cepat

### Test 1: Normal Absensi
```bash
# Browser 1
1. Buka /attendance/[meeting-id]
2. Isi nama: "Budi", kelas: "10A"
3. Submit → ✅ Sukses
```

### Test 2: Duplikasi User
```bash
# Browser 1 (sama seperti Test 1)
1. Submit lagi dengan data sama
2. Hasil → ❌ Error: "Anda sudah absen"
```

### Test 3: Duplikasi Device
```bash
# Browser 1 (sama seperti Test 1)
1. Submit dengan nama berbeda: "Ani", kelas: "10B"
2. Hasil → ❌ Error: "Device sudah digunakan oleh Budi"
```

### Test 4: Device Berbeda, User Sama
```bash
# Browser 2 (beda browser/incognito)
1. Isi nama: "Budi", kelas: "10A"
2. Submit → ❌ Error: "Anda sudah absen"
```

---

## 🛠️ Command Penting

```bash
# Jalankan aplikasi
npm run dev

# Lihat database
npx prisma studio

# Regenerate Prisma Client (jika error)
npx prisma generate

# Cek status migrasi
npx prisma migrate status
```

---

## 🔍 Debugging

### Cek Device ID di Browser
```javascript
// Browser Console (F12)
console.log(localStorage.getItem('attendance_device_id'));
```

### Cek Database
```sql
-- Lihat semua absensi hari ini
SELECT s.name, s.class, a.device_id, a.recorded_at
FROM attendances a
JOIN students s ON a.student_id = s.id
WHERE DATE(a.recorded_at) = CURRENT_DATE;
```

### Reset Testing
```javascript
// Browser Console
localStorage.removeItem('attendance_device_id');
location.reload();
```

---

## ⚠️ Troubleshooting Cepat

| Problem | Solution |
|---------|----------|
| Device ID selalu berubah | Jangan pakai Incognito mode |
| Error "device_id does not exist" | Run `npx prisma generate` |
| Validasi tidak jalan | Cek timezone server |
| Button disabled terus | Cek console, pastikan deviceId ada |

---

## 📊 Response Status Codes

| Code | Arti | Kapan |
|------|------|-------|
| 201 | Created | ✅ Absensi sukses dicatat |
| 400 | Bad Request | ❌ Input tidak lengkap |
| 404 | Not Found | ❌ Meeting tidak ada |
| 409 | Conflict | ❌ Duplikasi user/device |
| 500 | Server Error | ❌ Error system |

---

## 🎓 Key Takeaways

1. **Device ID**: Auto-generate UUID, simpan di localStorage
2. **Validasi**: 2 checks (user + device) dalam 1 query (OR)
3. **Date Range**: 00:00:00 - 23:59:59 hari yang sama
4. **Security**: Server-side validation, tidak bisa bypass dari client
5. **Performance**: Menggunakan database indexes

---

## 📚 Dokumentasi Lengkap

- **System Design**: `docs/ATTENDANCE_DAILY_SYSTEM.md`
- **Testing Guide**: `docs/ATTENDANCE_TESTING_GUIDE.md`
- **Full Summary**: `ATTENDANCE_DUAL_VALIDATION_SUMMARY.md`

---

## 🚀 Next Actions

1. [ ] Jalankan testing sesuai test cases
2. [ ] Verify semua skenario pass
3. [ ] Deploy ke staging
4. [ ] User acceptance testing
5. [ ] Deploy ke production

---

**Version**: 1.0.0  
**Last Update**: 27 Oktober 2025  
**Status**: ✅ Ready to Test
