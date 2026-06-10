<?php
        $cPAGE['name']  = "วิธีเก็บตัวอย่างดิน";//"หน้าหลัก";
        $cPAGE['alias'] = "service";
        $cPAGE['link']  = "service-soil.php";
        $cPAGE['desc']  = "ขั้นตอนการเก็บตัวอย่างดิน ก่อนการรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

        include_once COMPONENT_PATH.'lib_header.php';
?>

    <section id="contact" class="section public-soil-page">
      <div class="container">
        <div class="row gy-4 align-items-stretch public-soil-visuals" data-aos="fade-up" data-aos-delay="100">
          <div class="col-lg-6">
            <div class="public-soil-image-card">
              <img src="assets/img/1.jpg" class="img-fluid" alt="อุปกรณ์และวิธีเตรียมตัวอย่างดิน">
            </div>
          </div>
          <div class="col-lg-6">
            <div class="public-soil-image-card">
              <img src="assets/img/2.jpg" class="img-fluid" alt="การเก็บตัวอย่างดินในแปลง">
            </div>
          </div>
        </div>

        <div class="public-soil-heading" data-aos="fade-up" data-aos-delay="160">
          <button type="button" class="public-back-button" onclick="history.back()">
            <i class="bi bi-arrow-left" aria-hidden="true"></i> ย้อนกลับ
          </button>
          <p>คู่มือสำหรับเกษตรกร</p>
          <h2>ขั้นตอนการเก็บตัวอย่างดิน</h2>
        </div>

        <div class="row gy-4 public-soil-steps" data-aos="fade-up" data-aos-delay="200">
          <div class="col-lg-6">
            <div class="public-step-card">
              <span class="public-step-number">1</span>
              <h3>เตรียมอุปกรณ์</h3>
              <ul>
                <li><i class="bi bi-check-circle"></i> <span>ถุงพลาสติกสำหรับใส่ตัวอย่างดิน <a href="#">(ขอรับได้ที่ศูนย์บริการเขตส่งเสริมอ้อยฯ)</a></span></li>
                <li><i class="bi bi-check-circle"></i> <span>อุปกรณ์ขุดดิน เช่น จอบ เสียม พลั่ว</span></li>
              </ul>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="public-step-card">
              <span class="public-step-number">2</span>
              <h3>สุ่มเก็บตัวอย่าง</h3>
              <p>การสุ่มเก็บตัวอย่างดินให้เดินสุ่มเก็บเป็นลักษณะสลับไปมาทั่วทั้งแปลง อย่างน้อย 5 จุด (ไม่เกิน 20 ไร่)</p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="public-step-card">
              <span class="public-step-number">3</span>
              <h3>ขุดดินเก็บตัวอย่าง</h3>
              <p>การขุดดินเก็บตัวอย่าง จะขุดเป็นรูปตัว V ลึกประมาณ 15-30 เซนติเมตร หลังจากนั้นเก็บดิน โดยใช้เสียมแซะดินข้างหลุม (ด้านเรียบ) ให้ได้ดินเป็นแผ่นหนาประมาณ 2-3 เซนติเมตร จนถึงก้นหลุม ดินที่ได้เก็บรวบรวมใส่ภาชนะหรือถุง</p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="public-step-card">
              <span class="public-step-number">4</span>
              <h3>ผสมและผึ่งดิน</h3>
              <p>ให้นำดินที่ขุดเก็บมาแต่ละจุด มาผสมคลุกเคล้ารวมกันเป็นตัวอย่างเดียว แล้วนำผึ่งในที่ร่มจนแห้ง</p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="public-step-card">
              <span class="public-step-number">5</span>
              <h3>บรรจุตัวอย่างดิน</h3>
              <p>เก็บตัวอย่างดินใส่ในถุงที่เกษตรกรไปรับมาจากเจ้าหน้าที่เขตส่งเสริมอ้อยฯ ปริมาณอย่างน้อย 500 กรัม หรือครึ่งถุง</p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="public-step-card">
              <span class="public-step-number">6</span>
              <h3>นำส่งจุดบริการ</h3>
              <p>นำส่งตัวอย่างดินมายังจุดบริการตรวจวิเคราะห์ดินเคลื่อนที่ ตามสถานที่ วัน-เวลา ที่แจ้งในแต่ละวัน</p>
            </div>
          </div>
        </div>

        <div class="public-note-card" data-aos="fade-up" data-aos-delay="240">
          <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <p><span>หมายเหตุ</span> หลีกเลี่ยงเก็บดินตัวอย่างจากกองปุ๋ยเก่า กองเศษวัสดุปรับปรุงดิน ต้นไม่ใหญ่ จอมปลวก สิ่งก่อสร้าง ดินถม</p>
        </div>
      </div>
    </section>


<?php include_once COMPONENT_PATH.'lib_footer.php' ?>
