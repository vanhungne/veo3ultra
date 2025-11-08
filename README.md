# 🔐 License Management System

Hệ thống quản lý license hoàn chỉnh với Next.js 14 + TypeScript + SQL Server + Prisma

## ✨ Tính năng

### 🎯 Core Features
- ✅ **Auto Trial**: Tự động cấp trial 1 ngày cho device mới (chỉ 1 lần/device)
- ✅ **Device Tracking**: Theo dõi thiết bị theo MachineGuid (Windows)
- ✅ **Multi-Tool Support**: Hỗ trợ nhiều tool (veo, flux, etc.)
- ✅ **License Types**: Trial, Monthly, Yearly, Lifetime, Custom
- ✅ **RSA Signature**: Ký license bằng RSA-2048 (tương thích với Python app)
- ✅ **Admin Dashboard**: Quản lý license, devices, activity logs
- ✅ **Activity Logging**: Ghi lại mọi thao tác admin
- ✅ **Rate Limiting**: Bảo vệ API khỏi abuse

### 🔒 Security Features
- ✅ JWT Authentication cho admin
- ✅ Bcrypt password hashing
- ✅ RSA-2048 license signing
- ✅ Device fingerprinting
- ✅ Trial prevention (1 device = 1 trial)
- ✅ License revocation
- ✅ API rate limiting

---

## 🚀 Setup Instructions

### 1. Cài đặt Dependencies

```bash
cd license-system
npm install
```

### 2. Setup SQL Server Database

Tạo database mới trong SQL Server:

```sql
CREATE DATABASE LicenseDB;
```

### 3. Cấu hình Environment Variables

Tạo file `.env` từ template:

```bash
cp env.example.txt .env
```

Sửa file `.env`:

```env
DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YourPassword123!;encrypt=true;trustServerCertificate=true"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
TRIAL_DAYS=1
```

### 4. Chạy Prisma Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed Database (Tạo Admin đầu tiên)

```bash
npx prisma db seed
```

Output:
```
✅ Created admin: admin@example.com
📧 Email: admin@example.com
🔑 Password: Admin@123456
```

### 6. Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại: `https://ngohung.io.vn`

---

## 📖 API Documentation

### 🔓 Public APIs (Client App)

#### 1. Check License / Request Trial

**Endpoint:** `POST /api/license/check`

**Request Body:**
```json
{
  "deviceId": "ABC123-DEF456-GHI789",
  "toolType": "veo",
  "licenseKey": "ABC123|Owner|2025-12-31|base64sig...",  // Optional
  "hostname": "DESKTOP-PC",  // Optional
  "ipAddress": "192.168.1.100"  // Optional
}
```

**Response (Trial Granted):**
```json
{
  "success": true,
  "trial": true,
  "license": {
    "type": "TRIAL",
    "expiresAt": "2025-11-07T00:00:00.000Z",
    "owner": "Trial Version",
    "daysRemaining": 1
  },
  "message": "Trial version granted (1 day)"
}
```

**Response (Valid License):**
```json
{
  "success": true,
  "license": {
    "type": "YEARLY",
    "expiresAt": "2026-11-06T00:00:00.000Z",
    "owner": "John Doe",
    "daysRemaining": 365
  }
}
```

**Response (Trial Already Used):**
```json
{
  "success": false,
  "error": "Trial period has been used for this device",
  "trialUsed": true
}
```

---

### 🔐 Admin APIs (Require Authentication)

#### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

#### 1. Admin Login

**Endpoint:** `POST /api/admin/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "clxxxx",
    "email": "admin@example.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN"
  }
}
```

#### 2. Create License

**Endpoint:** `POST /api/admin/license/create`

**Request:**
```json
{
  "deviceId": "ABC123-DEF456-GHI789",
  "toolType": "veo",
  "owner": "John Doe",
  "type": "YEARLY",  // TRIAL | MONTHLY | YEARLY | LIFETIME | CUSTOM
  "days": 365  // Required only for CUSTOM type
}
```

**Response:**
```json
{
  "success": true,
  "license": {
    "id": "clxxxx",
    "licenseKey": "ABC123|John Doe|2026-11-06|iR0TQTY...",
    "deviceId": "ABC123-DEF456-GHI789",
    "toolType": "veo",
    "type": "YEARLY",
    "owner": "John Doe",
    "expiresAt": "2026-11-06T00:00:00.000Z",
    "daysRemaining": 365
  }
}
```

#### 3. List Licenses

**Endpoint:** `GET /api/admin/licenses?page=1&limit=50&status=ACTIVE&toolType=veo`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `status`: Filter by status (ACTIVE, EXPIRED, REVOKED, SUSPENDED)
- `toolType`: Filter by tool type
- `deviceId`: Search by device ID
- `type`: Filter by license type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxx",
      "licenseKey": "ABC123|John|2026-11-06|sig...",
      "deviceId": "ABC123-DEF456-GHI789",
      "toolType": "veo",
      "type": "YEARLY",
      "status": "ACTIVE",
      "owner": "John Doe",
      "issuedAt": "2025-11-06T10:00:00.000Z",
      "expiresAt": "2026-11-06T00:00:00.000Z",
      "device": {
        "deviceId": "ABC123-DEF456-GHI789",
        "hostname": "DESKTOP-PC",
        "firstSeen": "2025-11-06T09:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

#### 4. Revoke License

**Endpoint:** `POST /api/admin/license/revoke`

**Request:**
```json
{
  "licenseId": "clxxxx",
  "reason": "User refund request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License revoked successfully"
}
```

#### 5. Get Statistics

**Endpoint:** `GET /api/admin/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLicenses": 150,
    "activeLicenses": 120,
    "expiredLicenses": 25,
    "totalDevices": 145,
    "recentActivities": [
      {
        "action": "CREATE_LICENSE",
        "createdAt": "2025-11-06T10:30:00.000Z",
        "admin": {
          "email": "admin@example.com",
          "name": "Super Admin"
        }
      }
    ]
  }
}
```

---

## 🖥️ Admin Dashboard

### Login
URL: `https://ngohung.io.vn/admin/login`

Credentials:
- Email: `admin@example.com`
- Password: `Admin@123456`

### Features
- 📊 Dashboard với statistics
- 📋 License management (create, view, revoke)
- 💻 Device tracking
- 📝 Activity logs
- 🔍 Search & filters

---

## 🔗 Integration với Python App

### Update Python Client Code

File: `GenVideoPro_v2.py`

```python
import requests
import winreg

def get_machine_guid():
    """Lấy MachineGuid từ Registry"""
    try:
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Cryptography") as k:
            v, _ = winreg.QueryValueEx(k, "MachineGuid")
        return str(v).strip()
    except Exception:
        return ""

def check_license(license_key=None):
    """Check license với server"""
    API_URL = "https://ngohung.io.vn/api/license/check"
    
    payload = {
        "deviceId": get_machine_guid(),
        "toolType": "veo",
    }
    
    if license_key:
        payload["licenseKey"] = license_key
    
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        data = response.json()
        
        if data.get("success"):
            license_info = data.get("license", {})
            print(f"✅ License valid: {license_info.get('type')}")
            print(f"📅 Expires: {license_info.get('expiresAt')}")
            print(f"⏰ Days remaining: {license_info.get('daysRemaining')}")
            return True
        else:
            print(f"❌ License error: {data.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Network error: {e}")
        return False

# Usage
if __name__ == "__main__":
    # Check with license key
    license_key = "ABC123|Owner|2026-11-06|signature..."
    check_license(license_key)
    
    # Or check without key (will auto-grant trial if first time)
    check_license()
```

---

## 🛡️ Security Best Practices

### Production Deployment

1. **Environment Variables**
   - Đổi `JWT_SECRET` thành random string mạnh
   - Dùng password phức tạp cho SQL Server
   - Đổi admin password sau lần đầu login

2. **SSL/TLS**
   - Bắt buộc HTTPS cho production
   - Update `DATABASE_URL` với `encrypt=true`

3. **Rate Limiting**
   - Implement Redis cho production
   - Giới hạn requests per IP/device

4. **Monitoring**
   - Setup log monitoring
   - Track suspicious activities
   - Alert on unusual license creations

5. **Database**
   - Backup định kỳ
   - Encrypt sensitive data
   - Use connection pooling

---

## 📊 Database Schema

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   Admin     │       │   Device    │       │   License       │
├─────────────┤       ├─────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)         │
│ email       │       │ deviceId    │◄──────│ deviceId (FK)   │
│ password    │       │ hostname    │       │ licenseKey      │
│ role        │       │ firstSeen   │       │ toolType        │
└─────────────┘       │ trialUsed   │       │ type            │
       │              └─────────────┘       │ status          │
       │                                    │ expiresAt       │
       │              ┌─────────────────┐   └─────────────────┘
       │              │  ActivityLog    │
       └──────────────►├─────────────────┤
                      │ id (PK)         │
                      │ adminId (FK)    │
                      │ action          │
                      │ details         │
                      └─────────────────┘
```

---

## 🔧 Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## 📝 License Types Reference

| Type | Duration | Use Case |
|------|----------|----------|
| `TRIAL` | 1 day | Auto-granted first time |
| `MONTHLY` | 30 days | Monthly subscription |
| `YEARLY` | 365 days | Annual subscription |
| `LIFETIME` | 10000 days (~27 years) | One-time purchase |
| `CUSTOM` | Custom days | Special cases |

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check SQL Server is running
# Update DATABASE_URL in .env
# Test connection:
npx prisma db push
```

### Admin Login Failed

```bash
# Reset admin password
npx prisma db seed
```

### License Verification Failed

- Check RSA keys match between Node.js and Python
- Verify license format: `DID|OWNER|YYYY-MM-DD|SIGNATURE`
- Check expiry date

---

## 📧 Support

For issues or questions:
- Check logs: `vgp_errors.log`
- Review Activity Logs in admin dashboard
- Check database with Prisma Studio

---

## 🎉 Done!

Hệ thống license management hoàn chỉnh với:
✅ Auto trial 1 day per device
✅ Bảo mật tuyệt đối
✅ Admin dashboard
✅ API đầy đủ
✅ SQL Server integration
✅ Compatible với Python app

Happy licensing! 🚀

