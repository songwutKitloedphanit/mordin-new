<?php
require_once SERVICES_PATH . 'ServiceCalendarAPI.php';
include_once UTILS_PATH . 'date.php';

$cPAGE['name'] = "สถานะการให้บริการ";//"หน้าหลัก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "services/mitr";
$cPAGE['desc'] = "สถานะการให้บริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

$data = ServiceCalendarAPI::getUpComingCalendar();
$serviceCalendars = (!empty($data) && is_array($data) && !isset($data['error'])) ? $data : [];
$latestCalendar = !empty($serviceCalendars) ? $serviceCalendars[0] : null;

$bookingMax = $latestCalendar['numberOfSamples'] ?? 0;
$bookingCurrent = $latestCalendar['numberOfBookings'] ?? 0;
$available = $bookingMax - $bookingCurrent;
$available = $available > 0 ? $available : 0;

include_once COMPONENT_PATH . 'lib_header.php'
  ?>

<section class="section public-modern-page-hero public-status-hero">
  <div class="container">
    <div class="public-modern-hero-grid">
      <div class="public-modern-hero-copy" data-aos="fade-up">
        <span class="public-modern-kicker"><i class="bi bi-activity"></i> Service Status</span>
        <h1>สถานะการให้บริการรถวิเคราะห์ดิน</h1>
        <p>ติดตามรอบบริการล่าสุด จำนวนการจอง คิวคงเหลือ และตำแหน่งให้บริการจากข้อมูลระบบเดิมแบบไม่ต้องเข้าแดชบอร์ดภายใน</p>
      </div>
      <div class="public-modern-metrics" data-aos="fade-up" data-aos-delay="100">
        <div class="public-modern-metric">
          <span><?= count($serviceCalendars) ?></span>
          <p>รอบทั้งหมด</p>
        </div>
        <div class="public-modern-metric">
          <span><?= intval($bookingCurrent) ?></span>
          <p>จองล่าสุด</p>
        </div>
        <div class="public-modern-metric">
          <span><?= intval($available) ?></span>
          <p>คิวคงเหลือ</p>
        </div>
        <div class="public-modern-metric">
          <span><?= intval($bookingMax) ?></span>
          <p>จำนวนรับสูงสุด</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section public-status-toggle-bar pb-2 pt-0">
  <div class="container" data-aos="fade-up">
    <div class="d-flex justify-content-center">
      <div class="public-tab-toggle">
        <a href="/calendar" class="public-tab-toggle-item">
          <i class="bi bi-calendar3"></i> ปฏิทินให้บริการ
        </a>
        <a href="services/mitr" class="public-tab-toggle-item is-active">
          <i class="bi bi-activity"></i> สถานะการบริการ
        </a>
      </div>
    </div>
  </div>
</section>

<section id="counts" class="section counts light-background public-status-page pt-3">
  <div class="container" data-aos="fade-up" data-aos-delay="100">
    <div class="row gy-4 public-status-stats">
      <div class="col-lg-3 col-md-6">
        <div class="stats-item public-status-stat public-modern-card text-center w-100 h-100">
          <i class="bi bi-calendar-check-fill"></i>
          <span data-purecounter-start="0" data-purecounter-end="<?= $latestCalendar['numberOfBookings'] ?? 0 ?>"
            data-purecounter-duration="1" class="purecounter"></span>
          <p>จองส่งตัวอย่าง</p>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stats-item public-status-stat public-modern-card text-center w-100 h-100">
          <i class="bi bi-box-seam-fill"></i>
          <span data-purecounter-start="0" data-purecounter-end="0" data-purecounter-duration="1"
            class="purecounter"></span>
          <p>ส่งตัวอย่างแล้ว (เฉพาะที่จอง)</p>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stats-item public-status-stat public-modern-card text-center w-100 h-100">
          <i class="bi bi-stack"></i>
          <span data-purecounter-start="0" data-purecounter-end="0" data-purecounter-duration="1"
            class="purecounter"></span>
          <p>ส่งตัวอย่างแล้ว (ทั้งหมด)</p>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="stats-item public-status-stat public-modern-card text-center w-100 h-100">
          <i class="bi bi-plus-circle-fill"></i>
          <span data-purecounter-start="0" data-purecounter-end="<?= $available > 0 ? $available : 0 ?>"
            data-purecounter-duration="1" class="purecounter"></span>
          <p>ส่งเพิ่มได้อีก</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="service-status" class="section public-status-detail">
  <div class="container">
    <div class="row gy-4 align-items-stretch">
      <div class="col-lg-7" data-aos="fade-up" data-aos-delay="100">
        <div class="public-status-map-card saas-map-card">
          <h3><i class="bi bi-geo-alt-fill me-2 text-primary"></i>จุดให้บริการล่าสุด</h3>
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

            include_once COMPONENT_PATH . 'leafmap_marker.php';

          } else {
            echo '
          <div class="public-map-empty">
              <p>ยังไม่มีข้อมูลพิกัดการให้บริการ</p>
          </div>';
          }
          ?>
        </div>
      </div>

      <div class="col-lg-5" data-aos="fade-up" data-aos-delay="100">
        <?php if ($latestCalendar): ?>
          <div class="public-status-card public-modern-card featured">
            <span class="public-status-badge bg-warning">ล่าสุด</span>
            <h3><?= thaiDate($latestCalendar['date']) ?></h3>
            <p><?= htmlspecialchars($latestCalendar['village']) ?>
              ต.<?= htmlspecialchars($latestCalendar['subdistrict']['nameTh'] ?? '') ?> <br>
              อ.<?= htmlspecialchars($latestCalendar['subdistrict']['district']['nameTh'] ?? '') ?>
              จ.<?= htmlspecialchars($latestCalendar['subdistrict']['district']['province']['nameTh'] ?? '') ?></p>
            <p>เปิดรับตัวอย่างดิน 9:00-9:30 น.(จองล่วงหน้า) <br>9:30-10:00 น.(walk-in จำนวนจำกัด)</p>
            <div class="btn-wrap">
              <a href="<?= $isPublicLoggedIn ? '/services/book/farmer' : '/services/book/login' ?>" class="btn btn-primary text-white"<?= $isPublicLoggedIn ? '' : ' data-require-login="true"' ?>><i class="bi bi-cart-fill"></i> จองเลย</a>
            </div>
          </div>
        <?php else: ?>
          <div class="public-status-card public-modern-card">
            <h3>ยังไม่มีรอบบริการ</h3>
            <p>โปรดติดตามประกาศตารางการให้บริการใหม่เร็วๆ นี้</p>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</section>

<?php include_once COMPONENT_PATH . 'lib_footer.php' ?>
