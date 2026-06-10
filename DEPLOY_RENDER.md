# 🚀 Mordin Soil Analysis System - Render Deployment Guide

ระบบนี้ถูกออกแบบมาเพื่อรองรับการทำงานแบบ Containerized ซึ่งคุณสามารถทำการ Deploy บน [Render](https://render.com/) ได้ทันทีโดยใช้ไฟล์ `render.yaml` (Render Blueprint) ที่เตรียมไว้ให้

---

## 🛠️ วิธีการ Deploy ด้วย Render Blueprint

1. **เข้าสู่ระบบ Render**:
   - ไปที่ [Render Dashboard](https://dashboard.render.com/) แล้วเข้าสู่ระบบ
2. **สร้าง Blueprint Instance**:
   - คลิกปุ่ม **New** (ปุ่มสีฟ้ามุมขวาบน) -> เลือก **Blueprint**
   - เชื่อมต่อบัญชี GitHub ของคุณและเลือก Repository `mordin-new`
3. **กำหนดค่าสำหรับการ Deploy**:
   - ระบบจะตรวจจับไฟล์ `render.yaml` อัตโนมัติและแสดงบริการต่าง ๆ ที่ต้องการสร้าง
   - **กรอกข้อมูลที่จำเป็น**:
     - **Service Name** หรือกลุ่มบริการ
     - **Vite Build Arguments** สำหรับ `mordin-private` (React):
       - `VITE_API_URL`: ระบุ URL สาธารณะของ Backend (เช่น `https://mordin-backend-xxx.onrender.com`)
       - `VITE_BASE_URL`: ระบุ URL สาธารณะของตัวมันเอง (เช่น `https://mordin-private-xxx.onrender.com`)
       - `VITE_PUBLIC_APP_URL`: ระบุ URL สาธารณะของเว็บหน้าบ้าน (เช่น `https://mordin-public-xxx.onrender.com`)
       
       *💡 คำแนะนำ: ในการ Deploy ครั้งแรก หากยังไม่ทราบ URL ของบริการอื่น ๆ สามารถใช้ URL ตัวอย่างไปก่อนได้ เมื่อ Render สร้าง URL จริงให้เรียบร้อยแล้ว ให้กลับมาแก้ไข Environment Variables/Build Args บน Render Dashboard แล้วกด Deploy อีกครั้งหนึ่ง*
4. **กด Deploy**:
   - คลิก **Apply** เพื่อเริ่มการทำ Build และ Deploy ระบบทั้งหมด

---

## 📂 โครงสร้างบริการของระบบบน Render

1. **mordin-db** (PostgreSQL Database)
   - ฐานข้อมูล Postgres สำหรับเก็บข้อมูลระบบและ logs
2. **mordin-backend** (NestJS Web Service)
   - ทำงานบนพอร์ต `3000` (Docker Environment)
   - มีระบบรัน Migration ฐานข้อมูลอัตโนมัติก่อนเริ่มเซิร์ฟเวอร์
3. **mordin-public** (PHP Web Service)
   - ทำงานบนพอร์ต `80` (Docker Environment)
   - เชื่อมต่อกับ Backend ผ่าน Private Network ของ Render (`http://mordin-backend:3000/`) ซึ่งทำให้การเชื่อมต่อมีความเสถียร รวดเร็ว และไม่ต้องผ่านอินเทอร์เน็ตสาธารณะ
4. **mordin-private** (React SPA Nginx Web Service)
   - ทำงานบนพอร์ต `80` (Docker Environment)
   - ใช้ Nginx ในการ Serve ไฟล์ Static React หน้าบ้าน

---

## 🔑 ข้อมูลสำคัญ / ข้อควรระวัง

- **การอัปเดต Migration**: ไฟล์ `Dockerfile` ของ Backend มีการรันคำสั่ง `node scripts/migrate.js up` ก่อนเริ่มโปรแกรมเสมอ ดังนั้นหากคุณมีการแก้ไขฐานข้อมูล ระบบจะอัปเดต Schema ให้โดยอัตโนมัติ
- **SSL**: ระบบ Render จะเปิดใช้งาน SSL (`https`) ให้กับทุก Web Service โดยอัตโนมัติ
