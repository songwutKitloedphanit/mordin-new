# 📑 แผนผังระบบและฟังก์ชันการทำงานอย่างละเอียด (Mordin Detailed System Map)
*(ระบบวิเคราะห์ดินมอดิน - เจาะลึกระบบย่อย ฟังก์ชันการทำงาน และตรรกะกระบวนการ 8 ขั้นตอน)*

<style>
  .mordin-detail-container {
    font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #2d3748;
    line-height: 1.65;
    max-width: 1000px;
    margin: 0 auto;
  }
  .doc-header {
    background: linear-gradient(135deg, #1b4d3e 0%, #2e7d32 100%);
    color: #ffffff;
    padding: 35px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 15px rgba(27, 77, 62, 0.2);
  }
  .doc-header h2 {
    color: #ffffff !important;
    margin: 0 0 10px 0 !important;
    font-size: 2.3rem;
    font-weight: 700;
  }
  .doc-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.15rem;
  }
  .system-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  }
  .system-title {
    border-left: 5px solid #2e7d32;
    padding-left: 15px;
    color: #1b4d3e !important;
    font-size: 1.6rem;
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: bold;
  }
  .sys-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: bold;
    color: #fff;
    display: inline-block;
    margin-bottom: 10px;
  }
  .badge-backend { background-color: #4a5568; }
  .badge-private { background-color: #3182ce; }
  .badge-public { background-color: #dd6b20; }
  
  .nested-card {
    background: #f7fafc;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
  }
  .nested-title {
    font-weight: bold;
    color: #2b6cb0;
    font-size: 1.1rem;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .details-box {
    margin-top: 10px;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    background-color: #fff;
  }
  .details-box summary {
    padding: 10px 15px;
    background-color: #edf2f7;
    cursor: pointer;
    font-weight: bold;
    outline: none;
    border-radius: 6px 6px 0 0;
  }
  .details-box[open] summary {
    border-bottom: 1px solid #cbd5e0;
  }
  .details-content {
    padding: 15px;
    font-size: 0.92rem;
  }
  
  .table-custom {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  .table-custom th, .table-custom td {
    border: 1px solid #cbd5e0;
    padding: 10px 12px;
    text-align: left;
    font-size: 0.9rem;
  }
  .table-custom th {
    background-color: #f7fafc;
    color: #2d3748;
    font-weight: bold;
  }
  
  .step-card {
    border-left: 4px solid #48bb78;
    padding-left: 20px;
    margin-bottom: 25px;
  }
  .step-num {
    font-size: 1.3rem;
    font-weight: bold;
    color: #2f855a;
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>

<div class="mordin-detail-container">

  <!-- Header -->
  <div class="doc-header">
    <h2>Mordin Soil Analysis System Map</h2>
    <p>วิเคราะห์ระบบงาน ฟังก์ชันโมดูลทั้งหมด และความสัมพันธ์ระหว่างสถาปัตยกรรม 3 แอปร่วมกัน</p>
  </div>

  <!-- Section 1: ระบบที่มีอยู่ทั้งหมด -->
  <div class="system-card">
    <div class="system-title">📂 1. โครงสร้างระบบภาพรวม (System Architecture)</div>
    <p>ระบบวิเคราะห์ดินมอดิน (Mordin System) ประกอบด้วยการทำงานประสานกันของ 3 ส่วนงานหลัก (3 Sub-systems) ดังนี้:</p>
    
    <!-- System 1 Backend -->
    <div class="nested-card">
      <div class="sys-badge badge-backend">1. mordin-backend (NestJS API Server)</div>
      <div class="nested-title">⚙️ ระบบประมวลผลส่วนกลางและฐานข้อมูล (API & Database Layer)</div>
      <p style="font-size: 0.92rem; margin: 5px 0;">
        เป็นศูนย์กลางการเชื่อมต่อข้อมูลและการคำนวณทั้งหมด ใช้ <b>NestJS Framework (TypeScript)</b>, <b>TypeORM</b> และเก็บข้อมูลบน <b>PostgreSQL Database</b> โดยมีหน้าที่สำคัญ:
      </p>
      <ul style="font-size: 0.9rem; padding-left: 20px; margin: 5px 0;">
        <li>ระบบพิสูจน์ตัวตน (Authentication) และการแบ่งสิทธิ์แบบ Role-based Access Control (RBAC)</li>
        <li>API CRUD สำหรับจัดการข้อมูลพื้นฐาน (Farmers, Lands, Buses, Service Area, Labs, Calendars, ฯลฯ)</li>
        <li>ตรรกะการวิเคราะห์ (Lab Business Logic) ได้แก่ การประมวลผลเปรียบเทียบค่า Blank, Working Standard (Calibration Curve)</li>
        <li>เครื่องมือช่วยแปลผลแล็บดินอิงเกณฑ์มาตรฐาน (Standards) และจับคู่คำนวณการใช้ปุ๋ย (Fertilizer Recommendation)</li>
        <li>ระบบ Redis Cache สำหรับเก็บและสืบค้น opaque OTP tokens และ short-lived data ของระบบ Walk-in เพื่อป้องกันข้อมูลซ้ำซ้อน</li>
      </ul>
    </div>

    <!-- System 2 Private Web -->
    <div class="nested-card">
      <div class="sys-badge badge-private">2. mordin-private (React Client Dashboard)</div>
      <div class="nested-title">🔐 ระบบหลังบ้านสำหรับเจ้าหน้าที่และผู้บริหาร (Staff Portal)</div>
      <p style="font-size: 0.92rem; margin: 5px 0;">
        พัฒนาโดยใช้ <b>React 19</b>, <b>TypeScript</b>, <b>Vite</b> ตกแต่งหลักด้วย <b>Bootstrap 5 (Kaiadmin template)</b> และใช้ <b>Tailwind CSS</b> เจาะจงเฉพาะหน้า Executive Dashboard มีหน้าที่สำคัญ:
      </p>
      <ul style="font-size: 0.9rem; padding-left: 20px; margin: 5px 0;">
        <li><b>หน้าล็อกอินของเจ้าหน้าที่ (Login Guards):</b> ป้องกันสิทธิ์การเข้าใช้งานหน้าจอที่ไม่ได้รับอนุญาต</li>
        <li><b>หน้าจอรับตัวอย่างดิน (Sample Receiving Portal):</b> สแกน QR ตัวอย่างดิน, บันทึกจับคู่เกษตรกร-แปลง, การลงทะเบียน Walk-in</li>
        <li><b>แผงควบคุมห้องแล็บ (Lab Operation Workbench):</b> กรอกสูตร Blank/Standard, อัปโหลด CSV, อนุมัติการวิเคราะห์ (Validate/Approve)</li>
        <li><b>หน้าจอจัดการฐานข้อมูลอ้างอิง (System Reference Management):</b> เพิ่ม/ลบ/แก้ไข ข้อมูลพนักงาน รถบริการ ตารางวิ่ง จุดขายปุ๋ย และการย้ายพื้นที่บริการ (Factories & Zones Move Logic)</li>
        <li><b>หน้าสถิติเชิงลึก (Executive Dashboard):</b> กราฟสรุปผลเพื่อตรวจสอบแนวโน้มความอุดมสมบูรณ์ดินและปริมาณสารอาหารพืช</li>
      </ul>
    </div>

    <!-- System 3 Public Web -->
    <div class="nested-card">
      <div class="sys-badge badge-public">3. mordin-public (PHP Flight Website)</div>
      <div class="nested-title">💻 หน้าเว็บไซต์หลักสำหรับบุคคลทั่วไปและเกษตรกร (Public Portal)</div>
      <p style="font-size: 0.92rem; margin: 5px 0;">
        พัฒนาโดยใช้ภาษา <b>PHP (สไตล์ Flight MVC Routing)</b> และ <b>Bootstrap CSS</b> ในการพัฒนาหน้าจอที่เป็นมิตรกับหน้าจอมือถือ ทำงานโดยการยิง API ตรงไปที่ mordin-backend:
      </p>
      <ul style="font-size: 0.9rem; padding-left: 20px; margin: 5px 0;">
        <li><b>หน้านัดหมายบริการ (Soil Service Booking):</b> แบบฟอร์มกรอกขอใช้บริการวิเคราะห์ดินล่วงหน้า เลือกวันที่รถปฏิบัติการเข้าพื้นที่</li>
        <li><b>ฟอร์มลงทะเบียนเก็บตัวอย่างดิน (Soil Collector Form):</b> สแกน QR หน้างานเพื่อทำ GPS coordinate pinning (ปักหมุดแปลง) ป้อนข้อมูลชนิดดิน ความลาดเอียง การใช้น้ำ และประวัติแปลง</li>
        <li><b>ระบบค้นหาผลวิเคราะห์ดิน (Report Lookup Portal):</b> ค้นหาและเปิดดูไฟล์ PDF สรุปคำแนะนำปุ๋ยของตนเองผ่านรหัส OTP มือถือ หรือสแกน QR ส่วนตัว</li>
      </ul>
    </div>
  </div>

  <!-- Section 2: ฟังก์ชันการทำงานแยกตามโมดูล -->
  <div class="system-card">
    <div class="system-title">⚙️ 2. การแบ่งโมดูลและฟังก์ชันการทำงานทั้งหมด (System Features & Modules)</div>
    
    <!-- Admin Setup Modules -->
    <div class="nested-card" style="border-left: 4px solid #3182ce;">
      <div class="nested-title" style="color: #2b6cb0;">🛠️ 2.1 โมดูลฝั่งผู้ดูแลระบบ (Admin Control Panel)</div>
      <p style="font-size: 0.9rem;">โมดูลการบริหารจัดการข้อมูลพื้นฐานที่ Admin สามารถ CRUD เพื่อป้อนข้อมูลลงใน PostgreSQL:</p>
      
      <details class="details-box">
        <summary>1. User Management (จัดการผู้ใช้งาน)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> เพิ่ม/ลบ/แก้ไขข้อมูลพนักงาน (Staff), นักวิจัย (Researcher), ผู้บริหาร (Executive) และสิทธิ์การเข้าใช้งานระบบ (Role Assignment)
        </div>
      </details>

      <details class="details-box">
        <summary>2. Bus & Equipment Management (จัดการรถโมบายและอุปกรณ์)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> ลงทะเบียนรถแล็บเคลื่อนที่ (Bus Name, License Plate, Status), ระบุเครื่องมือวัดในรถ และเปิด/ปิดสถานะใช้งาน
        </div>
      </details>

      <details class="details-box">
        <summary>3. Service Area, Factories & Promotion Zones (จัดการพื้นที่บริการ)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> กำหนดพื้นที่ให้บริการที่ผูกกับโรงงานอ้อยแต่ละแห่ง และจัดการรหัสพื้นที่ส่งเสริม (Promotion Zones) รองรับ **Move Logic** เพื่อย้ายรหัสพิกัดบริการระหว่างโรงงานโดยไม่กระทบต่อข้อมูลประวัติย้อนหลัง (Historical Data Integrity)
        </div>
      </details>

      <details class="details-box">
        <summary>4. Service Calendar (จัดการตารางตารางรอบรถโมบาย)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> กำหนดวัน-เวลา และสถานที่ที่รถโมบายจะเดินทางไปเก็บตัวอย่างดินและทำการวิเคราะห์ เพื่อให้เกษตรกรคลิกเลือกในระบบจอง
        </div>
      </details>

      <details class="details-box">
        <summary>5. Service Type & Parameter (จัดการประเภทบริการวิเคราะห์)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> จัดการรายการพารามิเตอร์ที่ต้องการวิเคราะห์ เช่น บริการสำหรับดินอ้อยดินปะปน หรือการวิเคราะห์ธาตุอาหารเสริม
        </div>
      </details>

      <details class="details-box">
        <summary>6. Laboratory Settings (จัดการห้องปฏิบัติการหลักและย่อย)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> กำหนดรายการเคมีแล็บที่จะวิเคราะห์ (เช่น pH, OM, ฟอสฟอรัส P, โพแทสเซียม K) และสิทธิ์การเชื่อมต่อ API ของเครื่องมือวัด
        </div>
      </details>

      <details class="details-box">
        <summary>7. Standard Thresholds (จัดการค่ามาตรฐานแปลผล)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> ตั้งเกณฑ์กลางเพื่อแปลงค่าทดสอบแล็บให้ออกมาเป็นคะแนนช่วงคุณภาพดิน (ต่ำ, ปานกลาง, สูง) ที่แสดงผลบนรายงาน
        </div>
      </details>

      <details class="details-box">
        <summary>8. Fertilizer Prices (จัดการสูตรและราคาแม่ปุ๋ย)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> บันทึกราคาปุ๋ยเคมีรายสูตร (N-P-K) เพื่อใช้ในการนำมาคำนวณต้นทุนการผสมปุ๋ยรายแปลงให้เกิดความคุ้มค่าสูงสุดแก่เกษตรกร
        </div>
      </details>

      <details class="details-box">
        <summary>9. Fertilizer Usage Rules (จัดการคู่มือการใช้ปุ๋ยแปรตามค่าดิน)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> กำหนดเงื่อนไขตรรกะว่า หากค่าวิเคราะห์แล็บ OM อยู่ในระดับ A, ค่า P อยู่ในระดับ B, และ K อยู่ในระดับ C ระบบควรแนะนำปุ๋ยอัตราส่วนเท่าใด และควรใช้สีรหัสความสมบูรณ์ดินแบบไหนบน UI
        </div>
      </details>

      <details class="details-box">
        <summary>10. QR Generator (ระบบสร้างคิวอาร์โค้ดติดตามถุงดิน)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> สั่งเจเนอเรต QR Code แบบสุ่มรหัสความปลอดภัย (Secure Hash Token) เป็นชุด เพื่อนำไปจัดพิมพ์เป็นสติกเกอร์แปะติดถุงดิน
        </div>
      </details>

      <details class="details-box">
        <summary>11. Shop & Outlet Management (จัดการจุดจำหน่ายปุ๋ยแนะนำ)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> จัดการข้อมูลพิกัดและข้อมูลติดต่อของร้านค้าเคมีเกษตรมิตรผล (Mitr Phol Partners) เพื่อแนะนำให้เกษตรกรสามารถเดินทางไปซื้อปุ๋ยได้ และพิมพ์ QR Code ประจำร้าน
        </div>
      </details>
    </div>

    <!-- Officer / Lab Modules -->
    <div class="nested-card" style="border-left: 4px solid #009688;">
      <div class="nested-title" style="color: #00796b;">🧪 2.2 โมดูลฝั่งเจ้าหน้าที่ห้องแล็บ (Officer & Researcher Operations)</div>
      <p style="font-size: 0.9rem;">โมดูลหลักบนรถวิเคราะห์เคลื่อนที่สำหรับการประมวลผลและการป้อนผลทดลอง:</p>

      <details class="details-box">
        <summary>1. Soil Sample Receiving (บันทึกรับตัวอย่างตัวอย่างดิน)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> สแกนสติกเกอร์ถุงดิน ตรวจสอบสถานะการจอง ป้อนพิกัดแปลงดิน ยืนยันการจับคู่แปลงกับรหัสขวดแล็บ
        </div>
      </details>

      <details class="details-box">
        <summary>2. Lab Calibration Setup (ตั้งค่าก่อนการรันเครื่องวัดเคมี)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> บันทึกค่า **Blank Standard** (ค่าควบคุมเพื่อหักลบจุดเริ่มต้น) และ **Working Standard Calibration Curve** (จุดกราฟมาตรฐานเพื่อใช้หาสมการแปรผลค่าแสง/สัญญาณไฟฟ้าของเครื่องวัดให้เป็นค่า PPM หรือปริมาณสารเคมีจริงของ OM และ P)
        </div>
      </details>

      <details class="details-box">
        <summary>3. Manual Lab Entry (บันทึกค่าแล็บทีละตัวอย่าง)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> ป้อนข้อมูลทีละตัวอย่างผ่าน UI โดยตรง เหมาะสำหรับกรณีมีจำนวนน้อยเพื่อหลีกเลี่ยงความล่าช้า
        </div>
      </details>

      <details class="details-box">
        <summary>4. CSV Bulk Upload (ระบบอัปโหลดผลวิเคราะห์แล็บแบบกลุ่ม)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> อัปโหลดไฟล์ CSV ที่ดึงจากเครื่องวิเคราะห์อัตโนมัติ (เช่นเครื่องวัดสเปกตรัมแสง) เพื่อแปลงค่าและบันทึกเข้าฐานข้อมูลทีเดียวหลายร้อยตัวอย่างโดยลดความผิดพลาดจากคน (Human-Error)
        </div>
      </details>

      <details class="details-box">
        <summary>5. Grid Data Workbench (การลงผลทดสอบแบบตาราง Excel)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> หน้าจอที่แสดงผลตัวอย่างดินทั้งหมดในตารางกริดที่สามารถกรอกและลากเพื่อเปลี่ยนค่ารวดเร็ว พร้อมแสดงสถานะแบบ Real-time
        </div>
      </details>

      <details class="details-box">
        <summary>6. Validation & Approval (ระบบอนุมัติปล่อยรายงานผล)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> นักวิจัยดินระดับหัวหน้าตรวจสอบความสอดคล้องของผลทดสอบ หากผ่านเกณฑ์ให้กดอนุมัติ (Approve) ซึ่งระบบจะแปลงสถานะรายงานเป็น Complete และเปิดให้เกษตรกรสามารถค้นหาผลทางระบบหน้าบ้าน
        </div>
      </details>
    </div>

    <!-- Farmer Modules -->
    <div class="nested-card" style="border-left: 4px solid #dd6b20;">
      <div class="nested-title" style="color: #c05621;">🌾 2.3 โมดูลฝั่งเกษตรกร (Farmer Public Portal)</div>
      <p style="font-size: 0.9rem;">โมดูลบน Public Web ที่เกษตรกรสามารถใช้งานได้ง่ายผ่านเว็บเบราว์เซอร์มือถือ:</p>

      <details class="details-box">
        <summary>1. Booking Scheduler (ระบบตรวจสอบตารางจองคิว)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> ค้นหาพื้นที่ให้บริการของโรงงานในสังกัด เลือกพิกัด และยืนยันจองคิวส่งดินล่วงหน้าผ่านระบบปฏิทินรอบวิ่ง
        </div>
      </details>

      <details class="details-box">
        <summary>2. GPS Soil Tagging (ระบบบันทึกตัวอย่างดินพร้อมพิกัดดาวเทียม)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> สแกน QR ถุงดินเพื่อเปิดลิงก์ฟอร์มลงข้อมูลดินโดยอัตโนมัติ จับความแม่นยำของพิกัดละติจูด/ลองจิจูด (GPS coordinate pinning) ของจุดที่ยืนเก็บตัวอย่างทันที
        </div>
      </details>

      <details class="details-box">
        <summary>3. Returning User Re-use Action (การจองด่วนสำหรับเกษตรกรเดิม)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> ปุ่ม **ใช้ข้อมูลเดิม** ค้นหาประวัติการสแกนด้วยหมายเลขโทรศัพท์ เพื่อทำการดึงข้อมูลเกษตรกรและที่แปลงเดิมมาเชื่อมโยงการจองใหม่ทันทีโดยเกษตรกรไม่ต้องคีย์ข้อมูลเดิมซ้ำ และใช้ Opaque Token เพื่อความปลอดภัย
        </div>
      </details>

      <details class="details-box">
        <summary>4. Report Viewer (ระบบดาวน์โหลดและแสดงผลวิเคราะห์ดิน)</summary>
        <div class="details-content">
          <b>ฟังก์ชัน:</b> เกษตรกรสามารถสแกนคิวอาร์ส่วนตัว หรือใช้ระบบรหัสยืนยัน OTP เพื่อเปิดดูเอกสารแนะแนวปุ๋ยของตนเองแบบอินเตอร์แอคทีฟ มีกราฟิกวงกลมชี้เป้าความสมบูรณ์ดิน และปุ่มพิมพ์รายงาน
        </div>
      </details>
    </div>

  </div>

  <!-- Section 3: เจาะลึกกระบวนการทำงาน 8 ขั้นตอน -->
  <div class="system-card">
    <div class="system-title">📋 3. รายละเอียดทุกขั้นตอนแบบเจาะลึก (8-Step Detailed Process)</div>
    
    <!-- Step 1 -->
    <div class="step-card">
      <div class="step-num"><span>1.</span> การเจเนอเรตและติด QR Code ตัวอย่างดิน</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        • <b>ฝั่งผู้ดูแลระบบ:</b> เปิดเมนู QR Code Generator ในหน้าของระบบจัดการของ Admin ระบุจำนวนที่ต้องการจัดพิมพ์ เช่น 1,000 ชุด ระบบจะเจนชุดอักขระรหัสลับแบบ Hash (Opaque Token) เก็บไว้ในฐานข้อมูล ป้องกันการปลอมแปลงพิกัดและสวมสิทธิ์พนักงาน<br>
        • <b>ขั้นตอนหน้างาน:</b> จัดพิมพ์ QR Code ลงสติกเกอร์ นำไปแปะไว้บนถุงดินพลาสติกใสพร้อมแจกจ่ายคู่มือและถุงดินให้กับเกษตรกร ณ ศูนย์ส่งเสริม หรือพนักงานนำลงพื้นที่ไปแจกจ่าย
      </p>
    </div>

    <!-- Step 2 -->
    <div class="step-card">
      <div class="step-num"><span>2.</span> การเก็บดินและบันทึกพิกัดพล็อต (Farmer Field Action)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        • <b>ขั้นตอนหน้างาน:</b> เกษตรกรเดินทางไปยังแปลงอ้อยของตน ขุดดินตามความลึกที่กำหนดลงถุง รูดซิปปิด ปลุกมือถือเปิดกล้องสแกน QR Code บนสติกเกอร์ถุงดิน<br>
        • <b>การทำงานของระบบ:</b> มือถือจะลิงก์เข้าสู่หน้าฟอร์มบันทึกข้อมูลแปลงของ Public App โดยจะบังคับให้เปิดใช้งานพิกัด GPS อัตโนมัติ (Location Pinning) และดึงรหัสแปลงพล็อตเดิมขึ้นมาให้ยืนยันหากเป็นแปลงเดิม หากเป็นแปลงใหม่จะดึงจุดพิกัด Lat/Lng ปัจจุบันเป็นข้อมูลตั้งต้นเพื่อใช้ตรวจเช็คพื้นที่โรงงาน เกษตรกรกรอกประวัติดินแล้วกดตกลง
      </p>
    </div>

    <!-- Step 3 -->
    <div class="step-card">
      <div class="step-num"><span>3.</span> การจองคิววิเคราะห์ดิน (Public Scheduler Booking)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        • <b>การทำงานของระบบ:</b> เกษตรกรลงทะเบียนเข้าสู่ระบบจองผ่านหน้าเว็บไซต์ เลือกบริการ เช่น วิเคราะห์ดินทั่วไป จากนั้นเลือกปฏิทินการออกเดินทางของรถบริการ (Service Calendar) ในละแวกพื้นที่จัดส่ง ระบบ NestJS หลังบ้านจะส่งสัญญานไปล็อกรหัสรอบการจองในตารางเพื่อไม่ให้จองเกินขีดจำกัด (Capacity Limiter)
      </p>
    </div>

    <!-- Step 4 -->
    <div class="step-card">
      <div class="step-num"><span>4.</span> การสแกนรับตัวอย่างดินและคัดแยกสถานะ (Sample Receiving)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        เมื่อดินเดินทางมาถึงรถวิเคราะห์ดินเคลื่อนที่ เจ้าหน้าที่จะใช้เครื่องสแกนบาร์โค้ดสแกน QR Code บนถุงดิน ระบบ React App หลังบ้านจะตรวจสอบสถานะข้อมูลของ QR Code นั้น และแยกกระบวนการทำงานออกตามเงื่อนไข:
      </p>
      <ul style="font-size: 0.9rem; padding-left: 20px;">
        <li><b>กรณีที่ 1 (ข้อมูลสมบูรณ์):</b> แสดงข้อมูลเกษตรกรและรูปแปลง กดยืนยันจับคู่อย่างรวดเร็วเพื่อป้อนเข้ารอบการทำแล็บ</li>
        <li><b>กรณีที่ 2 (แปลงไม่สมบูรณ์/พิกัดหาย):</b> เจ้าหน้าที่จะสอบถามพิกัด และคลิกปุ่ม **เพิ่มพิกัดแปลงเกษตรกร** เพื่อปักพิกัดพล็อตรอบใหม่ก่อนส่งต่อให้ห้องปฏิบัติการ</li>
        <li><b>กรณีที่ 3 (เกษตรกรกรอกสแกน QR หน้าแปลง แต่ไม่ได้กดจองล่วงหน้า):</b> ระบบจะดึงข้อมูลที่เคยป้อนไว้ตอนปักหมุดแปลงเกษตรขึ้นมา เจ้าหน้าที่ระบุรอบทำแล็บให้แล้วกดยืนยัน</li>
        <li><b>กรณีที่ 4 (เกษตรกรไม่ได้ทำข้อมูลใดๆ - Walk-in กระดาษ):</b> เจ้าหน้าที่ใช้คีย์บอร์ดพิมพ์ประวัติเกษตรกร พิมพ์ประวัติพล็อตแปลงดินใหม่ทั้งหมดหน้าเคาน์เตอร์ และกดยืนยันลงทะเบียนผูกข้อมูลถุงดิน</li>
      </ul>
    </div>

    <!-- Step 5 -->
    <div class="step-card">
      <div class="step-num"><span>5.</span> การสอบเทียบค่าความถูกต้องของแล็บ (Lab Parameters Calibration Setup)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        นักวิจัยจะไม่สามารถบันทึกผลดินเข้าแปลงเปล่าๆ ได้หากไม่ทำขั้นตอนตั้งค่าแล็บเพื่อควบคุมคุณภาพข้อมูลป้องกันความเพี้ยนของหัววัดสารเคมี:
      </p>
      <ul style="font-size: 0.9rem; padding-left: 20px;">
        <li><b>Blank Standard:</b> นักวิจัยป้อนค่าที่เครื่องวัดค่าได้จากตัวทำละลายมาตรฐานที่ไม่มีธาตุอาหารปนเปื้อน (ค่าเปรียบเทียบสารตั้งต้น) เพื่อให้โปรแกรมเบื้องหลังคำนวณหักลบออกตัวแปรในการคำนวณหาปริมาณธาตุ</li>
        <li><b>Working Standard (OM & P Calibration):</b> นักวิจัยป้อนค่าที่วัดได้จากสารละลายมาตรฐานที่มีความเข้มข้นที่ทราบล่วงหน้าเป็นจุดๆ (เช่น 0.5, 1.0, 2.0, 5.0 PPM) เพื่อสร้างกราฟสมการแปรผล (Linear Regression) ในระบบ ให้ระบบคำนวณสูตรอ้างอิงและปรับเทียบเพื่อความแม่นยำ</li>
      </ul>
    </div>

    <!-- Step 6 -->
    <div class="step-card">
      <div class="step-num"><span>6.</span> บันทึกค่าทดสอบแล็บเข้าถังข้อมูล (Lab Result Integration)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        นักวิจัยดินเก็บค่าทดสอบทางเคมี (pH, ฟอสฟอรัส P, โพแทสเซียม K, อินทรียวัตถุ OM, ความเค็ม ฯลฯ) แล้วบันทึกลงสู่ระบบเพื่อเชื่อมโยงกับถุงดินใบนั้นๆ โดยเลือกได้ 4 ช่องทางตามสถานการณ์:
      </p>
      <ul style="font-size: 0.9rem; padding-left: 20px;">
        <li><b>วิธีที่ 1 (ป้อนมือรายตัวอย่าง):</b> พิมพ์ค่าทีละหน้าต่างการวิเคราะห์ลงเว็บทีละตัวอย่าง</li>
        <li><b>วิธีที่ 2 (สแกน QR แถบหลอดแล็บ):</b> สำหรับชุดทดสอบที่มี QR Code แถบตรวจ เมื่อสแกนจะนำลิงก์เข้าสู่พารามิเตอร์นั้นโดยตรง</li>
        <li><b>วิธีที่ 3 (CSV Bulk Upload):</b> อัปโหลดไฟล์ที่บันทึกข้อมูลพารามิเตอร์ทั้งหมดในรูปแบบ CSV ดึงจากเครื่องวิเคราะห์อัตโนมัติ</li>
        <li><b>วิธีที่ 4 (Grid Interface):</b> พิมพ์บันทึกเสมือนพิมพ์ตาราง Excel ในหน้า Workbench</li>
      </ul>
    </div>

    <!-- Step 7 -->
    <div class="step-card">
      <div class="step-num"><span>7.</span> ตรวจสอบความถูกต้องและอนุมัติ (Verify & Approval Logic)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        • <b>ระบบคำนวณผลลัพธ์อัตโนมัติ:</b> เมื่อส่งข้อมูลแล็บ ระบบ NestJS หลังบ้านจะดึงเกณฑ์มาตรฐานของดิน (Standard Thresholds) มาเทียบ เช่น ถ้าค่าโพแทสเซียม K ต่ำกว่า 60 PPM แปลผลเป็น "ต่ำ" จากนั้นดึงสูตรแนะนำปุ๋ย (Fertilizer Usages) เช่น แนะนำปุ๋ยผสม N-P-K สูตร 15-5-20 อัตรา 50 กก./ไร่ คำนวณราคารวมโดยเทียบจากตารางราคาปุ๋ยอ้างอิง<br>
        • <b>อนุมัติงาน:</b> เจ้าหน้าที่อาวุโส/นักวิจัยตรวจสอบผลวิเคราะห์กับประวัติแปลงในระบบ หากค่าดินไม่ออกมาผิดธรรมชาติ (เช่น ค่าเค็มเกินความเป็นจริง) จะกดปุ่ม **Approve** เพื่อยืนยันความถูกต้องและล็อกข้อมูล
      </p>
    </div>

    <!-- Step 8 -->
    <div class="step-card">
      <div class="step-num"><span>8.</span> การเผยแพร่และการดูรายงานผล (Result Access)</div>
      <p style="font-size: 0.92rem; margin-top: 5px;">
        • <b>การส่งมอบให้เกษตรกร:</b> เกษตรกรไม่จำเป็นต้องเดินทางมายังศูนย์ส่งเสริมเพื่อรับกระดาษ เพียงแค่ล็อกอินเข้าสู่หน้าบริการสืบค้นรายงานของ Public App (PHP) โดยใช้รหัสยืนยัน OTP เบอร์โทรศัพท์ หรือ สแกน QR Code ประจำตัว ระบบจะแสดงรายงานผลวิเคราะห์ดินอัจฉริยะ (Soil Summary Report) แนะนำอัตราผสมปุ๋ยประหยัดต้นทุน และระบุพิกัดร้านค้าพันธมิตรที่จำหน่ายปุ๋ยที่ใกล้แปลงที่สุด<br>
        • <b>การวิเคราะห์สถิติผู้บริหาร:</b> ข้อมูลที่ได้รับการอนุมัติจะอัปเดตและแสดงผลทันทีบนหน้า Dashboard ในฝั่ง Private App แสดงกราฟสัดส่วนภาพรวมธาตุอาหารพืชรายโรงงาน อัตราดินเค็ม เพื่อนำไปวางแผนนโยบายการจัดซื้อแม่ปุ๋ยและการสนับสนุนชาวไร่ต่อไป
      </p>
    </div>

  </div>

  <!-- Section 4: ข้อจำกัดความปลอดภัยและการประมวลข้อมูล -->
  <div class="system-card">
    <div class="system-title">🔒 4. ข้อกำหนดการควบคุมข้อมูลและความปลอดภัย (Data Hardening Policies)</div>
    <ul style="font-size: 0.92rem; padding-left: 20px; margin: 5px 0;">
      <li><b>การคุ้มครองข้อมูลส่วนบุคคล (Privacy Hardening):</b> ห้ามแสดงรหัสบัตรประจำตัวประชาชน (Citizen ID) ของเกษตรกรในหน้าค้นหารายงานสาธารณะ ลิงก์ URL สติกเกอร์ QR Code หรือพิมพ์ออกมาในใบรายงานหน้าเว็บภายนอกโดยเด็ดขาด ให้ใช้ข้อมูลหมายเลขโทรศัพท์หรือชื่อแปลงเป็นข้อมูลอ้างอิงแบบ Masking แทน</li>
      <li><b>การป้องกันข้อมูลซ้ำซ้อน (Concurrency Handling):</b> การทำรายการจองของเกษตรกรเดิมจะใช้ **Opaque Selection Token** ระยะเวลาสั้นในการทำงานชั่วคราวร่วมกับระบบตรวจสอบ Redis เพื่อป้องกันการส่งข้อมูลที่ชนกันหรือข้อมูลเกษตรกรซ้ำซ้อนกันในฐานข้อมูล</li>
      <li><b>สิทธิ์การแก้ไขย้อนหลัง (Historical Record Preservation):</b> ข้อมูลของโรงงาน (Factory) และพื้นที่ส่งเสริมประจำปีจะไม่ถูกแก้ไขแบบทับข้อมูลเดิม (Overwrite) เพื่อป้องกันไม่ให้รายงานการตรวจวิเคราะห์ของเกษตรกรในปีที่ผ่านมาถูกแก้ไขพิกัดสังกัดโรงงานเดิมตามค่าที่เปลี่ยนไปของปีปัจจุบัน</li>
    </ul>
  </div>

</div>
