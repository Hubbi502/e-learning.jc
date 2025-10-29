# 🔄 Meeting Status Management System

## 📋 Overview

Sistem manajemen status meeting dengan fitur:
1. **Auto-disable** meeting setelah waktu berakhir (`ends_at`)
2. **Manual toggle** status meeting oleh admin
3. **Blokir akses** form attendance jika meeting tidak aktif
4. **Validasi real-time** saat user mencoba submit

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    Meeting Status Flow                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Meeting Status Check        │
         │   - is_active (boolean)       │
         │   - starts_at (datetime)      │
         │   - ends_at (datetime)        │
         └───────────────┬───────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Belum   │   │ Aktif   │   │ Sudah   │
    │ Mulai   │   │ ✅      │   │ Selesai │
    └─────────┘   └─────────┘   └─────────┘
         │              │              │
         ▼              ▼              ▼
    🔒 Blokir     ✅ Allow      🔒 Blokir
    Form Absen    Akses Form    & Auto-disable
```

---

## 🗄️ Database Schema

### Model: Meeting
```prisma
model Meeting {
  id String @id @default(uuid())
  title String @default("")
  starts_at DateTime?
  ends_at DateTime?
  is_active Boolean @default(true)  // 🆕 Status aktif/non-aktif
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  attendances Attendance[]

  @@map("meetings")
}
```

**Kolom Baru**:
- `is_active`: Boolean flag untuk enable/disable meeting manual

---

## 🔐 Status Meeting Logic

### 1. Meeting Aktif ✅
**Kondisi**:
- `is_active = true`
- `now >= starts_at` (jika ada)
- `now <= ends_at` (jika ada)

**Action**: User bisa akses form dan submit absensi

---

### 2. Meeting Belum Mulai ⏰
**Kondisi**:
- `is_active = true`
- `now < starts_at`

**Action**: 
- Form diblokir
- Pesan: "Meeting belum dimulai. Silakan tunggu hingga waktu mulai."

---

### 3. Meeting Sudah Berakhir 🔒
**Kondisi**:
- `now > ends_at`

**Action**: 
- Auto-update `is_active = false` di database
- Form diblokir
- Pesan: "Meeting telah berakhir"

---

### 4. Meeting Di-disable Manual 🚫
**Kondisi**:
- Admin set `is_active = false`

**Action**: 
- Form diblokir
- Pesan: "Meeting tidak aktif"

---

## 📡 API Endpoints

### 1. Get Meeting Status
```
GET /api/attendance/meeting/[id]
```

**Response**:
```json
{
  "success": true,
  "meeting": {
    "id": "uuid",
    "title": "Meeting Pagi",
    "starts_at": "2025-10-30T08:00:00Z",
    "ends_at": "2025-10-30T10:00:00Z",
    "is_active": true,
    "status": {
      "is_active": true,
      "is_ended": false,
      "message": ""
    }
  }
}
```

**Status Conditions**:
- `status.is_active`: Apakah meeting bisa diakses sekarang
- `status.is_ended`: Apakah meeting sudah lewat ends_at
- `status.message`: Pesan error jika tidak bisa diakses

---

### 2. Toggle Meeting Status (Admin)
```
PATCH /api/admin/meeting/[id]/toggle
```

**Request Body**:
```json
{
  "is_active": true  // atau false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Meeting berhasil diaktifkan",
  "meeting": {
    "id": "uuid",
    "is_active": true,
    "updated_at": "2025-10-30T07:00:00Z"
  }
}
```

---

### 3. Submit Attendance (dengan validasi)
```
POST /api/attendance/submit
```

**Validasi Tambahan**:
1. ✅ Cek `meeting.is_active`
2. ✅ Cek `now >= starts_at`
3. ✅ Cek `now <= ends_at`
4. ✅ Auto-disable jika sudah lewat `ends_at`

**Error Responses**:

**403 - Meeting Inactive**:
```json
{
  "success": false,
  "message": "Meeting tidak aktif. Tidak dapat mengisi absensi.",
  "type": "MEETING_INACTIVE"
}
```

**403 - Meeting Ended**:
```json
{
  "success": false,
  "message": "Meeting telah berakhir. Tidak dapat mengisi absensi.",
  "type": "MEETING_ENDED"
}
```

**403 - Meeting Not Started**:
```json
{
  "success": false,
  "message": "Meeting belum dimulai. Silakan tunggu hingga waktu mulai.",
  "type": "MEETING_NOT_STARTED"
}
```

---

## 🎨 Frontend Implementation

### Halaman Attendance Form

**File**: `src/app/attendance/[id]/page.tsx`

**Flow**:
```typescript
1. Fetch meeting data via API
2. Cek meeting.status
3. Jika !canAttend → Tampilkan blocked screen
4. Jika canAttend → Tampilkan form
```

**Blocked Screen UI**:
```tsx
<div className="text-center bg-white p-8 rounded-lg">
  <div className="text-yellow-500 text-5xl mb-4">
    {meetingStatus?.is_ended ? '⏰' : '🔒'}
  </div>
  <h2>Meeting Telah Berakhir / Meeting Tidak Aktif</h2>
  <p>{meetingStatus?.message}</p>
  
  {/* Info meeting */}
  <div className="bg-gray-50 p-4 rounded-lg">
    <p>{meeting.title}</p>
    <p>Mulai: {meeting.starts_at}</p>
    <p>Selesai: {meeting.ends_at}</p>
  </div>
</div>
```

---

## 🧪 Testing Scenarios

### Test 1: Meeting Normal (Aktif & Dalam Waktu)
```
Meeting:
  is_active: true
  starts_at: 2025-10-30 08:00
  ends_at: 2025-10-30 10:00
  
Current Time: 2025-10-30 09:00

Result: ✅ User bisa akses form dan submit
```

---

### Test 2: Meeting Belum Mulai
```
Meeting:
  is_active: true
  starts_at: 2025-10-30 10:00
  ends_at: 2025-10-30 12:00
  
Current Time: 2025-10-30 09:00

Result: 🔒 Form diblokir
Message: "Meeting belum dimulai. Silakan tunggu hingga waktu mulai."
```

---

### Test 3: Meeting Sudah Berakhir (Auto-disable)
```
Meeting:
  is_active: true
  starts_at: 2025-10-30 08:00
  ends_at: 2025-10-30 10:00
  
Current Time: 2025-10-30 11:00

Result: 
  🔒 Form diblokir
  🔄 Auto-update is_active = false
  ⏰ Message: "Meeting telah berakhir"
```

---

### Test 4: Meeting Di-disable Manual oleh Admin
```
Meeting:
  is_active: false  ← Admin disabled
  starts_at: 2025-10-30 08:00
  ends_at: 2025-10-30 10:00
  
Current Time: 2025-10-30 09:00 (masih dalam waktu)

Result: 🔒 Form diblokir
Message: "Meeting tidak aktif"
```

---

### Test 5: User Coba Submit Saat Meeting Inactive
```
Meeting:
  is_active: false
  
User Action: POST /api/attendance/submit

Result: 
  Status: 403 Forbidden
  Message: "Meeting tidak aktif. Tidak dapat mengisi absensi."
  Type: "MEETING_INACTIVE"
```

---

## 🔧 Implementation Files

### Modified Files:

1. **Schema**: `prisma/schema.prisma`
   - ✅ Tambah kolom `is_active` di Meeting

2. **Migration**: `prisma/migrations/.../migration.sql`
   - ✅ `ALTER TABLE meetings ADD COLUMN is_active BOOLEAN DEFAULT true`

3. **API - Get Meeting**: `src/app/api/attendance/meeting/[id]/route.ts`
   - ✅ Auto-check ends_at
   - ✅ Auto-disable jika expired
   - ✅ Return status object

4. **API - Toggle Status**: `src/app/api/admin/meeting/[id]/toggle/route.ts`
   - ✅ PATCH endpoint untuk admin
   - ✅ Update is_active field

5. **API - Submit**: `src/app/api/attendance/submit/route.ts`
   - ✅ Validasi is_active
   - ✅ Validasi starts_at
   - ✅ Validasi ends_at
   - ✅ Auto-disable jika expired

6. **Frontend**: `src/app/attendance/[id]/page.tsx`
   - ✅ Fetch meeting status
   - ✅ Conditional rendering
   - ✅ Blocked screen UI

---

## 🚀 Admin Usage

### Via API (curl)

**Disable Meeting**:
```bash
curl -X PATCH http://localhost:3000/api/admin/meeting/[meeting-id]/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

**Enable Meeting**:
```bash
curl -X PATCH http://localhost:3000/api/admin/meeting/[meeting-id]/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'
```

### Via Database (SQL)

**Manual Disable**:
```sql
UPDATE meetings 
SET is_active = false, updated_at = NOW() 
WHERE id = 'meeting-uuid';
```

**Manual Enable**:
```sql
UPDATE meetings 
SET is_active = true, updated_at = NOW() 
WHERE id = 'meeting-uuid';
```

---

## 📊 Status Check Query

### Cek Meeting yang Auto-disabled
```sql
SELECT 
  id,
  title,
  ends_at,
  is_active,
  CASE 
    WHEN ends_at < NOW() THEN 'EXPIRED'
    WHEN starts_at > NOW() THEN 'NOT_STARTED'
    ELSE 'ACTIVE'
  END as status
FROM meetings
WHERE is_active = false;
```

### Cek Meeting yang Perlu Auto-disable
```sql
SELECT 
  id,
  title,
  ends_at,
  is_active
FROM meetings
WHERE is_active = true 
  AND ends_at < NOW();
```

---

## 🎯 Security Benefits

1. ✅ **Server-side validation**: Tidak bisa bypass dari client
2. ✅ **Auto-disable**: Meeting otomatis mati jika expired
3. ✅ **Multi-layer check**: 
   - Frontend: Blokir UI
   - Backend: Validasi request
   - Database: Status flag
4. ✅ **Real-time check**: Setiap request dicek ulang
5. ✅ **Admin control**: Bisa disable manual kapan saja

---

## ⚠️ Important Notes

1. **Timezone**: Pastikan server timezone sesuai dengan wilayah
2. **Auto-disable**: Terjadi saat:
   - User akses GET /api/attendance/meeting/[id]
   - User submit POST /api/attendance/submit
3. **Admin Dashboard**: Perlu dibuat UI untuk toggle status
4. **Notification**: Bisa tambahkan notifikasi ke users sebelum meeting berakhir

---

## 🔄 Future Enhancements

1. [ ] Scheduled job untuk auto-disable (cron)
2. [ ] Email/push notification saat meeting akan berakhir
3. [ ] Admin dashboard UI untuk manage meetings
4. [ ] Bulk enable/disable meetings
5. [ ] Meeting history & analytics
6. [ ] Extend meeting duration feature

---

**Version**: 1.0.0  
**Last Update**: 30 Oktober 2025  
**Status**: ✅ Production Ready
