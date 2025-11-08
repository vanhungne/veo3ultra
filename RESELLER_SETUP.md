# Reseller Setup Guide

## Tổng quan

Hệ thống hỗ trợ role **RESELLER** để quản lý reseller của bạn. Reseller chỉ có thể tạo license với các gói cố định:
- **1 Tháng** (30 ngày)
- **3 Tháng** (90 ngày)
- **6 Tháng** (180 ngày)
- **1 Năm** (365 ngày)
- **2 Năm** (730 ngày)

Reseller **KHÔNG** có quyền:
- Extend license
- Revoke license
- Tạo license với số ngày tùy chỉnh

## Tạo Reseller User

### Cách 1: Qua Seed Script (Khuyến nghị)

Thêm vào file `.env`:

```env
RESELLER_EMAIL=reseller@example.com
RESELLER_PASSWORD=Reseller@123456
```

Sau đó chạy:

```bash
npx prisma db seed
```

### Cách 2: Qua SQL Server trực tiếp

```sql
-- Tạo reseller user
INSERT INTO admins (id, email, password, name, role, createdAt, updatedAt)
VALUES (
  NEWID(),
  'reseller@example.com',
  '$2a$12$...', -- Hash password bằng bcrypt (12 rounds)
  'Reseller Name',
  'RESELLER',
  GETDATE(),
  GETDATE()
);
```

**Lưu ý**: Bạn cần hash password bằng bcrypt với 12 rounds. Có thể dùng online tool hoặc script Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your-password', 12);
console.log(hash);
```

### Cách 3: Tạo qua Admin Panel (Nếu có API)

Hiện tại chưa có API để admin tạo reseller qua UI. Bạn có thể thêm API endpoint `/api/admin/reseller/create` nếu cần.

## Sử dụng

1. Reseller đăng nhập với email/password đã tạo
2. Vào Dashboard → Click "Create License (Reseller)"
3. Chọn Device ID, Tool Type, và Package (1 tháng, 3 tháng, 6 tháng, 1 năm, hoặc 2 năm)
4. Nhập Owner (optional)
5. Click "Create License"

## Log Activity

Tất cả các license được tạo bởi reseller sẽ được log với:
- **Action**: `SELLER_ADD`
- **Description**: `Reseller {email} ({name}) added license`
- **Details**: Bao gồm thông tin đầy đủ về license (deviceId, toolType, package, days, expiresAt, owner)

Bạn có thể xem log trong **Activities** page và filter theo `SELLER_ADD` để quản lý.

## Phân biệt Admin và Reseller

- **Admin**: Có thể tạo license với bất kỳ số ngày nào, extend, revoke
- **Reseller**: Chỉ có thể tạo license với các gói cố định (3 tháng, 6 tháng, 1 năm, 2 năm), không thể extend/revoke

## Security

- Reseller chỉ có thể truy cập endpoint `/api/reseller/license/create`
- API sẽ verify role `RESELLER` trước khi cho phép tạo license
- Tất cả activities đều được log với thông tin reseller (email, name)

