# 🧪 Mordin Soil Analysis System Workflows & Layout
*(ระบบวิเคราะห์ดินมอดิน - แพลตฟอร์มดิจิทัลการให้บริการบนรถวิเคราะห์ดินเคลื่อนที่)*

<style>
  .mordin-doc-container {
    font-family: 'Sarabun', 'Segoe UI', Arial, sans-serif;
    color: #2c3e50;
    line-height: 1.6;
    max-width: 950px;
    margin: 0 auto;
  }
  .header-banner {
    background: linear-gradient(135deg, #1e4620 0%, #2e7d32 100%);
    color: #ffffff;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.15);
  }
  .header-banner h2 {
    color: #ffffff !important;
    margin: 0 0 10px 0 !important;
    font-size: 2.1rem;
    font-weight: 700;
  }
  .header-banner p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }
  .section-card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .section-title {
    border-left: 5px solid #2e7d32;
    padding-left: 15px;
    color: #1e4620 !important;
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: bold;
  }
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  .role-card {
    border-radius: 10px;
    padding: 18px;
    text-align: center;
    color: #ffffff;
    box-shadow: 0 4px 6px rgba(0,0,0,0.06);
  }
  .role-admin { background: linear-gradient(135deg, #3f51b5, #303f9f); }
  .role-officer { background: linear-gradient(135deg, #009688, #00796b); }
  .role-executive { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }
  .role-farmer { background: linear-gradient(135deg, #ff9800, #f57c00); }
  .role-card h3 {
    margin: 0 0 10px 0 !important;
    color: #ffffff !important;
    font-size: 1.2rem;
  }
  .role-card p {
    font-size: 0.85rem;
    margin-bottom: 0;
    opacity: 0.95;
    line-height: 1.4;
  }
  .timeline {
    position: relative;
    max-width: 100%;
    margin: 15px 0;
    padding: 10px 0;
  }
  .timeline::after {
    content: '';
    position: absolute;
    width: 4px;
    background-color: #2e7d32;
    top: 0;
    bottom: 0;
    left: 20px;
    border-radius: 2px;
  }
  .timeline-item {
    padding: 10px 10px 15px 45px;
    position: relative;
    background-color: inherit;
    width: 100%;
    box-sizing: border-box;
  }
  .timeline-item::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 14px;
    background-color: #ffffff;
    border: 4px solid #4caf50;
    top: 15px;
    border-radius: 50%;
    z-index: 1;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .timeline-content {
    padding: 18px;
    background-color: #fcfcfc;
    position: relative;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .timeline-content h4 {
    margin-top: 0;
    color: #2e7d32 !important;
    margin-bottom: 8px;
    font-size: 1.15rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .step-badge {
    background-color: #2e7d32;
    color: white;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: bold;
  }
  .badge-secondary {
    background-color: #718096;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    margin-left: 5px;
  }
  .method-badge {
    background-color: #3182ce;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-right: 5px;
    display: inline-block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .table-styled {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 0.9rem;
  }
  .table-styled th, .table-styled td {
    border: 1px solid #e2e8f0;
    padding: 10px 12px;
    text-align: left;
  }
  .table-styled th {
    background-color: #f0fdf4;
    color: #166534;
    font-weight: bold;
  }
  .table-styled tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .info-box {
    background-color: #f0fdf4;
    border-left: 4px solid #166534;
    padding: 15px;
    border-radius: 0 8px 8px 0;
    margin-top: 15px;
  }
  .info-box-title {
    font-weight: bold;
    color: #166534;
    margin-bottom: 5px;
  }
  .highlight-text {
    color: #d97706;
    font-weight: bold;
  }
  .tech-pill {
    background-color: #edf2f7;
    color: #4a5568;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    display: inline-block;
    margin: 2px;
    border: 1px solid #cbd5e0;
  }
</style>

<div class="mordin-doc-container">

  <!-- Header Banner -->
  <div class="header-banner">
    <h2>Mordin Soil Analysis System</h2>
    <p>โครงสร้างสถาปัตยกรรม บทบาทผู้ใช้งาน และกระบวนการทำงานแบบดิจิทัลครบวงจร (End-to-End)</p>
  </div>

  <!-- Section: System Overview -->
  <div class="section-card">
    <div class="section-title">📌 ภาพรวมระบบ (System Overview)</div>
    <p>ระบบวิเคราะห์ดินมอดินเป็นแพลตฟอร์มดิจิทัลที่พัฒนาขึ้นเพื่อรองรับการให้บริการ <b>"รถวิเคราะห์ดินเคลื่อนที่" (Mobile Soil Analysis Bus)</b> ของกลุ่มมิตรผล เพื่อช่วยให้เกษตรกรสามารถวิเคราะห์คุณสมบัติทางเคมีและกายภาพของดินได้อย่างรวดเร็วในพื้นที่จริง โดยมีระบบสนับสนุนทั้งการจอง การทำงานในห้องแล็บเคลื่อนที่ การจัดการราคาและคำแนะนำปุ๋ย ตลอดจนการสรุปผลรายงานให้ผู้บริหารและเกษตรกรผ่านหน้าเว็บส่วนตัว</p>
    
    <div class="grid-container" style="margin-top: 20px;">
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
        <b style="color: #2e7d32;">💻 Public App (PHP)</b>
        <p style="font-size: 0.85rem; margin: 5px 0 0 0;">เว็บหลักสำหรับเกษตรกร ค้นหารายงาน จองคิววิเคราะห์ดิน และลงทะเบียนใช้งาน</p>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
        <b style="color: #2e7d32;">🔐 Private App (React)</b>
        <p style="font-size: 0.85rem; margin: 5px 0 0 0;">แดชบอร์ดเจ้าหน้าที่และผู้บริหาร จัดการข้อมูลแล็บและรับตัวอย่าง</p>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
        <b style="color: #2e7d32;">⚙️ Backend API (NestJS)</b>
        <p style="font-size: 0.85rem; margin: 5px 0 0 0;">เซิร์ฟเวอร์ประมวลผลข้อมูล เก็บประวัติวิเคราะห์ดินและคํานวณสูตรปุ๋ย</p>
      </div>
    </div>
  </div>

  <!-- Section: User Roles -->
  <div class="section-card">
    <div class="section-title">👥 บทบาทผู้ใช้งานในระบบ (User Roles & Permissions)</div>
    <div class="grid-container">
      
      <!-- Admin Card -->
      <div class="role-card role-admin">
        <h3>Admin</h3>
        <p><b>ผู้ดูแลระบบส่วนหลัง</b><br>จัดการสิทธิ์ผู้ใช้, ตั้งค่าแล็บ, จัดการราคาและสูตรแนะนำปุ๋ย, ตั้งค่ารถและรอบตารางบริการ</p>
      </div>
      
      <!-- Officer Card -->
      <div class="role-card role-officer">
        <h3>Officer / Researcher</h3>
        <p><b>เจ้าหน้าที่และนักวิจัยดิน</b><br>รับตัวอย่างดิน, ทำการจับคู่ QR Code, ตั้งค่าพารามิเตอร์แล็บ, บันทึกผลทดสอบ และตรวจสอบอนุมัติรายงาน</p>
      </div>
      
      <!-- Executive Card -->
      <div class="role-card role-executive">
        <h3>Executive</h3>
        <p><b>ผู้บริหารและผู้วิเคราะห์ข้อมูล</b><br>เรียกดูข้อมูลภาพรวมวิเคราะห์ดินผ่านแดชบอร์ดเชิงบริหาร และดึงรายงานสรุปผล</p>
      </div>
      
      <!-- Farmer Card -->
      <div class="role-card role-farmer">
        <h3>Farmer</h3>
        <p><b>เกษตรกรและสมาชิกทั่วไป</b><br>จองคิววิเคราะห์ดิน, ลงทะเบียนตัวอย่างผ่าน QR Code (ปักหมุดตำแหน่ง), ดูรายงานวิเคราะห์ดินของแปลงตนเอง</p>
      </div>
      
    </div>
  </div>

  <!-- Section: 8-Step Workflow Timeline -->
  <div class="section-card">
    <div class="section-title">🔄 ขั้นตอนกระบวนการทำงานหลัก (8-Step Workflow)</div>
    
    <div class="timeline">
      
      <!-- Step 1 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>🏷️ การเตรียมอุปกรณ์และสร้าง QR Code</span>
            <span class="step-badge">Step 1</span>
          </h4>
          <p>ผู้ดูแลระบบหรือเจ้าหน้าที่จัดพิมพ์ <b>QR Code Sticker</b> สำหรับติดบนถุงเก็บตัวอย่างดินแต่ละถุง โดยแต่ละ QR Code จะมีรหัสเฉพาะ (Unique Token) เพื่อใช้ติดตามและจับคู่กับข้อมูลแปลงดินตลอดกระบวนการวิเคราะห์</p>
          <div style="font-size: 0.85rem; color: #4a5568; margin-top: 5px;">
            📍 <i>ดำเนินการโดย: Admin / Officer (แจกจ่ายอุปกรณ์ ณ ศูนย์ส่งเสริมหรือรถวิเคราะห์เคลื่อนที่)</i>
          </div>
        </div>
      </div>
      
      <!-- Step 2 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>📱 สแกน QR และเก็บตัวอย่างดินหน้างาน</span>
            <span class="step-badge">Step 2</span>
          </h4>
          <p>เกษตรกรนำถุงดินที่ติด QR Code ไปที่แปลงดินของตนเอง จากนั้นสแกน QR Code บนถุงด้วยมือถือเพื่อ:</p>
          <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9rem;">
            <li>ปักหมุดตำแหน่งแปลงดินแบบอัตโนมัติ (Automate Location Pinning)</li>
            <li>ดึงข้อมูลเกษตรกรในระบบและบันทึกประวัติแปลงลงฐานข้อมูลดิน</li>
          </ul>
          <div style="font-size: 0.85rem; color: #4a5568;">
            📍 <i>ดำเนินการโดย: Farmer (ใช้งานบนโทรศัพท์มือถือผ่าน Public Web Browser)</i>
          </div>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>📅 การจองคิววิเคราะห์ดินล่วงหน้า</span>
            <span class="step-badge">Step 3</span>
          </h4>
          <p>เกษตรกรทำการจองรอบการวิเคราะห์ดินผ่านระบบโดยเลือกรอบการให้บริการที่ลงทะเบียนไว้ในปฏิทินบริการ (Service Calendar) โดยอิงตามวันเวลาที่รถวิเคราะห์เคลื่อนที่จะเดินทางไปถึงพิกัดเป้าหมาย</p>
          <div class="info-box" style="margin-top: 8px; padding: 10px;">
            <span class="highlight-text">💡 หมายเหตุ:</span> กรณีที่เกษตรกรไม่ได้ทำการจองคิวล่วงหน้า ระบบยังมี flow สำรองที่รองรับการ Walk-in นำส่งตัวอย่าง ณ จุดให้บริการโดยตรง
          </div>
        </div>
      </div>

      <!-- Step 4 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>📥 การรับตัวอย่างดินและตรวจสอบข้อมูล</span>
            <span class="step-badge">Step 4</span>
          </h4>
          <p>เจ้าหน้าที่ ณ รถวิเคราะห์เคลื่อนที่รับถุงดินจากเกษตรกรและทำการสแกน QR Code เพื่อบันทึกสถานะการรับตัวอย่างดิน (Sample Receiving)</p>
          <p style="margin-bottom: 5px; font-weight: bold; font-size: 0.9rem;">กรณีการรับงาน 4 รูปแบบ:</p>
          <table class="table-styled" style="margin-top: 5px;">
            <thead>
              <tr>
                <th style="width: 40%;">สถานะข้อมูลจากเกษตรกร</th>
                <th>วิธีดำเนินการของเจ้าหน้าที่ (Officer Action)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>1. สแกนและจองล่วงหน้าสมบูรณ์</b></td>
                <td>ตรวจสอบพิกัด รายละเอียดตัวอย่างและกดยืนยันการจับคู่ เพื่อส่งเข้าแล็บวิเคราะห์ทันที</td>
              </tr>
              <tr>
                <td><b>2. จองแล้ว แต่ขาดข้อมูลแปลงดิน</b></td>
                <td>เจ้าหน้าที่ตรวจสอบและเพิ่ม/แก้ไขข้อมูลพิกัดแปลงดินในระบบ เพื่อให้ครบถ้วนก่อนรับตัวอย่าง</td>
              </tr>
              <tr>
                <td><b>3. ไม่ได้จองล่วงหน้า แต่สแกน QR กรอกข้อมูลแล้ว</b></td>
                <td>เจ้าหน้าที่สแกน QR บนถุง ตรวจสอบความถูกต้องและลงบันทึกรับตัวอย่างดินหน้างาน (Walk-in)</td>
              </tr>
              <tr>
                <td><b>4. ไม่ได้จอง และไม่ได้สแกนกรอกข้อมูลใดๆ</b></td>
                <td>เจ้าหน้าที่ลงทะเบียนข้อมูลเกษตรกร ข้อมูลแปลงดินใหม่ทั้งหมดในระบบ พร้อมเชื่อมโยงกับ QR Code ของถุงดิน</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Step 5 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>🧪 การตั้งค่าตัวแปรก่อนการวิเคราะห์ในแล็บ</span>
            <span class="step-badge">Step 5</span>
          </h4>
          <p>นักวิจัย/เจ้าหน้าที่แล็บจะเตรียมและตัังค่าตัวแปรอ้างอิงต่าง ๆ ในแต่ละรอบการทดลองเพื่อให้การวัดค่าถูกต้องตามมาตรฐานวิชาการ:</p>
          <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9rem;">
            <li>เลือกตารางรอบบริการและตัวอย่างดินที่ต้องการทำแล็บ</li>
            <li>ตั้งค่าค่ามาตรฐานเปรียบเทียบ <b>(Blank Standard)</b> ซึ่งเป็นสารตั้งต้นในการวัดค่าทดลอง</li>
            <li>บันทึกความสัมพันธ์ <b>Working Standard</b> สำหรับแปรผลการทดสอบค่าอินทรียวัตถุในดิน (Organic Matter - OM) และฟอสฟอรัส (Phosphorus - P)</li>
          </ul>
        </div>
      </div>

      <!-- Step 6 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>📝 บันทึกผลการวิเคราะห์ในแล็บ</span>
            <span class="step-badge">Step 6</span>
          </h4>
          <p>เจ้าหน้าทีนักวิจัยนำดินไปผ่านกระบวนการทดสอบทางเคมีเพื่อหาค่าต่าง ๆ เช่น pH, ธาตุอาหารหลัก (N, P, K), ธาตุอาหารรอง และบันทึกผลเข้าระบบ</p>
          <p style="margin-bottom: 5px; font-weight: bold; font-size: 0.9rem;">วิธีการบันทึกข้อมูลเข้าระบบมี 4 รูปแบบหลัก:</p>
          <div style="margin-top: 8px;">
            <span class="method-badge">วิธีที่ 1</span> <b>กรอกข้อมูลด้วยตนเอง (Manual Input)</b> แยกทดสอบแต่ละแล็บอย่างเป็นอิสระ<br>
            <span class="method-badge">วิธีที่ 2</span> <b>การสแกน QR Code สำหรับเจ้าหน้าที่ (Scan Staff QR)</b> เพื่อระบุตัวอย่างและกรอกผล<br>
            <span class="method-badge">วิธีที่ 3</span> <b>การนำเข้าข้อมูลผ่านไฟล์ CSV (Bulk Import)</b> รองรับการส่งออกข้อมูลดิบจากเครื่องวัดแล็บ<br>
            <span class="method-badge">วิธีที่ 4</span> <b>การกรอกในรูปแบบตารางกริด (Grid Entry)</b> บนหน้าเว็บของระบบ Private App
          </div>
        </div>
      </div>

      <!-- Step 7 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>✅ ตรวจสอบและอนุมัติรายงานผลการวิเคราะห์</span>
            <span class="step-badge">Step 7</span>
          </h4>
          <p>นักวิจัยหรือหัวหน้าแล็บตรวจสอบความถูกต้องของข้อมูลทั้งหมด (ข้อมูลเกษตรกร, พิกัดแปลง, และค่าผลลัพธ์เคมี) จากนั้นกดยืนยัน <b>Validate / Approve</b> รายงานผลวิเคราะห์ดิน เพื่อให้ระบบแปรผลเทียบระดับ (ต่ำ, ปานกลาง, สูง) พร้อมสรุปสูตรผสมปุ๋ยและราคาแนะนำโดยอัตโนมัติ</p>
        </div>
      </div>

      <!-- Step 8 -->
      <div class="timeline-item">
        <div class="timeline-content">
          <h4>
            <span>📊 การดูผลรายงานและการวิเคราะห์เชิงบริหาร</span>
            <span class="step-badge">Step 8</span>
          </h4>
          <p>ระบบนำส่งผลลัพธ์การวิเคราะห์ไปสู่ผู้ใช้งานแต่ละกลุ่มโดยมีช่องทางการเข้าถึงข้อมูลดังนี้:</p>
          <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9rem;">
            <li><b>เกษตรกร (Farmer):</b> ตรวจดูผลการวิเคราะห์แปลงดิน คำแนะนำการใช้ปุ๋ย ค่าต้นทุนปุ๋ยที่คาดการณ์ ผ่านการเข้าสู่หน้าเว็บหลัก (Public App) ด้วยการสแกน QR Code หรือ OTP</li>
            <li><b>ผู้บริหาร (Executive):</b> ตรวจสอบประสิทธิภาพและรายงานเชิงสถิติผ่านหน้า Executive Dashboard (เช่น ยอดรับตัวอย่างดินดินสะสม, สัดส่วนสภาพธาตุอาหารดินแยกตามภูมิภาค)</li>
          </ul>
        </div>
      </div>

    </div>
  </div>

  <!-- Section: System Layout & Technical Stack -->
  <div class="section-card">
    <div class="section-title">🎨 รูปแบบระบบและการเชื่อมต่อเทคโนโลยี (System Layout & Tech Stack)</div>
    
    <p>ระบบแบ่งหน้าจอและเมนูการจัดวางการทำงานออกเป็น 2 ฝั่งหลักเพื่อแยกส่วนความปลอดภัย:</p>
    
    <table class="table-styled">
      <thead>
        <tr>
          <th style="width: 20%;">ส่วนงาน</th>
          <th style="width: 30%;">หน้าจอหลัก</th>
          <th>รายการเมนูและโครงสร้างระบบ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>ระบบภายใน<br>(Private App)</b></td>
          <td>
            • หน้าล็อกอินเข้าสู่ระบบ<br>
            • เมนูหลักด้านข้าง (Sidebar)<br>
            • ตารางข้อมูลแยกสิทธิ์การเข้าถึง
          </td>
          <td>
            <ul>
              <li><b>DASHBOARD:</b> แดชบอร์ดผู้บริหารและแดชบอร์ดปฏิบัติการ</li>
              <li><b>RECEIVING:</b> การรับถุงดินและการจับคู่ข้อมูลพิกัด (Sample-Receiving)</li>
              <li><b>LABORATORIES:</b> การตั้งค่ามาตรฐานแล็บ (OM, P, Standard, Blank), การนำเข้าผลแล็บ 4 วิธี และเมนูอนุมัติผล</li>
              <li><b>MANAGEMENT:</b> จัดการข้อมูลอ้างอิงรายปี (Farmers, Lands, Buses, Service Calendars, Shops, Factories & Promotion Zones)</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td><b>ระบบภายนอก<br>(Public App)</b></td>
          <td>
            • หน้าเว็บไซต์บริการข้อมูลหลัก<br>
            • ฟอร์มบันทึกตัวอย่างดินเกษตรกร<br>
            • หน้ารายงานสรุปผลวิเคราะห์ดิน
          </td>
          <td>
            <ul>
              <li><b>HOME / INFOMATION:</b> ประชาสัมพันธ์ประเภทบริการวิเคราะห์ดิน</li>
              <li><b>BOOKING FORM:</b> แบบฟอร์มทำนัดหมายจองรอบการตรวจวิเคราะห์ดิน</li>
              <li><b>SOIL REGISTRATION FORM:</b> แบบฟอร์มกรอกพิกัด GPS/ระบุข้อมูลดินจาก QR</li>
              <li><b>REPORT SEARCH:</b> ค้นหารายงานผลการวิเคราะห์ด้วย OTP หรือคิวอาร์ส่วนบุคคล</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 15px;">
      <b>🛠️ เทคโนโลยีที่ใช้ในการขับเคลื่อนระบบ:</b><br>
      <span class="tech-pill">NestJS</span>
      <span class="tech-pill">React 19</span>
      <span class="tech-pill">TypeScript</span>
      <span class="tech-pill">Vite</span>
      <span class="tech-pill">Tailwind CSS (Dashboard)</span>
      <span class="tech-pill">Bootstrap 5 / Kaiadmin (Private UI)</span>
      <span class="tech-pill">PHP Flight (Public Web)</span>
      <span class="tech-pill">PostgreSQL / TypeORM</span>
      <span class="tech-pill">Redis (Short-lived tokens)</span>
    </div>
  </div>

</div>
