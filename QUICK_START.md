# 🚀 Quick Start Guide

## Setup trong 5 phút

### 1. Install Dependencies
```bash
cd license-system
npm install
```

### 2. Setup SQL Server Database
```sql
CREATE DATABASE LicenseDB;
```

### 3. Create .env file
```bash
# Copy và edit
cp env.example.txt .env
```

Edit `.env`:
```env
DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"
JWT_SECRET="change-this-to-random-string"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
```

### 4. Run Migrations & Seed
```bash
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
```

### 5. Start Server
```bash
npm run dev
```

## ✅ Test APIs

### Test 1: Health Check
```bash
curl https://ngohung.io.vn/api/health
```

### Test 2: Request Trial (First Time)
```bash
curl -X POST https://ngohung.io.vn/api/license/check \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST-DEVICE-123",
    "toolType": "veo"
  }'
```

Response:
```json
{
  "success": true,
  "trial": true,
  "license": {
    "type": "TRIAL",
    "expiresAt": "2025-11-07T00:00:00.000Z",
    "daysRemaining": 1
  },
  "message": "Trial version granted (1 day)"
}
```

### Test 3: Request Trial Again (Should Fail)
```bash
curl -X POST https://ngohung.io.vn/api/license/check \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST-DEVICE-123",
    "toolType": "veo"
  }'
```

Response:
```json
{
  "success": false,
  "error": "Trial period has been used for this device",
  "trialUsed": true
}
```

### Test 4: Admin Login
```bash
curl -X POST https://ngohung.io.vn/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123456"
  }'
```

Save the `token` from response!

### Test 5: Create License
```bash
curl -X POST https://ngohung.io.vn/api/admin/license/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "deviceId": "TEST-DEVICE-456",
    "toolType": "veo",
    "owner": "John Doe",
    "type": "YEARLY"
  }'
```

### Test 6: Check with License Key
```bash
curl -X POST https://ngohung.io.vn/api/license/check \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST-DEVICE-456",
    "toolType": "veo",
    "licenseKey": "LICENSE_KEY_FROM_PREVIOUS_RESPONSE"
  }'
```

## 🎉 Done!

Access admin dashboard: https://ngohung.io.vn/admin/login

**Credentials:**
- Email: admin@example.com
- Password: Admin@123456

---

## 🔗 Integration với Python App

Thêm vào `GenVideoPro_v2.py`:

```python
import requests
import winreg

def get_machine_guid():
    try:
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Cryptography") as k:
            v, _ = winreg.QueryValueEx(k, "MachineGuid")
        return str(v).strip()
    except:
        return ""

def check_license_online(license_key=None):
    """Check license với server"""
    API_URL = "https://ngohung.io.vn/api/license/check"
    
    payload = {
        "deviceId": get_machine_guid(),
        "toolType": "veo",
    }
    
    if license_key:
        # Read from C:\AppVeo\Settings\license_token.txt
        payload["licenseKey"] = license_key
    
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        data = response.json()
        
        if data.get("success"):
            return data.get("license")
        else:
            log_error(f"License check failed: {data.get('error')}")
            return None
    except Exception as e:
        log_error(f"License server unreachable: {e}")
        return None
```

---

## 📊 Monitor Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

---

## 🐛 Common Issues

### Database connection failed
- Check SQL Server is running
- Verify credentials in `.env`
- Test: `npx prisma db push`

### Admin login failed
- Re-run: `npx prisma db seed`
- Check password in `.env`

### License verification failed
- Ensure RSA keys match Python app
- Check license format
- Verify expiry date

---

**Need help?** Check full README.md for detailed documentation.

