# 📱 Panduan QR Code untuk Absensi

## Untuk Admin

### 1️⃣ Buat Meeting & Generate QR

```
Dashboard → Tab "Attendance" → Create New Meeting
```

**Input:**
- Judul Meeting: "Pertemuan Minggu 1"
- Waktu Mulai: (opsional)
- Waktu Selesai: (opsional)

**Klik:** "Create & Generate QR"

**Result:** 
- ✅ Meeting dibuat
- ✅ QR Code muncul otomatis
- ✅ Berisi URL lengkap

---

### 2️⃣ Download atau Share QR Code

**Opsi A: Download**
```
Klik "View QR" → Klik "Download" → Simpan PNG
```

**Opsi B: Copy Link**
```
Klik "Link" → URL otomatis ter-copy → Share via WhatsApp
```

**Opsi C: Print**
```
Download QR → Print → Tempel di dinding kelas
```

---

### 3️⃣ Contoh Penggunaan

#### Scenario 1: Kelas Offline
```
1. Print QR code ukuran A4
2. Tempel di pintu masuk kelas
3. Siswa scan saat masuk
4. Monitor kehadiran real-time
```

#### Scenario 2: Kelas Online
```
1. Display QR di share screen
2. Atau kirim via WhatsApp group
3. Siswa scan dari rumah
4. Cek kehadiran di dashboard
```

#### Scenario 3: Event
```
1. Display QR di entrance
2. Peserta scan saat datang
3. Auto record attendance
4. Export CSV untuk laporan
```

---

## Untuk Siswa

### 🎯 Cara Isi Absensi dengan QR Code

#### Method 1: Scan dengan Kamera HP

**iPhone:**
```
1. Buka aplikasi Camera
2. Arahkan ke QR code
3. Notifikasi muncul di atas
4. Tap notifikasi
5. Form absensi terbuka otomatis ✅
```

**Android:**
```
1. Buka Google Lens atau Camera
2. Arahkan ke QR code
3. Tap icon yang muncul
4. Browser terbuka dengan form
5. Isi nama dan kelas ✅
```

#### Method 2: Scan dengan WhatsApp

```
1. Buka WhatsApp
2. Tap ikon Scan (di chat)
3. Scan QR code
4. Open link
5. Form terbuka ✅
```

#### Method 3: Copy Link Manual

Jika QR tidak bisa di-scan:
```
1. Minta link dari admin
2. Copy paste ke browser
3. Form terbuka
4. Isi absensi
```

---

## 📋 Apa yang Ada di QR Code?

### Sebelumnya (ID Only)
```
QR berisi: "abc123-def456-ghi789"
Problem: Tidak bisa langsung buka
Siswa harus: Manual ketik URL
```

### Sekarang (Full URL) ✅
```
QR berisi: "https://yourdomain.com/attendance/abc123"
Benefit: Langsung buka form!
Siswa: Scan → Buka → Isi → Done!
```

---

## 🎨 Tips QR Code Quality

### Print Quality
- **Minimum size:** 3x3 cm
- **Recommended:** 5x5 cm or larger
- **Resolution:** 300 DPI atau lebih
- **Paper:** Putih matte (bukan glossy)

### Display Quality
- **Projector:** Full screen, fokus tajam
- **Monitor:** Brightness 80-100%
- **Contrast:** High contrast (hitam-putih)

### Scanning Distance
- **Optimal:** 20-30 cm dari kamera
- **Maximum:** 50-60 cm (tergantung ukuran)
- **Minimum:** 10 cm

### Lighting
- ✅ Cahaya terang (natural/lampu)
- ❌ Hindari backlight
- ❌ Hindari refleksi/glare
- ❌ Jangan terlalu gelap

---

## ⚠️ Troubleshooting

### QR Code tidak terbaca?

**Check 1: Ukuran**
- QR terlalu kecil? → Print ulang lebih besar
- Terlalu jauh? → Dekatkan kamera

**Check 2: Kualitas**
- Blur? → Download ulang dengan resolusi tinggi
- Rusak? → Generate QR baru

**Check 3: Kamera**
- Lens kotor? → Bersihkan
- Fokus? → Tap layar untuk fokus
- Lighting? → Tambah cahaya

**Check 4: Link**
- URL salah? → Regenerate QR
- Expired? → Meeting masih aktif?

### Form tidak terbuka?

**Check 1: Internet**
- Connected? → Test buka website lain
- Slow? → Tunggu beberapa detik

**Check 2: Browser**
- Blocked? → Allow popups
- Old version? → Update browser

**Check 3: URL**
- Typo? → Check URL dengan teliti
- Domain? → Pastikan domain benar

---

## 📊 Monitoring (Admin)

### Real-Time Monitoring
```
Dashboard → Attendance → Click meeting → Lihat list
```

**Info yang tersedia:**
- ✅ Nama siswa
- ✅ Kelas
- ✅ Status (Hadir/Terlambat)
- ✅ Waktu absen
- ✅ Total kehadiran

### Export Data
```
Detail Meeting → Scroll ke bawah → "Export CSV"
```

**CSV berisi:**
- No
- Nama
- Kelas
- Status
- Waktu Absen

---

## 💡 Best Practices

### Untuk Admin:

1. **Buat Meeting Lebih Awal**
   - Buat 1 hari sebelumnya
   - Test QR code sebelum dibagikan

2. **Multiple Distribution**
   - Print + Digital
   - WhatsApp + Display
   - Backup plan jika QR error

3. **Monitor Real-Time**
   - Buka dashboard saat kelas
   - Check siapa yang belum absen
   - Reminder ke yang telat

4. **Regular Backup**
   - Export CSV setiap minggu
   - Simpan di cloud storage
   - Archive data lama

### Untuk Siswa:

1. **Scan Tepat Waktu**
   - Jangan tunggu last minute
   - Check status setelah submit

2. **Bookmark Link**
   - Save link di browser
   - Quick access tanpa scan

3. **Screenshot QR**
   - Save QR code di galeri
   - Scan offline jika diperlukan

---

## 🔒 Privacy & Security

### Data yang Dicatat:
- ✅ Nama
- ✅ Kelas
- ✅ Waktu absensi
- ✅ Status kehadiran

### Data yang TIDAK dicatat:
- ❌ Email
- ❌ Phone number
- ❌ Location (untuk sekarang)
- ❌ Device info

### Akses:
- Public: Form absensi (siapa saja bisa akses)
- Private: Dashboard & data (admin only)

---

## 📞 Support

**Jika ada masalah:**

1. Check dokumentasi ini terlebih dahulu
2. Test dengan browser berbeda
3. Try manual URL instead of QR
4. Contact admin jika masih error

**Common Issues:**
- "Meeting not found" → QR expired atau salah
- "Already submitted" → Sudah absen sebelumnya
- "Failed to submit" → Internet atau server issue

---

## 🚀 Future Features (Coming Soon)

- [ ] NFC support (tap phone to scan)
- [ ] Geolocation validation (must be in classroom)
- [ ] Time window (absensi hanya bisa jam tertentu)
- [ ] Face recognition (verify identity)
- [ ] Student dashboard (lihat riwayat sendiri)
- [ ] Email notification (auto email saat absen)
- [ ] SMS reminder (reminder untuk yang belum absen)

---

**Last Updated:** October 25, 2025
**Version:** 2.0 (URL-based QR System)
