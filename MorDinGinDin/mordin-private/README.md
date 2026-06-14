# Mordin (Private) v0.1.0-alpha

A web application built with **React**, **TypeScript**, and **Vite**.
Using CSS: **Bootstrap5**, **kaiadmin**.

---

# 🧠 Git Workflow สำหรับทีม

> เพื่อให้ทีมพัฒนาทำงานร่วมกันได้อย่างมีประสิทธิภาพและไม่เกิดความสับสน เราจะใช้ Git Workflow นี้เป็นมาตรฐานกลางของทีม

---
## 📍 ข้อควรปฏิบัติ

1. หากสงสัยตรงส่วนไหนของงานหรือ flow ควรถาม เพื่อแนวทางที่ถูกต้อง
2. ทำเฉพาะงานหรือ Tasks ที่ตนเองได้รับมอบหมายเพื่อไม่ให้กระทบต่อการทำงานโดยรวม
---

## 📂 สาขาหลัก (Main Branches)

| Branch | หน้าที่ |
|--------|----------|
| `main` | เก็บโค้ดที่ผ่านการทดสอบและพร้อมใช้จริง (Production) |
| `dev`  | เก็บโค้ดล่าสุดที่รวมจากทุกฟีเจอร์ (Development รวม) |

---

## 1. การตั้งชื่อ Branch

ตั้งชื่อสาขาให้สื่อถึงประเภทของงานและฟีเจอร์ที่เกี่ยวข้อง  
รูปแบบ: `prefix/ชื่อฟีเจอร์`

| Prefix | ใช้เมื่อ... | ตัวอย่าง |
|--------|-------------|----------|
| `feature/` | เพิ่มฟีเจอร์ใหม่ | `feature/land-add` |
| `fix/`     | แก้บั๊ก | `fix/farmer-validation` |
| `refactor/` | ปรับโครงสร้างโค้ดโดยไม่เปลี่ยนผลลัพธ์ | `refactor/soil-cleanup` |
| `clean/` | แก้ไขเพื่อให้ build ผ่านหรือจัดระเบียบโค้ดเบื้องต้น | `clean/init-error-fix` |
| `chore/` | งานเบ็ดเตล็ด เช่น ปรับ config, script | `chore/update-eslint` |
| `docs/` | ปรับปรุงเอกสาร | `docs/readme-update` |

> ❗ ควรแยกฟีเจอร์เป็น branch เดี่ยวๆ ไม่ควรรวมหลายฟีเจอร์ใน branch เดียว เช่น `bus-land-farmer`

---

## 2. Commit Message Convention

ใช้รูปแบบ `type: รายละเอียด` (ภาษาไทยหรืออังกฤษก็ได้ แต่ให้สื่อความหมายชัด)

| Type | ใช้เมื่อ... |
|------|--------------|
| `feat` | เพิ่มฟีเจอร์ใหม่ |
| `fix`  | แก้บั๊ก |
| `refactor` | ปรับโค้ดโดยไม่เปลี่ยนผลลัพธ์ |
| `chore` | งาน config หรือเบ็ดเตล็ด |
| `docs` | แก้ไขหรือเพิ่มเอกสาร |
| `style` | แก้โค้ดที่ไม่กระทบ logic เช่น spacing, format |

**ตัวอย่าง:**
```bash
feat: เพิ่มปุ่มค้นหาในหน้า land
fix: แก้ validation ของ farmer ที่ไม่ขึ้นข้อความแจ้งเตือน
refactor: ย้าย logic ของ SoilService ไป common module
```

---

## 3. Workflow 🔁 

1. **เริ่มต้นจาก branch พัฒนาหลัก** (ในตอนนี้เป็น main อยู่ ยังไม่มี dev)
   - ตรวจสอบให้แน่ใจว่าอยู่ใน branch `dev` และเป็นเวอร์ชันล่าสุด เพื่อที่ตอนทำขั้น 2 จะแตกกิ่งไปจาก dev ที่เป็นเวอร์ชั้นล่าสุด
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **สร้าง branch ใหม่สำหรับงาน**
   - ตั้งชื่อ branch ตามประเภทและฟีเจอร์ เช่น `feature/land-add`
   ```bash
   git checkout -b feature/land-add
   ```

3. **แก้ไขโค้ดและ commit**
   - ทำการแก้ไขโค้ดตามฟีเจอร์หรืองานที่ได้รับมอบหมาย
   - Commit โดยใช้รูปแบบ `type: รายละเอียด` ที่ชัดเจน
   ```bash
   git add .
   git commit -m "feat: เพิ่มฟอร์มลงทะเบียนที่ดิน"
   ```

4. **ถ้าต้องการแก้ไข commit ล่าสุด**
   - หากต้องการปรับปรุงข้อความ commit หรือเพิ่มไฟล์
   ```bash
   git commit --amend
   ```

5. **push ขึ้น remote พร้อมตั้ง tracking branch**
   - ส่งโค้ดขึ้น GitHub ตั้งแต่ commit แรก เพื่อให้ทีมเห็นความคืบหน้า
   ```bash
   # ใส่ -u หากไม่ต้องการพิมชื่อกิ่งทุกครั้งตอน push หรือ pull รอบหน้า
   # ในข้ออื่นๆ จะสมมติกรณีไม่ได้ใส่ -u ดังนั้นจะพิมพ์ชื่อกิ่งทุกรอบเพื่อความชัดเจน
   git push -u origin feature/land-add
   ```

6. **เปิด Draft Pull Request**
   - ไปที่ GitHub และสร้าง Draft Pull Request (PR) จาก branch ของคุณไปยัง `dev`
   ```bash
    1.ไปตรงส่วนของ code ในหน้า GitHub บนเว็บ
    2.เลือกกิ่งไปที่กิ่งตัวเอง
    3.กด Cintribute แล้วเลือก Open Pull Request
    4.ตั้งให้ compare กิ่งตัวเองไปเทียบกับ dev(base)
    5.กด Create draft pull request
        - สำหรับเครื่องคนที่ไม่มี extensions ใดๆ ให้กดปุ่มสามเหลี่ยมข้าง Create pull request ก็จะเจอ
   ```
   - อธิบายรายละเอียดของงานใน PR เพื่อให้ทีมเข้าใจ

7. **ทำงานต่อและ commit เพิ่มเติม**
   - ระหว่างพัฒนา ให้ commit และ push อย่างสม่ำเสมอเมื่อมีงานคืบหน้า
   ```bash
   git add .
   git commit -m "fix: แก้ validation ของฟอร์มที่ดิน"
   git push origin feature/land-add
   ```
   - หากเป็น commit ที่ไม่ได้มีอะไรเปลี่ยนแปลงมากและไม่ต้องการสร้าง commit ใหม่ให้ทำตามนี้
   ```bash
   git add .
   git commit --amend
   git push origin feature/land-add --force-with-lease
   ```

8. **อัปเดตจาก `dev` เพื่อหลีกเลี่ยง conflict**
   - หากไม่มั่นใจเรื่องการ rebase หรือการแก้ conflict ด้วยตัวเองให้ข้ามข้อ 8 ไปหรือไปติดต่อ PM เพื่อป้องกันการเกิดปัญหาและความเละ ❗❗
   - ก่อนส่งงานขั้นสุดท้าย ตรวจสอบและรวมการเปลี่ยนแปลงล่าสุดจาก `dev`
   ```bash
   # 1.ไปอัพเดท dev ใน local ให้เป็น version ล่าสุด
   git checkout dev
   git pull origin dev

   # 2.กลับไปที่กิ่งตัวเองแล้ว rebase dev เพื่อให้งานตัวเองเป็น version ล่าสุดตาม dev
   git checkout feature/land-add
   git rebase dev

   # 3.หากมี conflict ให้แก้ให้เสร็จแต่หากไม่มีแล้วขึ้น rebase success ให้ไปขั้น 4
   # 3.1 แก้ conflict ให้เรียบร้อย
   git rebase --continue

   # 4. push version ล่าสุดของงานเราขึ้น remote
   git push origin feature/land-add --force-with-lease

   ```

9. **เปลี่ยน PR เป็น Ready for Review**
   - เมื่องานเสร็จสมบูรณ์ เปลี่ยน Draft PR เป็น **Ready for Review** บน GitHub
   - รอ reviewer ตรวจสอบและให้ feedback
   - หากต้องแก้ไขเพิ่มเติม ทำการ commit และ push ต่อไป

10. **merge เข้า `dev`**
    - เมื่อ PR ได้รับการอนุมัติ Reviewer/PM จะเป็นคนรวมเข้า dev ให้



---

## 🧠 ข้อควรรู้และคำแนะนำ

- อย่า commit ตรงเข้า `main` หรือ `dev`
- 1 branch ต่อ 1 ฟีเจอร์/เรื่องที่ชัดเจน
- ถ้า `push` แล้วใช้ `--amend` ต้อง `--force-with-lease` เท่านั้น

---

## ✅ ตัวอย่าง Workflow แบบเต็ม

```bash
# เริ่มต้นจาก branch พัฒนาหลัก
git checkout dev
git pull origin dev

# สร้าง branch งานที่ทำ (ตั้งชื่อให้ชัดเจน Ex. feature/create-user) 
git checkout -b <prefix>/<feature-name>

# ทำงานแก้ไขโค้ด + commit (Ex. "feat: คำอธิบายสั้น ๆ ของงาน")
git add .
git commit -m "<type>: <detail>"

# push ขึ้น remote ตั้งแต่ commit แรก พร้อมตั้ง tracking branch
# หากไม่ตั้ง tracking ก็ลบ -u ออกแล้วตอน push หรือ pull ก็เขียน origin <ชื่อกิ่ง> ตลอด
git push -u origin <prefix>/<feature-name>

# เปิด Draft Pull Request บน GitHub ทันที (หรือหลัง push)

# ในระหว่างทำงาน ให้ commit และ push เพิ่มเติมเรื่อย ๆ (EX. "fix: แก้บั๊กบางอย่าง")
git add .
git commit -m "<type>: <detail>"
git push

#เมื่อพร้อมให้รีวิว เปลี่ยน Draft PR เป็น Ready for review บน GitHub
```

---

> ถ้าไม่แน่ใจว่าควรตั้งชื่อ branch หรือ commit ยังไง ให้ถามก่อน push 🙌

---

## 📚 ศัพท์ที่ควรรู้ (Git & Workflow)

### 🧱 Git Basics

| คำศัพท์ | ความหมาย |
|---------|----------|
| **Repository (Repo)** | พื้นที่เก็บโค้ดทั้งหมดของโปรเจกต์ ทั้งในเครื่อง (local) และบน remote เช่น GitHub |
| **Branch** | กิ่งของโค้ดที่แยกออกมาเพื่อพัฒนาฟีเจอร์หรือแก้บั๊กโดยไม่กระทบกับโค้ดหลัก |
| **Commit** | การบันทึกการเปลี่ยนแปลงของไฟล์ พร้อมข้อความอธิบายว่าเปลี่ยนอะไร ทำไม |
| **Staging Area** | พื้นที่พักไฟล์ก่อน commit (ใช้คำสั่ง `git add` เพื่อส่งเข้า staging) |
| **HEAD** | ตัวชี้ตำแหน่ง commit ปัจจุบันที่เรากำลังทำงานอยู่ |
| **Working Directory** | โฟลเดอร์ที่มีไฟล์โค้ดของเรา ใช้แก้ไขและเปลี่ยนแปลงก่อน commit |

---

### 🔁 Branching & Merging

| คำศัพท์ | ความหมาย |
|---------|----------|
| **Local Branch** | branch ที่อยู่ในเครื่องของเราเอง ยังไม่ push ขึ้น remote |
| **Remote Branch** | branch ที่อยู่บน server เช่น GitHub, GitLab |
| **Tracking Branch** | การเชื่อมโยงระหว่าง local branch กับ remote branch ทำให้ push/pull ได้ง่ายขึ้น |
| **Merge** | รวมโค้ดจาก branch หนึ่งเข้ากับอีก branch หนึ่ง โดยรักษา commit แยกไว้ (ใช้ `git merge`) |
| **Rebase** | ปรับฐานของ commit จาก branch ปัจจุบันให้ต่อท้าย branch เป้าหมาย ทำให้ประวัติสะอาด (ใช้ `git rebase`) |
| **Conflict** | เกิดเมื่อมีการแก้ไฟล์เดียวกันใน branch ต่างกัน แล้ว merge หรือ rebase ทำให้ Git ไม่รู้ว่าควรใช้เวอร์ชันไหน |

---

### 🚀 Collaboration & Workflow

| คำศัพท์ | ความหมาย |
|---------|----------|
| **Pull Request (PR)** | คำขอให้รวม branch หนึ่งเข้าอีก branch หนึ่ง พร้อมให้ทีมช่วยกันรีวิว |
| **Draft PR** | PR ที่ยังไม่สมบูรณ์ ใช้แชร์ความคืบหน้าเบื้องต้นหรือขอ feedback |
| **Review** | การตรวจสอบโค้ดที่อยู่ใน PR ก่อนอนุมัติให้ merge ได้ |
| **Approve** | การยืนยันว่ารีวิวแล้ว โค้ดโอเค พร้อม merge |
| **Comment** | ข้อเสนอแนะ/คำถามที่เขียนลงใน PR เพื่อให้ปรับปรุงหรืออธิบายเพิ่มเติม |
| **CI/CD** | ย่อมาจาก Continuous Integration / Continuous Deployment – กระบวนการทดสอบและนำโค้ดขึ้นจริงอัตโนมัติเมื่อ PR ถูก merge |
| **Main / Dev Branch** | `main` มักเป็น branch ที่พร้อมนำขึ้น production ส่วน `dev` ใช้รวมโค้ดที่อยู่ระหว่างพัฒนา |

---

### ⚠️ Commands & Safety Tips

| คำศัพท์ | ความหมาย |
|---------|----------|
| **Force Push** | การ push แบบเขียนทับประวัติ commit เดิม ต้องใช้ด้วยความระมัดระวัง (ควรใช้ `--force-with-lease`) |
| **Reset** | คำสั่งล้างหรือย้อนสถานะของ branch ให้กลับไปยัง commit ก่อนหน้า |
| **Revert** | สร้าง commit ใหม่ที่ย้อนการเปลี่ยนแปลงของ commit เดิม โดยไม่ลบประวัติ |
| **Cherry-pick** | การเลือก commit เฉพาะบางอันจาก branch หนึ่งมาวางในอีก branch |
| **Stash** | เก็บการเปลี่ยนแปลงชั่วคราวโดยไม่ commit ไว้ แล้วสามารถดึงกลับมาใช้ภายหลัง (`git stash`) |

---

### 🧩 อื่น ๆ ที่เจอบ่อย

| คำศัพท์ | ความหมาย |
|---------|----------|
| **Squash** | การรวมหลาย ๆ commit เข้าด้วยกันเป็น commit เดียว เพื่อให้ประวัติสะอาด (มักใช้ตอน merge PR) |
| **Fast-forward Merge** | การ merge แบบที่ไม่ต้องสร้าง commit ใหม่ เพราะ branch ปลายทางตามทัน branch ต้นทางพอดี |
| **Detached HEAD** | สถานะที่ HEAD ไม่ชี้อยู่บน branch ใด ๆ (มักเกิดตอน checkout ไปยัง commit โดยตรง) |
| **.gitignore** | ไฟล์ที่ระบุว่าไฟล์/โฟลเดอร์ไหนไม่ควรถูก track หรือ push ขึ้น repository เช่น `node_modules` |