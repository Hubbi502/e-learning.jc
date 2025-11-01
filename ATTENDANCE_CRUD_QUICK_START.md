# 🚀 Quick Start: Kelola Attendance Records

## Akses Halaman

```
Dashboard → Tab "Attendance" → Klik "📋 Kelola Attendance Records"
```

**URL Langsung**: `/dashboard/attendance/manage`

---

## 📋 Fitur Utama

### 1️⃣ Lihat Semua Attendance
- Table dengan pagination
- 4 statistics cards (Total, Hadir, Terlambat, Izin)

### 2️⃣ Search & Filter
- **Search**: Ketik nama/kelas → Enter
- **Filter Status**: Dropdown (Hadir/Terlambat/Izin/Tidak Hadir)
- **Per Halaman**: 10, 25, 50, atau 100 records

### 3️⃣ Edit Attendance
```
Klik "✏️ Edit" → Ubah data → Simpan
```
Bisa edit:
- Nama siswa
- Kelas
- Status kehadiran

### 4️⃣ Delete Attendance

**Single Delete:**
```
Klik "🗑️ Hapus" → Konfirmasi → Done
```

**Bulk Delete:**
```
Check boxes → Klik "Hapus Terpilih" → Konfirmasi → Done
```

### 5️⃣ Export CSV
```
(Optional: Select records) → Klik "📥 Export CSV" → Download
```

---

## ⚡ Quick Actions

| Action | Shortcut |
|--------|----------|
| Search | Ketik → Enter |
| Select All | Click checkbox header |
| Clear Selection | Click "✖ Clear Selection" |
| Export All | Klik "Export CSV" tanpa select |
| Export Selected | Select rows → "Export CSV" |

---

## 🎯 Use Cases

### Case 1: Update Status Siswa
```
Scenario: Siswa terlambat tapi sudah ada izin
1. Search nama siswa
2. Klik "Edit"
3. Ubah status → "IZIN"
4. Simpan ✅
```

### Case 2: Hapus Data Duplikat
```
Scenario: Siswa tidak sengaja absen 2x
1. Search nama siswa
2. Check box pada duplikat
3. Klik "Hapus Terpilih"
4. Konfirmasi ✅
```

### Case 3: Export untuk Laporan
```
Scenario: Butuh laporan kehadiran
1. Filter status "HADIR"
2. Select all
3. Klik "Export CSV"
4. Done! ✅
```

### Case 4: Bersihkan Data Test
```
Scenario: Hapus attendance dari meeting test
1. Filter by meeting (via search)
2. Select all hasil filter
3. Bulk delete
4. Confirm ✅
```

---

## 📊 Table Columns

| Column | Description |
|--------|-------------|
| ☑️ | Checkbox untuk select |
| **Nama** | Nama lengkap siswa |
| **Kelas** | Kelas siswa |
| **Meeting** | Judul pertemuan |
| **Status** | Badge berwarna (Hadir/Terlambat/etc) |
| **Waktu Absen** | Timestamp (dd/mm/yy hh:mm) |
| **Aksi** | Edit & Hapus buttons |

---

## 🎨 Status Color Codes

- 🟢 **HADIR** → Green
- 🟡 **TERLAMBAT** → Yellow
- 🔵 **IZIN** → Blue
- 🔴 **TIDAK_HADIR** → Red

---

## ⚠️ Important Notes

1. **Delete is Permanent!** Tidak bisa undo, pastikan backup via CSV
2. **Edit Updates Both** Student & Attendance records
3. **Search is Case-Insensitive** "ahmad" = "Ahmad" = "AHMAD"
4. **Pagination Resets** Saat search atau filter berubah
5. **Selected Items Clear** Setelah bulk delete atau refresh

---

## 🐛 Common Issues

**Tidak muncul data?**
- Check filter status → Set "Semua Status"
- Check search box → Kosongkan jika ada

**Edit tidak save?**
- Pastikan semua field terisi
- Refresh page & try again

**Export CSV kosong?**
- Pastikan ada data di table
- Clear filters jika perlu

**Bulk delete tidak work?**
- Pastikan ada checkbox yang tercentang
- Check console untuk errors

---

## 💡 Pro Tips

1. **Filter First**: Gunakan filter sebelum bulk action
2. **Export Before Delete**: Backup dulu sebelum hapus banyak
3. **Use Search**: Lebih cepat dari scroll manual
4. **Check Stats Cards**: Quick overview tanpa scroll

---

## 🔗 Related Pages

- **Meeting Management**: `/dashboard/attendance` (buat meeting baru)
- **Meeting Detail**: `/dashboard/attendance/[id]` (lihat per meeting)
- **Student Form**: `/attendance/[id]` (form untuk siswa)

---

## 📞 Need Help?

Check full documentation: `/ATTENDANCE_CRUD_DOCUMENTATION.md`

---

**Happy Managing! 🎉**
