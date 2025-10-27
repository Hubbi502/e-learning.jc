# Panduan Testing Sistem Absensi Harian

## 🧪 Test Cases

### Test Case 1: Absensi Pertama Kali (Happy Path)
**Deskripsi**: User pertama kali absen dengan device baru

**Langkah**:
1. Buka browser (Chrome/Firefox)
2. Akses `/attendance/[meeting-id]`
3. Isi form:
   - Nama: "Budi Santoso"
   - Kelas: "10A"
4. Klik "Kirim Absensi"

**Expected Result**:
- ✅ Status: 201 Created
- ✅ Message: "Absensi berhasil dicatat"
- ✅ Redirect ke `/attendance/success`
- ✅ Device ID tersimpan di localStorage
- ✅ Record baru di database dengan device_id

**SQL Verification**:
```sql
SELECT * FROM attendances 
WHERE student_id = (SELECT id FROM students WHERE name = 'Budi Santoso')
AND DATE(recorded_at) = CURRENT_DATE;
```

---

### Test Case 2: User Duplikat (Same User, Same Device)
**Deskripsi**: User yang sama coba absen lagi dari device yang sama

**Langkah**:
1. Selesaikan Test Case 1
2. Tanpa clear localStorage atau ganti browser
3. Akses `/attendance/[meeting-id]` (meeting yang sama)
4. Isi form dengan data yang sama:
   - Nama: "Budi Santoso"
   - Kelas: "10A"
5. Klik "Kirim Absensi"

**Expected Result**:
- ❌ Status: 409 Conflict
- ❌ Message: "Anda sudah mengisi absensi untuk meeting ini hari ini"
- ❌ Type: "USER_DUPLICATE"
- ✅ Tidak ada record baru di database

**Debugging**:
```javascript
// Di browser console
console.log(localStorage.getItem('attendance_device_id'));
// Harus return device_id yang sama dengan Test Case 1
```

---

### Test Case 3: Device Duplikat (Different User, Same Device)
**Deskripsi**: User berbeda coba absen dari device yang sama

**Langkah**:
1. Selesaikan Test Case 1
2. Tanpa clear localStorage
3. Akses `/attendance/[meeting-id]` (meeting yang sama)
4. Isi form dengan user berbeda:
   - Nama: "Ani Wijaya"
   - Kelas: "10B"
5. Klik "Kirim Absensi"

**Expected Result**:
- ❌ Status: 409 Conflict
- ❌ Message: "Device ini sudah digunakan untuk absensi hari ini oleh Budi Santoso (10A)"
- ❌ Type: "DEVICE_DUPLICATE"
- ✅ Tidak ada record baru di database

**Catatan**: Device ID sama dengan Test Case 1, jadi terdeteksi sebagai duplikasi device

---

### Test Case 4: User Sama, Device Berbeda
**Deskripsi**: User yang sama coba absen dari device berbeda

**Langkah**:
1. Selesaikan Test Case 1 di Chrome
2. Buka browser berbeda (Firefox/Safari) atau Incognito
3. Akses `/attendance/[meeting-id]`
4. Isi form dengan user yang sama:
   - Nama: "Budi Santoso"
   - Kelas: "10A"
5. Klik "Kirim Absensi"

**Expected Result**:
- ❌ Status: 409 Conflict
- ❌ Message: "Anda sudah mengisi absensi untuk meeting ini hari ini"
- ❌ Type: "USER_DUPLICATE"
- ✅ Device ID berbeda tapi tetap terdeteksi karena student_id sama

**Debugging**:
```javascript
// Di browser baru
console.log(localStorage.getItem('attendance_device_id'));
// Harus return device_id yang BERBEDA dari Test Case 1
```

---

### Test Case 5: Meeting Berbeda
**Deskripsi**: User yang sama absen di meeting berbeda

**Langkah**:
1. Selesaikan Test Case 1 untuk meeting A
2. Akses `/attendance/[meeting-id-B]` (meeting berbeda)
3. Isi form dengan user yang sama:
   - Nama: "Budi Santoso"
   - Kelas: "10A"
4. Klik "Kirim Absensi"

**Expected Result**:
- ✅ Status: 201 Created
- ✅ Message: "Absensi berhasil dicatat"
- ✅ Record baru di database untuk meeting_id yang berbeda

**Catatan**: Validasi berlaku per meeting, jadi user bisa absen di meeting berbeda

---

### Test Case 6: Hari Berbeda
**Deskripsi**: User absen lagi di hari berbeda (next day)

**Pre-requisite**: Tunggu hingga hari berikutnya atau manipulasi waktu server

**Langkah**:
1. Selesaikan Test Case 1 di Hari 1
2. Tunggu hingga Hari 2 (atau set system time)
3. Akses `/attendance/[meeting-id]` (meeting yang sama)
4. Isi form dengan user yang sama:
   - Nama: "Budi Santoso"
   - Kelas: "10A"
5. Klik "Kirim Absensi"

**Expected Result**:
- ✅ Status: 201 Created
- ✅ Message: "Absensi berhasil dicatat"
- ✅ Record baru di database dengan tanggal berbeda

**SQL Verification**:
```sql
SELECT DATE(recorded_at) as date, COUNT(*) as count
FROM attendances 
WHERE student_id = (SELECT id FROM students WHERE name = 'Budi Santoso')
GROUP BY DATE(recorded_at)
ORDER BY date DESC;
-- Harus ada 2 records dengan tanggal berbeda
```

---

### Test Case 7: Clear localStorage
**Deskripsi**: User clear localStorage dan coba absen lagi

**Langkah**:
1. Selesaikan Test Case 1
2. Buka Developer Tools (F12)
3. Tab Application/Storage → localStorage
4. Hapus key `attendance_device_id`
5. Refresh halaman
6. Isi form dengan user yang sama:
   - Nama: "Budi Santoso"
   - Kelas: "10A"
7. Klik "Kirim Absensi"

**Expected Result**:
- ❌ Status: 409 Conflict
- ❌ Message: "Anda sudah mengisi absensi untuk meeting ini hari ini"
- ❌ Type: "USER_DUPLICATE"
- ✅ Device ID baru ter-generate tapi tetap ditolak karena student_id sama

**Catatan**: Ini membuktikan validasi user tetap efektif meskipun device ID berubah

---

### Test Case 8: Status Terlambat
**Deskripsi**: User absen setelah 15 menit dari waktu mulai meeting

**Pre-requisite**: Meeting harus memiliki `starts_at` yang sudah lewat >15 menit

**Langkah**:
1. Buat meeting dengan `starts_at` = sekarang - 20 menit
2. Akses `/attendance/[meeting-id]`
3. Isi form:
   - Nama: "Citra Dewi"
   - Kelas: "10C"
4. Klik "Kirim Absensi"

**Expected Result**:
- ✅ Status: 201 Created
- ✅ Message: "Absensi berhasil dicatat"
- ✅ attendance.status = "TERLAMBAT"

**SQL Verification**:
```sql
SELECT status FROM attendances 
WHERE student_id = (SELECT id FROM students WHERE name = 'Citra Dewi')
ORDER BY recorded_at DESC LIMIT 1;
-- Harus return 'TERLAMBAT'
```

---

## 🔧 Testing Tools

### 1. Manual Testing dengan Browser

**Setup**:
```bash
# Terminal 1: Start dev server
npm run dev

# Browser: 
# Chrome → http://localhost:3000/attendance/[meeting-id]
# Firefox → http://localhost:3000/attendance/[meeting-id]
# Safari → http://localhost:3000/attendance/[meeting-id]
```

**Debugging Tools**:
```javascript
// Browser Console (F12)

// 1. Cek Device ID
console.log(localStorage.getItem('attendance_device_id'));

// 2. Generate Device ID baru
localStorage.removeItem('attendance_device_id');
console.log(crypto.randomUUID()); // Preview format

// 3. Manual set Device ID
localStorage.setItem('attendance_device_id', 'test-device-123');
```

### 2. Testing dengan cURL

**Sukses Request**:
```bash
curl -X POST http://localhost:3000/api/attendance/submit \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_id": "YOUR_MEETING_ID",
    "name": "Test User",
    "class": "10A",
    "deviceId": "test-device-001"
  }'
```

**Duplikat Request** (jalankan 2x):
```bash
# Request 1: Sukses
curl -X POST http://localhost:3000/api/attendance/submit \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_id": "YOUR_MEETING_ID",
    "name": "Duplicate Test",
    "class": "10A",
    "deviceId": "duplicate-device-001"
  }'

# Request 2: Harus error 409
curl -X POST http://localhost:3000/api/attendance/submit \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_id": "YOUR_MEETING_ID",
    "name": "Duplicate Test",
    "class": "10A",
    "deviceId": "duplicate-device-001"
  }'
```

### 3. Database Verification

**Cek Total Absensi Hari Ini**:
```sql
SELECT COUNT(*) as total_attendance_today
FROM attendances
WHERE DATE(recorded_at) = CURRENT_DATE;
```

**Cek Duplikasi Device**:
```sql
SELECT device_id, COUNT(*) as count
FROM attendances
WHERE DATE(recorded_at) = CURRENT_DATE
GROUP BY device_id
HAVING COUNT(*) > 1;
-- Harus return 0 rows
```

**Cek Duplikasi User per Meeting**:
```sql
SELECT student_id, meeting_id, COUNT(*) as count
FROM attendances
WHERE DATE(recorded_at) = CURRENT_DATE
GROUP BY student_id, meeting_id
HAVING COUNT(*) > 1;
-- Harus return 0 rows
```

**Lihat Detail Absensi**:
```sql
SELECT 
  a.id,
  s.name as student_name,
  s.class,
  a.status,
  a.device_id,
  a.recorded_at
FROM attendances a
JOIN students s ON a.student_id = s.id
WHERE DATE(a.recorded_at) = CURRENT_DATE
ORDER BY a.recorded_at DESC;
```

---

## 📊 Expected Database State

### Setelah Test Case 1:
```
attendances table:
+------+------------+----------+--------+------------------+
| id   | student_id | status   | meeting| device_id        |
+------+------------+----------+--------+------------------+
| uuid1| uuid-budi  | HADIR    | meet1  | device-abc-123   |
+------+------------+----------+--------+------------------+
```

### Setelah Test Case 3 (rejected):
```
attendances table: (TIDAK ADA PERUBAHAN)
+------+------------+----------+--------+------------------+
| id   | student_id | status   | meeting| device_id        |
+------+------------+----------+--------+------------------+
| uuid1| uuid-budi  | HADIR    | meet1  | device-abc-123   |
+------+------------+----------+--------+------------------+

// Ani Wijaya TIDAK masuk karena device_id sama
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Device ID selalu berubah
**Symptom**: Setiap refresh, dapat device ID baru
**Cause**: localStorage tidak persist (incognito mode)
**Solution**: Gunakan regular browser window, bukan incognito

### Issue 2: Validasi tidak bekerja
**Symptom**: User bisa absen berkali-kali
**Cause**: Timezone atau date range salah
**Debug**:
```javascript
// Di API route, tambahkan console.log
console.log('startOfToday:', startOfToday);
console.log('endOfToday:', endOfToday);
console.log('existingAttendance:', existingAttendance);
```

### Issue 3: Error "device_id does not exist"
**Symptom**: TypeScript error atau Prisma error
**Cause**: Prisma client belum ter-regenerate
**Solution**:
```bash
npx prisma generate
```

### Issue 4: Device ID tidak muncul di form
**Symptom**: Submit button disabled
**Cause**: useEffect belum selesai atau crypto API tidak tersedia
**Debug**:
```javascript
// Di component, tambahkan
console.log('deviceId:', deviceId);
console.log('crypto available:', typeof crypto !== 'undefined');
```

---

## ✅ Testing Checklist

Sebelum production, pastikan semua test case ini pass:

- [ ] Test Case 1: First time attendance (201 Created)
- [ ] Test Case 2: User duplicate (409 Conflict)
- [ ] Test Case 3: Device duplicate (409 Conflict)
- [ ] Test Case 4: Same user, different device (409 Conflict)
- [ ] Test Case 5: Different meeting (201 Created)
- [ ] Test Case 6: Next day attendance (201 Created)
- [ ] Test Case 7: Clear localStorage (409 Conflict - user validation)
- [ ] Test Case 8: Late attendance (201 Created with TERLAMBAT status)
- [ ] Database: No duplicate device_id per day
- [ ] Database: No duplicate student_id per meeting per day
- [ ] UI: Error messages shown correctly
- [ ] UI: Success state and redirect working
- [ ] DevTools: Device ID visible and persistent

---

**Last Updated**: 27 Oktober 2025  
**Test Environment**: Development
