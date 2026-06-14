<?php
require_once(SERVICES_PATH . 'ServiceCalendarAPI.php');
include UTILS_PATH . 'date.php';

$cPAGE['name'] = "สถานะการให้บริการ";//"หน้าหลัก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "services/mitr";
$cPAGE['desc'] = "สถานะการให้บริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

$data = ServiceCalendarAPI::getUpComingCalendar();
$latestCalendar = !empty($data) ? $data[0] : null;

include_once(COMPONENT_PATH . 'lib_header.php')
  ?>

<section id="counts" class="section counts light-background">

  <div class="container" data-aos="fade-up" data-aos-delay="100">

    <div class="row gy-4">

      <div class="col-lg-3 col-md-6">
        <div class="stats-item text-center w-100 h-100">
          <span data-purecounter-start="0" data-purecounter-end=<?= $latestCalendar['numberOfBookings'] ?? 0 ?>
            data-purecounter-duration="1" class="purecounter"></span>
          <p>จองส่งตัวอย่าง</p>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stats-item text-center w-100 h-100">
          <span data-purecounter-start="0" data-purecounter-end="0" data-purecounter-duration="1"
            class="purecounter"></span>
          <p>ส่งตัวอย่างแล้ว (เฉพาะที่จอง)</p>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stats-item text-center w-100 h-100">
          <span data-purecounter-start="0" data-purecounter-end="0" data-purecounter-duration="1"
            class="purecounter"></span>
          <p>ส่งตัวอย่างแล้ว (ทั้งหมด)</p>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stats-item text-center w-100 h-100">
          <?php
          $bookingMax = $latestCalendar['numberOfSamples'] ?? 0;
          $bookingCurrent = $latestCalendar['numberOfBookings'] ?? 0;
          $available = $bookingMax - $bookingCurrent;
          ?>
          <span data-purecounter-start="0" data-purecounter-end=<?= $available > 0 ? $available : 0 ?>
            data-purecounter-duration="1" class="purecounter"></span>
          <p>ส่งเพิ่มได้อีก</p>
        </div>
      </div>
    </div>

  </div>

</section>
<section id="pricing" class="pricing section">

  <div class="container">

    <div class="row gy-4" style="text-align: center;">

      <div class="col-lg-4 order-1 order-lg-2 mt-2 mb-2" style="text-align: center; align-content: center;"
        data-aos="fade-up" data-aos-delay="100">
        <?php
        if (
          $latestCalendar
          && !empty($latestCalendar['latitude'])
          && !empty($latestCalendar['longitude'])
        ) {

          $mapId = 'service-map';
          $mapHeight = '350px';
          $mapZoom = 14;

          $mapCenter = [
            (float) $latestCalendar['latitude'],
            (float) $latestCalendar['longitude']
          ];

          $locationName =
            ($latestCalendar['village'] ?? '') .
            ' ต.' . ($latestCalendar['subdistrict']['nameTh'] ?? '') .
            ' อ.' . ($latestCalendar['subdistrict']['district']['nameTh'] ?? '') .
            ' จ.' . ($latestCalendar['subdistrict']['district']['province']['nameTh'] ?? '');

          $mapMarkers = [
            [
              'lat' => (float) $latestCalendar['latitude'],
              'lng' => (float) $latestCalendar['longitude'],
              'popup' => '<b>จุดให้บริการล่าสุด</b><br>' . htmlspecialchars($locationName)
            ]
          ];

          include COMPONENT_PATH . 'leafmap_marker.php';

        } else {
          echo '
        <div class="d-flex align-items-center justify-content-center"
             style="height:350px; background:#f8f9fa; border-radius:10px;">
            <p class="text-muted">ยังไม่มีข้อมูลพิกัดการให้บริการ</p>
        </div>';
        }
        ?>
      </div>

      <div class="col-lg-4 order-2 order-lg-3 mt-2" style="text-align: center; align-content: center;"
        data-aos="fade-up" data-aos-delay="100">
        <?php if ($latestCalendar): ?>
          <div class="pricing-item featured">
            <h3><?= thaiDate($latestCalendar['date']) ?></h3>
            <span class="advanced bg-warning">ล่าสุด</span>
            <p><?= htmlspecialchars($latestCalendar['village']) ?>
              ต.<?= htmlspecialchars($latestCalendar['subdistrict']['nameTh'] ?? '') ?> <br>
              อ.<?= htmlspecialchars($latestCalendar['subdistrict']['district']['nameTh'] ?? '') ?>
              จ.<?= htmlspecialchars($latestCalendar['subdistrict']['district']['province']['nameTh'] ?? '') ?></p>
            <p>เปิดรับตัวอย่างดิน 9:00-9:30 น.(จองล่วงหน้า) <br>9:30-10:00 น.(walk-in จำนวนจำกัด)</p>
            <div class="btn-wrap">
              <a href="services/book/login" class="btn btn-primary me-md-2 text-white"
                style='font-size:15px; width: 250px;'><i class="bi bi-cart-fill"></i> จองเลย</a>
            </div>
          </div>
        <?php else: ?>
          <div class="pricing-item">
            <h3>ยังไม่มีรอบบริการ</h3>
            <p>โปรดติดตามประกาศตารางการให้บริการใหม่เร็วๆ นี้</p>
          </div>
        <?php endif; ?>
      </div>

      <?php include_once(COMPONENT_PATH . 'service.php') ?>
    </div>

  </div>

</section>

<?php include_once(COMPONENT_PATH . 'lib_footer.php') ?>
