# Fitur Toggle Form Izin di Halaman Absensi Siswa

## 📋 Overview
Fitur ini menambahkan kemampuan bagi siswa untuk memilih antara mengisi **Absensi Hadir** atau **Form Izin** langsung di halaman `/attendance/[id]`.

## ✨ Yang Ditambahkan

### 1. **Toggle Button Mode**
- Button toggle untuk beralih antara mode "Hadir" dan "Izin"
- Design responsif dengan gradient colors:
  - **Hadir**: Gradient biru (blue-indigo)
  - **Izin**: Gradient amber-orange
- Icon yang berbeda untuk setiap mode (✓ untuk Hadir, ✉ untuk Izin)

### 2. **Form Field Dinamis**
- **Mode Hadir**: Nama + Kelas (seperti biasa)
- **Mode Izin**: Nama + Kelas + Alasan Izin (textarea)
- Field "Alasan Izin" hanya muncul di mode izin
- Character counter dengan validasi real-time

### 3. **API Endpoint Baru**
**POST** `/api/attendance/submit-permission`

Endpoint khusus untuk siswa mengirim form izin sendiri.

Request Body:
```json
{
  "meeting_id": "meeting-uuid",
  "name": "Nama Siswa",
  "class": "10A",
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

### 4. **Validasi Berbeda per Mode**

#### Mode Hadir:
- ✅ Nama & Kelas wajib diisi
- ✅ Device ID/Fingerprint wajib terdeteksi
- ✅ Cek duplicate (localStorage + server-side)
- ✅ Cek status meeting (aktif/tidak)

#### Mode Izin:
- ✅ Nama & Kelas wajib diisi
- ✅ Alasan izin wajib diisi (minimal 10, maksimal 500 karakter)
- ✅ Cek duplicate di server (tidak bisa izin jika sudah hadir/izin)
- ✅ Cek status meeting (aktif/tidak)
- ❌ **TIDAK** butuh device ID/fingerprint (karena form manual)
- ❌ **TIDAK** ada localStorage check (siswa bisa isi izin kapan saja selama meeting aktif)

### 5. **UI/UX Enhancements**

#### Info Box Mode Izin:
- Background amber dengan border
- Icon info
- Penjelasan singkat tentang mode izin

#### Submit Button Dinamis:
- Warna dan text berubah sesuai mode
- **Mode Hadir**: Biru + "🚀 Kirim Absensi"
- **Mode Izin**: Amber + "✉ Kirim Form Izin"
- Loading state yang berbeda

#### Success Message:
- "Absensi Berhasil!" untuk mode hadir
- "Izin Berhasil Dicatat!" untuk mode izin

## 🚀 Cara Menggunakan

### Untuk Siswa:

1. **Akses Halaman Absensi**
   - Scan QR Code atau buka link `/attendance/[meeting-id]`

2. **Pilih Mode**
   - Klik button **"Hadir"** untuk absensi biasa
   - Klik button **"Izin"** untuk mengisi form izin

3. **Isi Form**
   - **Mode Hadir**: Isi Nama dan Kelas, tunggu device detection
   - **Mode Izin**: Isi Nama, Kelas, dan Alasan Izin (min 10 karakter)

4. **Submit**
   - Klik tombol submit yang sesuai dengan mode
   - Tunggu konfirmasi sukses
   - Redirect otomatis ke halaman sukses

## 🔄 Perbedaan Utama

| Aspek | Mode Hadir | Mode Izin |
|-------|-----------|-----------|
| **Device Detection** | ✅ Required | ❌ Not Required |
| **Fingerprint** | ✅ Tracked | ❌ Not Tracked |
| **LocalStorage Check** | ✅ Yes | ❌ No |
| **Alasan Field** | ❌ Hidden | ✅ Required (10-500 char) |
| **device_id** | FingerprintJS ID | `"student-permission"` |
| **Status Tersimpan** | HADIR/TERLAMBAT | IZIN |
| **Can Submit Multiple?** | ❌ No (blocked by localStorage + server) | ❌ No (blocked by server) |

## 📁 File yang Dimodifikasi

1. **src/components/attendance/AttendanceForm.tsx**
   - Added `isPermissionMode` state
   - Added `reason` field to formData
   - Added toggle buttons
   - Added conditional rendering for reason textarea
   - Updated submit logic to use different endpoints
   - Updated validation logic per mode
   - Updated UI (button colors, text, etc.)

2. **src/app/api/attendance/submit-permission/route.ts** (NEW)
   - Endpoint untuk handle permission submission dari siswa
   - Validasi meeting status
   - Validasi reason length
   - Create attendance with status IZIN
   - device_id: `"student-permission"`

## 🎨 UI Features

### Toggle Button:
```tsx
[  ✓ Hadir  ] [  ✉ Izin  ]
```
- Active button: Colored gradient with shadow
- Inactive button: White background with gray text
- Smooth transitions

### Info Box (Mode Izin Only):
```
ℹ️ Mode Izin
Anda sedang mengisi form izin. Pastikan untuk memberikan 
alasan yang jelas mengapa tidak dapat hadir.
```

### Character Counter:
```
125/500 karakter • Minimal 10 karakter
```

## ⚠️ Validasi & Error Handling

### Client-Side Validation:
- Empty fields check
- Reason length validation (10-500 characters)
- Device ID check (mode hadir only)
- LocalStorage duplicate check (mode hadir only)

### Server-Side Validation:
- Meeting exists & active
- Meeting not ended
- Reason length (10-500)
- No duplicate attendance (same student + meeting)
- Admin user exists

### Error Messages:
- "⚠️ Mohon lengkapi semua field!"
- "⚠️ Alasan izin harus diisi!"
- "⚠️ Alasan izin minimal 10 karakter!"
- "Anda sudah memiliki data izin/absensi untuk meeting ini"
- "Meeting tidak aktif/telah berakhir"

## 🔐 Security Notes

### Mode Hadir (Ketat):
- Device fingerprinting
- localStorage check
- Cookie check
- Multiple layer duplicate prevention

### Mode Izin (Lebih Fleksibel):
- Tidak pakai device fingerprinting (siswa bisa dari device apapun)
- Hanya server-side duplicate check
- Tetap validasi meeting status
- Identifiable dengan device_id: `"student-permission"`

**Reasoning**: Mode izin lebih fleksibel karena siswa mungkin mengirim izin dari HP orang tua, warnet, atau device lain. Yang penting tidak bisa double submit (dicek di server).

## 📊 Database Records

### Attendance Record - Mode Hadir:
```json
{
  "status": "HADIR" atau "TERLAMBAT",
  "device_id": "fingerprint-visitor-id",
  "fingerprint_hash": "hashed-fingerprint",
  "reason": null
}
```

### Attendance Record - Mode Izin:
```json
{
  "status": "IZIN",
  "device_id": "student-permission",
  "fingerprint_hash": null,
  "reason": "Alasan izin dari siswa..."
}
```

## 🎯 Benefits

1. **Fleksibilitas**: Siswa bisa langsung isi izin tanpa contact admin
2. **User-Friendly**: Toggle button yang intuitif
3. **Transparent**: Siswa tau perbedaan antara hadir dan izin
4. **Efficient**: Admin tidak perlu manual input izin untuk setiap siswa
5. **Traceable**: Semua izin tercatat dengan alasan dan timestamp

## 🔮 Future Enhancements

- [ ] Email/SMS notification ke admin saat ada izin baru
- [ ] Upload bukti (surat dokter, dll)
- [ ] Approval system untuk izin
- [ ] History izin per siswa
- [ ] Reminder untuk siswa yang belum hadir/izin
- [ ] Analytics: persentase hadir vs izin vs tidak hadir

## 📞 Testing

### Test Scenario 1: Mode Hadir
1. Pilih mode Hadir
2. Isi nama dan kelas
3. Tunggu device detection
4. Submit
5. Verify: Status = HADIR/TERLAMBAT, ada device_id

### Test Scenario 2: Mode Izin
1. Pilih mode Izin
2. Isi nama, kelas, dan alasan (min 10 char)
3. Submit (tanpa tunggu device detection)
4. Verify: Status = IZIN, device_id = "student-permission", ada reason

### Test Scenario 3: Duplicate Prevention
1. Submit hadir
2. Try submit izin dengan nama/kelas yang sama
3. Should be rejected dengan error message

### Test Scenario 4: Validation
1. Mode izin dengan alasan < 10 karakter
2. Should show error
3. Mode izin dengan alasan > 500 karakter
4. Should be rejected by server

---

**Version**: 1.0.0  
**Created**: November 10, 2025  
**Last Updated**: November 10, 2025
