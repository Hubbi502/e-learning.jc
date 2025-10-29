# 🚀 Quick Start: Meeting Status System

## 📌 TL;DR

**Tujuan**: Auto-disable meeting setelah berakhir & blokir akses form jika inactive  
**Teknologi**: Next.js + Prisma + Boolean flag + Auto-check  
**Status**: ✅ Implementasi Selesai

---

## 🎯 Fitur Utama

1. **Auto-disable**: Meeting otomatis mati setelah `ends_at`
2. **Manual toggle**: Admin bisa aktifkan/nonaktifkan kapan saja
3. **Blokir akses**: Form tidak bisa diakses jika meeting inactive
4. **Real-time check**: Setiap request dicek ulang

---

## 🔧 Setup Cepat

### 1. Migration
```bash
cd /home/hubbi/Documents/web/fullstack/e-learning.jc
npx prisma migrate dev
```

### 2. Jalankan Aplikasi
```bash
npm run dev
```

### 3. Buat Test Meeting
```sql
INSERT INTO meetings (id, title, starts_at, ends_at, is_active)
VALUES (
  'test-meeting-001',
  'Test Meeting',
  NOW(),
  NOW() + INTERVAL '2 hours',
  true
);
```

---

## 🧪 Testing

### Via Script (Automated)
```bash
./test-meeting-status.sh test-meeting-001
```

### Via Browser
```
# Admin Dashboard
http://localhost:3000/dashboard/attendance/meeting-status

# Attendance Form
http://localhost:3000/attendance/test-meeting-001
```

### Via cURL

**Get Status**:
```bash
curl http://localhost:3000/api/attendance/meeting/test-meeting-001 | jq
```

**Disable Meeting**:
```bash
curl -X PATCH http://localhost:3000/api/admin/meeting/test-meeting-001/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

**Enable Meeting**:
```bash
curl -X PATCH http://localhost:3000/api/admin/meeting/test-meeting-001/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'
```

---

## 📊 Status Logic

| Kondisi | is_active | Can Access | Auto Action |
|---------|-----------|------------|-------------|
| Normal (dalam waktu) | true | ✅ Yes | - |
| Belum mulai | true | ❌ No | - |
| Sudah berakhir | true → false | ❌ No | Auto-disable |
| Manual disabled | false | ❌ No | - |

---

## 🎨 Frontend Flow

```typescript
// 1. Fetch meeting
const meeting = await fetch(`/api/attendance/meeting/${id}`);

// 2. Check status
if (!meeting.is_active || meeting.status.is_ended) {
  // Show blocked screen
  return <BlockedScreen />;
}

// 3. Show form
return <AttendanceForm />;
```

---

## 🔐 Backend Validation

```typescript
// Di /api/attendance/submit

// 1. Cek meeting exists
const meeting = await prisma.meeting.findUnique(...);

// 2. Cek is_active
if (!meeting.is_active) {
  return 403; // Forbidden
}

// 3. Cek ends_at
if (now > meeting.ends_at) {
  await prisma.meeting.update({ is_active: false });
  return 403; // Forbidden
}

// 4. Cek starts_at
if (now < meeting.starts_at) {
  return 403; // Forbidden
}

// 5. Lanjutkan submit
```

---

## 📁 File yang Diubah

| File | Perubahan |
|------|-----------|
| `prisma/schema.prisma` | +is_active field |
| `src/app/api/attendance/meeting/[id]/route.ts` | Auto-check & return status |
| `src/app/api/admin/meeting/[id]/toggle/route.ts` | Toggle endpoint (NEW) |
| `src/app/api/attendance/submit/route.ts` | Validasi status |
| `src/app/attendance/[id]/page.tsx` | Blocked screen UI |
| `src/components/admin/MeetingStatusToggle.tsx` | Admin component (NEW) |

---

## 🚀 Admin Usage

### Via UI Component
```tsx
import MeetingStatusToggle from '@/components/admin/MeetingStatusToggle';

<MeetingStatusToggle meetingId="meeting-uuid" />
```

### Via SQL
```sql
-- Disable
UPDATE meetings SET is_active = false WHERE id = 'uuid';

-- Enable
UPDATE meetings SET is_active = true WHERE id = 'uuid';

-- Check expired meetings
SELECT * FROM meetings 
WHERE is_active = true AND ends_at < NOW();
```

---

## 🎯 User Experience

### Meeting Aktif ✅
```
┌─────────────────────────────┐
│  📝 Absensi                 │
│  Test Meeting               │
│  ──────────────────────     │
│  Nama: [________]           │
│  Kelas: [________]          │
│  [🚀 Kirim Absensi]         │
└─────────────────────────────┘
```

### Meeting Tidak Aktif 🔒
```
┌─────────────────────────────┐
│         🔒                  │
│  Meeting Tidak Aktif        │
│                             │
│  Meeting ini tidak dapat    │
│  diakses saat ini           │
│                             │
│  ╔═══════════════════╗      │
│  ║ Test Meeting      ║      │
│  ║ Mulai: ...        ║      │
│  ║ Selesai: ...      ║      │
│  ╚═══════════════════╝      │
└─────────────────────────────┘
```

### Meeting Berakhir ⏰
```
┌─────────────────────────────┐
│         ⏰                  │
│  Meeting Telah Berakhir     │
│                             │
│  Meeting ini sudah          │
│  melewati waktu selesai     │
└─────────────────────────────┘
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Meeting tidak auto-disable | Tunggu hingga user akses form/submit |
| Toggle tidak work | Cek API endpoint & CORS |
| Form masih bisa diakses | Refresh browser, cek cache |
| Error 403 saat submit | Meeting inactive/ended |

---

## 📊 Database Queries

### Cek Meeting yang Butuh Disable
```sql
SELECT id, title, ends_at, is_active
FROM meetings
WHERE is_active = true 
  AND ends_at < NOW();
```

### Cek Meeting Aktif
```sql
SELECT id, title, is_active,
  CASE 
    WHEN starts_at > NOW() THEN 'NOT_STARTED'
    WHEN ends_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM meetings
WHERE is_active = true;
```

---

## 🎓 Key Points

1. ✅ Meeting auto-disable saat expired
2. ✅ Admin bisa toggle manual
3. ✅ Form diblokir jika inactive
4. ✅ Server-side validation di submit
5. ✅ Real-time status check
6. ✅ User-friendly error messages

---

## 📚 Dokumentasi Lengkap

- **Full Guide**: `MEETING_STATUS_SYSTEM.md`
- **Test Script**: `test-meeting-status.sh`
- **Admin Component**: `src/components/admin/MeetingStatusToggle.tsx`

---

## 🔄 Integration dengan Triple-Layer Security

Meeting status adalah **Layer 0** (pre-validation):

```
Layer 0: Meeting Status Check ← NEW!
  ↓
Layer 1: localStorage (Client)
  ↓
Layer 2: Cookie (Server)
  ↓
Layer 3: Database (User/Device)
```

Jika meeting inactive, request langsung ditolak di Layer 0 sebelum cek duplikasi.

---

**Version**: 1.0.0  
**Last Update**: 30 Oktober 2025  
**Status**: ✅ Ready to Use
