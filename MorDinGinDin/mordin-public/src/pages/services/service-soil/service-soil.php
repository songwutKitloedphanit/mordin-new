<?php
        $cPAGE['name']  = "วิธีเก็บตัวอย่างดิน";//"หน้าหลัก";
        $cPAGE['alias'] = "service";
        $cPAGE['link']  = "service-soil.php";
        $cPAGE['desc']  = "ขั้นตอนการเก็บตัวอย่างดิน ก่อนการรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

        include_once( COMPONENT_PATH.'lib_header.php' );
?>


    <!-- Contact Section -->
    <section id="contact" class="contact section">
    <!--section id="about-us" class="section about-us"-->

      <div class="contact text-center" data-aos="fade-up" data-aos-delay="100">
      <!-- <div class="row justify-content-center">
          <div class="col-lg-4 col-md-6 d-flex justify-content-center">
              <img src="img/devices.jpg" class="img-fluid">
          </div>
          <div class="col-lg-4 col-md-6 d-flex justify-content-center">
              <img src="img/collect.jpg" class="img-fluid">
          </div>
      </div> -->
      <!-- <div class="row justify-content-center mt-3">
          <div class="col-lg-9 d-flex justify-content-center">
              <img src="img/collect2.jpg" class="img-fluid">
          </div>
      </div> -->
        <div class="row justify-content-center">
            <div class="col-lg-5 col-md-6 col-auto d-flex justify-content-center">
                <img src="assets/img/1.jpg" class="img-fluid">
            </div>
            <div class="col-lg-5 col-md-6 col-auto d-flex justify-content-center">
                <img src="assets/img/2.jpg" class="img-fluid">
            </div>
        </div>
        <hr>
      </div>

    </section>

    
    <section id="pricing" class="section about-us" style="padding-top: 0px;">

      <div class="container">

        <div class="row gy-4 mb-4">
          <div class="col-lg-12 order-2 order-lg-1 content" data-aos="fade-up" data-aos-delay="200">
           <h3>ขั้นตอนการเก็บตัวอย่างดิน</h3>
         </div>
       </div>

        <div class="row gy-4">

        <div class="col-lg-8  content mt-2" data-aos="fade-up" data-aos-delay="200">
            <ul>
              <li><i class="bi bi-1-circle"></i> <span>เตรียมอุปกรณ์</span></li>
              <li><i class="bi bi-check-circle" style="color: gray;"></i> <span>ถุงพลาสติกสำหรับใส่ตัวอย่างดิน <a href="#">(ขอรับได้ที่ศูนย์บริการเขตส่งเสริมอ้อยฯ)</a></span></li>
              <li><i class="bi bi-check-circle" style="color: gray;"></i> <span>อุปกรณ์ขุดดิน เช่น จอบ เสียม พลั่ว</span></li>
              <li><i class="bi bi-2-circle"></i> <span>การสุ่มเก็บตัวอย่างดินให้เดินสุ่มเก็บเป็นลักษณะสลับไปมาทั่วทั้งแปลง อย่างน้อย 5 จุด (ไม่เกิน 20 ไร่)</span></li>
              <li><i class="bi bi-3-circle"></i> <span>การขุดดินเก็บตัวอย่าง จะขุดเป็นรูปตัว V ลึกประมาณ 15-30 เซนติเมตร หลังจากนั้นเก็บดิน โดยใช้เสียมแซะดินข้างหลุม (ด้านเรียบ) ให้ได้ดินเป็นแผ่นหนาประมาณ 2-3 เซนติเมตร จนถึงก้นหลุม ดินที่ได้เก็บรวบรวมใส่ภาชนะหรือถุง</span></li>
              <li><i class="bi bi-4-circle"></i> <span>ให้นำดินที่ขุดเก็บมาแต่ละจุด มาผสมคลุกเคล้ารวมกันเป็นตัวอย่างเดียว แล้วนำผึ่งในที่ร่มจนแห้ง </span></li>
              <li><i class="bi bi-5-circle"></i> <span>เก็บตัวอย่างดินใส่ในถุงที่เกษตรกรไปรับมาจากเจ้าหน้าที่เขตส่งเสริมอ้อยฯ ปริมาณอย่างน้อย 500 กรัม หรือครึ่งถุง</span></li>
              <li><i class="bi bi-6-circle"></i> <span>นำส่งตัวอย่างดินมายังจุดบริการตรวจวิเคราะห์ดินเคลื่อนที่ ตามสถานที่ วัน-เวลา ที่แจ้งในแต่ละวัน</span></li>
           </ul>
  
          <p><span class="text-danger">หมายเหตุ</span> หลีกเลี่ยงเก็บดินตัวอย่างจากกองปุ๋ยเก่า กองเศษวัสดุปรับปรุงดิน ต้นไม่ใหญ่ จอมปลวก สิ่งก่อสร้าง ดินถม</p>
       </div>

    <?php include_once(COMPONENT_PATH.'service.php')?>
          

        </div>


      </div>


    </section><!-- /Contact Section -->


<?php include_once(COMPONENT_PATH.'lib_footer.php' ) ?>