# 🎓 E-Learning Platform - Sistema Absensi

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Run Application
```bash
npm run dev
```

### 4. Create Test Meeting
```sql
INSERT INTO meetings (id, title, starts_at, ends_at, is_active)
VALUES ('test-001', 'Meeting Test', NOW(), NOW() + INTERVAL '2 hours', true);
```

### 5. Access
- **Attendance Form**: http://localhost:3000/attendance/test-001
- **Admin Dashboard**: http://localhost:3000/dashboard/attendance/meeting-status

---

## 🛡️ Features

### ✅ 4-Layer Security System
1. **Meeting Status Check** (Auto-disable expired meetings)
2. **Client-side Storage** (localStorage + device tracking)
3. **Server-side Cookie** (httpOnly, secure, sameSite)
4. **Database Validation** (User + Device duplicate check)

### ✅ Meeting Management
- Auto-disable setelah expired
- Manual enable/disable oleh admin
- Blokir akses form jika inactive
- Real-time status validation

---

## 🧪 Testing

### Automated Tests
```bash
# Security tests
./test-triple-layer-security.sh test-001

# Meeting status tests
./test-meeting-status.sh test-001
```

### Manual Tests
1. Akses form: `/attendance/test-001`
2. Submit pertama kali ✅
3. Submit ulang ❌ (blocked)
4. Disable meeting via admin
5. Akses form 🔒 (blocked)

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `COMPLETE_IMPLEMENTATION_SUMMARY.md` | **START HERE** - Overview lengkap |
| `TRIPLE_LAYER_SECURITY.md` | Security architecture |
| `MEETING_STATUS_SYSTEM.md` | Meeting management guide |
| `MEETING_STATUS_QUICK_START.md` | Quick reference commands |
| `docs/ATTENDANCE_TESTING_GUIDE.md` | Test scenarios |

---

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Language**: TypeScript
- **Security**: 4-layer validation
- **Testing**: Bash scripts + Manual

---

## 📊 API Endpoints

### Attendance
```bash
# Submit attendance
POST /api/attendance/submit
Body: { meeting_id, name, class, deviceId }

# Get meeting
GET /api/attendance/meeting/[id]
```

### Admin
```bash
# Toggle meeting status
PATCH /api/admin/meeting/[id]/toggle
Body: { is_active: true/false }
```

---

## 🎯 Admin Usage

### Via UI
```
URL: /dashboard/attendance/meeting-status
Input meeting ID → Toggle status
```

### Via API
```bash
# Disable
curl -X PATCH http://localhost:3000/api/admin/meeting/test-001/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# Enable
curl -X PATCH http://localhost:3000/api/admin/meeting/test-001/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'
```

### Via SQL
```sql
-- Disable
UPDATE meetings SET is_active = false WHERE id = 'meeting-id';

-- Enable
UPDATE meetings SET is_active = true WHERE id = 'meeting-id';
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Migration failed | Check DATABASE_URL in .env |
| Device ID not working | Check localStorage in DevTools |
| Form not blocking | Clear browser cache & reload |
| API 403 error | Meeting inactive or expired |

---

## 📈 Status

- ✅ Triple-Layer Security: **Implemented**
- ✅ Meeting Management: **Implemented**
- ✅ Auto-disable Logic: **Implemented**
- ✅ Admin Dashboard: **Implemented**
- ✅ Testing Suite: **Implemented**
- ✅ Documentation: **Complete**

**Overall**: 🚀 **PRODUCTION READY**

---

## 📞 Support

Baca dokumentasi lengkap:
- Start: `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- Security: `TRIPLE_LAYER_SECURITY.md`
- Meeting: `MEETING_STATUS_SYSTEM.md`

---

**Version**: 2.0.0  
**Last Updated**: 30 Oktober 2025
