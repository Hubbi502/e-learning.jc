# Quick Start: Sistem Absensi

## 🚀 Cara Menggunakan

### Untuk Admin

1. **Login ke Dashboard**
   ```
   Buka: https://yourdomain.com/login
   ```

2. **Buat Meeting Baru**
   - Klik tab "Attendance" di sidebar
   - Isi form "Create New Meeting"
   - Klik "Create & Generate QR"

3. **Bagikan Link ke Siswa**
   - Klik tombol "Link" untuk copy link absensi
   - Atau klik "Attendance" untuk lihat detail
   - Share link via WhatsApp/Email/Telegram

4. **Monitor Kehadiran**
   - Klik tombol "Attendance" pada meeting
   - Lihat siapa saja yang sudah absen
   - Export CSV jika diperlukan

### Untuk Siswa

1. **Buka Link yang Dibagikan**
   ```
   Format: https://yourdomain.com/attendance/[meeting-id]
   ```

2. **Isi Form**
   - Nama Lengkap
   - Kelas

3. **Submit**
   - Klik "Kirim Absensi"
   - Tunggu konfirmasi
   - Done! ✅

## 📁 URL Penting

| Halaman | URL | Untuk |
|---------|-----|-------|
| Student Attendance | `/attendance/[meeting-id]` | Siswa mengisi absensi |
| Admin Dashboard | `/dashboard` → Tab "Attendance" | Admin kelola meeting |
| Meeting Detail | `/dashboard/attendance/[meeting-id]` | Admin lihat kehadiran |
| Meeting List | `/dashboard/attendance/list` | Admin lihat semua meeting |

## 🎯 Fitur Utama

- ✅ Form absensi sederhana (nama + kelas)
- ✅ Link unik per meeting
- ✅ Auto-detect status (HADIR/TERLAMBAT)
- ✅ Prevent duplikasi
- ✅ Export CSV
- ✅ Real-time statistics
- ✅ Mobile-friendly

## ⚠️ Catatan Penting

- Siswa hanya bisa absen **1 kali per meeting**
- Status TERLAMBAT jika absen > 15 menit setelah waktu mulai
- Nama dan kelas harus diisi
- Link absensi bisa dibagikan ke semua siswa

## 🐛 Troubleshooting

**Meeting tidak ditemukan?**
- Pastikan link sudah benar
- Cek apakah meeting sudah dibuat

**Tidak bisa submit?**
- Pastikan nama dan kelas sudah diisi
- Cek apakah sudah pernah absen sebelumnya

**Data tidak muncul?**
- Refresh halaman
- Cek koneksi internet

## 💡 Tips

1. **Untuk Admin:**
   - Buat meeting sebelum kelas dimulai
   - Bagikan link 5-10 menit sebelum kelas
   - Monitor kehadiran secara real-time
   - Export CSV untuk backup data

2. **Untuk Siswa:**
   - Simpan link di bookmark untuk akses cepat
   - Isi absensi tepat waktu
   - Pastikan nama dan kelas sesuai

## 🔗 Related Files

- Full Documentation: `/docs/ATTENDANCE_IMPLEMENTATION.md`
- System Overview: `/ATTENDANCE_SYSTEM.md`

---

**Need Help?** Contact admin atau check dokumentasi lengkap.
