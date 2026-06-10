# 🐳 Mordin Soil Analysis System - Docker Deployment Guide

ระบบนี้ถูกเตรียม Dockerfile และ `docker-compose.yml` ไว้ที่ระดับ Root เรียบร้อยแล้ว ทำให้คุณสามารถ Deploy ทั้งระบบผ่าน **Docker** และ **Docker Compose** ได้ง่ายดาย ไม่ว่าจะบนเครื่องส่วนตัว (Local) หรือบนเซิร์ฟเวอร์ส่วนตัว (VPS / Cloud VM)

---

## 📋 สิ่งที่ต้องติดตั้งก่อน (Prerequisites)
1. **Docker**: ติดตั้งให้เรียบร้อย ([Docker Installation Guide](https://docs.docker.com/get-docker/))
2. **Docker Compose**: ปกติจะมาพร้อมกับ Docker Desktop หรือสามารถติดตั้งเพิ่มได้หากอยู่บน Linux VPS

---

## 🚀 ขั้นตอนการ Deploy ด้วย Docker Compose

### 1. ดึงโค้ดลงเครื่องเซิร์ฟเวอร์ (VPS / Local)
```bash
git clone https://github.com/songwutKitloedphanit/mordin-new.git
cd mordin-new
```

### 2. ตั้งค่า Environment Variables (.env)
เนื่องจากแต่ละระบบแยกคอนฟิกออกจากกัน ให้เตรียมไฟล์ `.env` สำหรับ backend ก่อนรัน:

- สร้างไฟล์ `mordin-backend/.env` โดยคัดลอกรูปแบบมาจาก `mordin-backend/.env.example2`
- กำหนดค่าฐานข้อมูลและคีย์สำหรับความปลอดภัยให้เรียบร้อย (ตัวอย่าง):
  ```env
  PORT=3000
  POSTGRES_HOST=mordin-database  # (ใช้ชื่อ service ใน docker-compose.yml หรือเซิร์ฟเวอร์ภายนอก)
  POSTGRES_PORT=5432
  POSTGRES_USER=avnadmin
  POSTGRES_PASSWORD=your_password
  POSTGRES_DB=defaultdb
  POSTGRES_SSL=false  # ปิด SSL หากรันใน network เดียวกันใน Docker
  
  # ชี้ฐานข้อมูล Logs ไปที่เดียวกัน
  POSTGRES_LOGS_HOST=mordin-database
  POSTGRES_LOGS_PORT=5432
  POSTGRES_LOGS_USER=avnadmin
  POSTGRES_LOGS_PASSWORD=your_password
  POSTGRES_LOGS_DB=defaultdb
  POSTGRES_LOGS_SSL=false
  
  QR_SECRET=some_random_secret_string
  JWT_ACCESS_SECRET=some_random_secret_string
  JWT_ACCESS_EXPIRATION=1d
  ```

### 3. รันระบบทั้งหมดผ่าน Docker Compose
รันคำสั่งนี้ที่ Root Directory เพื่อสั่ง Build และรันบริการทั้ง 3 ตัวขึ้นมาในแบบ Background:
```bash
docker-compose up -d --build
```

**บริการที่จะรันขึ้นมา:**
- **`mordin-backend`**: พอร์ต `3000`
- **`mordin-public`**: พอร์ต `8080` (เว็บสำหรับบุคคลทั่วไป)
- **`mordin-private`**: พอร์ต `8081` (ระบบจัดการของเจ้าหน้าที่)

---

## 🗄️ การกู้คืนฐานข้อมูลบน Docker (Restore Database)

หากคุณใช้ Docker Compose ในการรัน PostgreSQL ด้วย (หรือรันฐานข้อมูลแยกไว้) คุณสามารถนำเข้าข้อมูลแบ็กอัปด้วยวิธีนี้:

1. **คัดลอกไฟล์ backup เข้าไปใน container ของ Postgres**:
   ```bash
   docker cp db-backups/20260604_095337_schema_restored/main.full.dump <postgres-container-id-or-name>:/main.full.dump
   ```
2. **รันคำสั่ง restore ใน container**:
   ```bash
   docker exec -it <postgres-container-id-or-name> pg_restore -U <postgres-user> -d <postgres-db> --clean --if-exists --no-owner --no-privileges /main.full.dump
   ```
