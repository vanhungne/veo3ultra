# 🚀 Hướng dẫn Deploy License System

## 📋 Tổng quan

Project đã được upload lên GitHub: https://github.com/vanhungne/veo3ultra.git

## 🔧 Các bước Deploy

### Option 1: Deploy lên Vercel (Recommended - Miễn phí)

1. **Đăng ký/Đăng nhập Vercel**
   - Truy cập: https://vercel.com
   - Đăng nhập bằng GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Chọn repository `veo3ultra`
   - Click "Import"

3. **Cấu hình Environment Variables**
   - Trong project settings, vào "Environment Variables"
   - Thêm các biến sau:
     ```
     DATABASE_URL=sqlserver://your-server:1433;database=LicenseDB;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true
     JWT_SECRET=your-super-secret-jwt-key-change-this
     ADMIN_EMAIL=admin@example.com
     ADMIN_PASSWORD=Admin@123456
     TRIAL_DAYS=1
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel sẽ tự động build và deploy
   - Sau khi deploy xong, bạn sẽ có URL như: `https://veo3ultra.vercel.app`

5. **Setup Database (SQL Server)**
   - Vercel không hỗ trợ SQL Server trực tiếp
   - Cần sử dụng SQL Server cloud service (Azure SQL, AWS RDS, hoặc self-hosted)
   - Chạy Prisma migrations sau khi deploy:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```

---

### Option 2: Deploy lên Railway

1. **Đăng ký Railway**
   - Truy cập: https://railway.app
   - Đăng nhập bằng GitHub

2. **New Project**
   - Click "New Project"
   - Chọn "Deploy from GitHub repo"
   - Chọn repository `veo3ultra`

3. **Cấu hình Environment Variables**
   - Thêm các biến môi trường như trên

4. **Add Database (PostgreSQL/MySQL)**
   - Railway hỗ trợ PostgreSQL/MySQL
   - Nếu cần SQL Server, phải dùng service khác hoặc self-hosted

---

### Option 3: Deploy lên VPS/Server (Self-hosted)

1. **Chuẩn bị Server**
   ```bash
   # Cài đặt Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Cài đặt SQL Server (nếu chưa có)
   # Xem hướng dẫn: https://docs.microsoft.com/sql/linux/sql-server-linux-setup
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/vanhungne/veo3ultra.git
   cd veo3ultra
   ```

3. **Cài đặt Dependencies**
   ```bash
   npm install
   ```

4. **Cấu hình Environment**
   ```bash
   # Tạo file .env
   cp .env.example .env
   # Sửa file .env với thông tin của bạn
   ```

5. **Setup Database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npx prisma db seed
   ```

6. **Build và Start**
   ```bash
   npm run build
   npm start
   ```

7. **Setup PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "license-system" -- start
   pm2 save
   pm2 startup
   ```

8. **Setup Nginx (Reverse Proxy)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Setup SSL với Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📝 Lưu ý quan trọng

### 1. Database Connection
- Đảm bảo SQL Server có thể truy cập từ internet (nếu deploy cloud)
- Cấu hình firewall để cho phép connection từ Vercel/Railway IPs
- Sử dụng connection string với `encrypt=true` và `trustServerCertificate=true`

### 2. Environment Variables
- **KHÔNG BAO GIỜ** commit file `.env` lên GitHub
- File `.env` đã được thêm vào `.gitignore`
- Tạo `.env.example` để hướng dẫn người khác

### 3. Security
- Đổi `JWT_SECRET` thành random string mạnh
- Đổi `ADMIN_PASSWORD` sau lần đầu login
- Sử dụng HTTPS trong production
- Cấu hình CORS nếu cần

### 4. Database Migrations
- Chạy migrations sau mỗi lần deploy:
  ```bash
  npx prisma migrate deploy
  ```

### 5. Monitoring
- Setup error tracking (Sentry, LogRocket, etc.)
- Monitor database performance
- Setup backup tự động cho database

---

## 🔗 URLs sau khi Deploy

- **Frontend/API**: `https://your-domain.com`
- **Admin Dashboard**: `https://your-domain.com/admin/login`
- **API Health Check**: `https://your-domain.com/api/health`

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Test connection
npx prisma db push
```

### Build Error
```bash
# Clear cache và rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Tìm process đang dùng port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

---

## ✅ Checklist trước khi Deploy

- [ ] Environment variables đã được cấu hình
- [ ] Database đã được setup và migrate
- [ ] Admin account đã được tạo (seed)
- [ ] SSL certificate đã được setup (production)
- [ ] CORS đã được cấu hình (nếu cần)
- [ ] Error tracking đã được setup
- [ ] Backup database đã được cấu hình
- [ ] Monitoring đã được setup

---

## 🎉 Hoàn tất!

Sau khi deploy thành công, bạn có thể:
- Truy cập admin dashboard
- Tạo license cho users
- Monitor activities
- Quản lý devices

Chúc bạn deploy thành công! 🚀

