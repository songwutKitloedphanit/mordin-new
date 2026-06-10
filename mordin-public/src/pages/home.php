<?php
        $cPAGE['name']  = "ความเป็นมา";
        $cPAGE['alias'] = "home";
        $cPAGE['link']  = "home.php";
        $cPAGE['desc']  = "การให้บริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

        require_once SERVICES_PATH . 'ServiceCalendarAPI.php';
        include_once UTILS_PATH . 'date.php';

        $homeCalendars = ServiceCalendarAPI::getPublicUpComingCalendar();
        $homeMapData = [];
        if (!empty($homeCalendars) && !isset($homeCalendars['error'])) {
            foreach ($homeCalendars as $cal) {
                $lat = floatval($cal['latitude'] ?? 0);
                $lng = floatval($cal['longitude'] ?? 0);
                if ($lat == 0 && $lng == 0) continue;
                $subdistrict = $cal['subdistrictName'] ?? $cal['subdistrict']['nameTh'] ?? '';
                $district    = $cal['districtName']    ?? $cal['district']['nameTh'] ?? $cal['subdistrict']['district']['nameTh'] ?? '';
                $province    = $cal['provinceName']    ?? $cal['province']['nameTh'] ?? $cal['subdistrict']['district']['province']['nameTh'] ?? '';
                $village     = $cal['village'] ?? '';
                $homeMapData[] = [
                    'lat'     => $lat,
                    'lng'     => $lng,
                    'date'    => $cal['date'] ?? '',
                    'address' => "{$village} ต.{$subdistrict} อ.{$district} จ.{$province}",
                ];
            }
        }

        include_once COMPONENT_PATH . 'lib_header.php';
?>

<link rel="stylesheet" href="/assets/css/leaflet.css" />

<!-- ═══ HERO ═══ -->
<section class="section public-home-hero">
  <div class="container">
    <div class="row align-items-center gy-5">

      <div class="col-lg-6" data-aos="fade-up" data-aos-delay="80">
        <div class="public-home-hero-copy">
          <p class="public-kicker">MITR PHOL SOIL SERVICE</p>
          <h1>หมอดินบริการวิเคราะห์ดินเคลื่อนที่</h1>
          <p>บริการตรวจวิเคราะห์ดินใกล้พื้นที่เกษตรกร ลดระยะเวลารอผล พร้อมข้อมูลสำหรับวางแผนจัดการดินและปุ๋ยอย่างเหมาะสม</p>
          <div class="public-home-actions">
            <a href="<?= $isPublicLoggedIn ? 'services/book/farmer' : 'services/book/login' ?>"
               class="public-home-cta-primary"<?= $isPublicLoggedIn ? '' : ' data-require-login="true"' ?>>
              <span class="public-home-cta-icon"><i class="bi bi-calendar-check-fill"></i></span>
              <span class="public-home-cta-text">
                <span class="public-home-cta-label">จองคิววิเคราะห์ดิน</span>
                <span class="public-home-cta-sub">เริ่มต้นใช้บริการ ฟรี</span>
              </span>
              <i class="bi bi-arrow-right-circle-fill public-home-cta-arrow"></i>
            </a>
            <a href="services/price" class="public-home-cta-secondary">
              <i class="bi bi-card-list"></i> ดูบริการและราคา
            </a>
          </div>
        </div>
      </div>

      <div class="col-lg-6" data-aos="fade-up" data-aos-delay="180">
        <div class="public-home-map-card">
          <div class="public-home-map-header">
            <span class="public-home-map-title">
              <i class="bi bi-geo-alt-fill"></i> จุดให้บริการที่กำลังจะมาถึง
            </span>
            <?php if (!empty($homeMapData)): ?>
              <span class="public-home-map-badge"><?= count($homeMapData) ?> จุด</span>
            <?php endif; ?>
          </div>
          <?php if (!empty($homeMapData)): ?>
            <div id="home-map" class="public-home-map"></div>
            <div class="public-home-map-footer">
              <a href="calendar">
                <i class="bi bi-calendar3"></i> ดูปฏิทินให้บริการทั้งหมด <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          <?php else: ?>
            <div class="public-home-map-empty">
              <i class="bi bi-calendar-x"></i>
              <p>ยังไม่มีรอบบริการในขณะนี้<br><a href="calendar">ติดตามประกาศได้ที่นี่</a></p>
            </div>
          <?php endif; ?>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ HIGHLIGHTS STRIP ═══ -->
<section class="section public-home-highlights py-0">
  <div class="container">
    <div class="public-home-highlights-grid" data-aos="fade-up">
      <div class="public-home-highlight-item">
        <div class="public-home-highlight-icon"><i class="bi bi-currency-exchange"></i></div>
        <div>
          <strong>ฟรี (ปีที่ 1)</strong>
          <span>ไม่มีค่าใช้จ่าย</span>
        </div>
      </div>
      <div class="public-home-highlight-item">
        <div class="public-home-highlight-icon"><i class="bi bi-clock-history"></i></div>
        <div>
          <strong>ผลใน 6 ชั่วโมง</strong>
          <span>เร็วกว่า 2–3 สัปดาห์</span>
        </div>
      </div>
      <div class="public-home-highlight-item">
        <div class="public-home-highlight-icon"><i class="bi bi-geo-alt"></i></div>
        <div>
          <strong>ใกล้พื้นที่คุณ</strong>
          <span>ครอบคลุมเขตส่งเสริม</span>
        </div>
      </div>
      <div class="public-home-highlight-item">
        <div class="public-home-highlight-icon"><i class="bi bi-bar-chart-line"></i></div>
        <div>
          <strong>ธาตุอาหารครบถ้วน</strong>
          <span>ไม่จำกัดแค่ NPK</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ ABOUT ═══ -->
<section class="section public-home-about">
  <div class="container">
    <div class="row gy-5 align-items-center">

      <div class="col-lg-5" data-aos="fade-up" data-aos-delay="80">
        <div class="public-home-about-img">
          <img src="assets/img/soil-car.jpg" class="img-fluid" alt="รถวิเคราะห์ดินเคลื่อนที่">
        </div>
      </div>

      <div class="col-lg-7" data-aos="fade-up" data-aos-delay="160">
        <div class="public-section-heading">
          <p>เกี่ยวกับเรา</p>
          <h2>การให้บริการบนรถวิเคราะห์ดินเคลื่อนที่</h2>
        </div>
        <p>ในปัจจุบันที่ราคาปุ๋ยเคมีปรับตัวสูงขึ้น การใส่ปุ๋ยตามค่าวิเคราะห์ดินจึงมีความสำคัญมากขึ้น
          แต่สถานที่บริการมักอยู่ไกล ใช้เวลานาน 2–3 สัปดาห์กว่าจะได้ผล และมีค่าบริการสูง</p>
        <p>กลุ่มมิตรผลจึงจัดทำ<strong>รถบริการวิเคราะห์ดินเคลื่อนที่</strong> เพื่อออกให้บริการในพื้นที่เขตส่งเสริมอ้อยฯ
          เกษตรกรจะได้รับผลวิเคราะห์ดินภายใน 1 วัน พร้อมคำแนะนำการจัดการดินและปุ๋ยที่เหมาะสมกับพื้นที่</p>
        <div class="public-home-benefit-list mt-3">
          <div class="public-home-benefit-item">
            <i class="bi bi-check-circle-fill"></i>
            <span>ช่วยเพิ่มผลผลิตและคุณภาพอ้อย</span>
          </div>
          <div class="public-home-benefit-item">
            <i class="bi bi-check-circle-fill"></i>
            <span>ลดต้นทุน เพิ่มรายได้และกำไร</span>
          </div>
          <div class="public-home-benefit-item">
            <i class="bi bi-check-circle-fill"></i>
            <span>ปรับปรุงคุณภาพดินระยะยาว</span>
          </div>
          <div class="public-home-benefit-item">
            <i class="bi bi-check-circle-fill"></i>
            <span>เพิ่มความยั่งยืนในการทำการเกษตร</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ COMPARISON TABLE ═══ -->
<section class="section public-home-comparison light-background">
  <div class="container">
    <div class="public-section-heading text-center" data-aos="fade-up">
      <p>ทำไมต้องเลือกเรา</p>
      <h2>เปรียบเทียบบริการ</h2>
    </div>
    <div class="public-table-card" data-aos="fade-up" data-aos-delay="100">
      <table class="table public-home-compare-table mb-0">
        <thead>
          <tr>
            <th scope="col" aria-label="หัวข้อเปรียบเทียบ"></th>
            <th scope="col">ห้องปฏิบัติการทั่วไป</th>
            <th scope="col">ชุดทดสอบ Test kit</th>
            <th scope="col" class="public-compare-highlight-col">รถวิเคราะห์ดินเคลื่อนที่ <span class="public-compare-badge">แนะนำ</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">ค่าวิเคราะห์ดิน</th>
            <td>2,000 บาท/ตัวอย่าง</td>
            <td>70 บาท/ตัวอย่าง</td>
            <td class="public-compare-highlight-col"><strong class="text-success">ฟรี (ปีที่ 1)</strong></td>
          </tr>
          <tr>
            <th scope="row">ระยะเวลาผล</th>
            <td>2–3 สัปดาห์</td>
            <td>30 นาที</td>
            <td class="public-compare-highlight-col"><strong>6 ชั่วโมง</strong></td>
          </tr>
          <tr>
            <th scope="row">ธาตุอาหารที่วิเคราะห์</th>
            <td>ทุกธาตุอาหาร</td>
            <td>เฉพาะ NPK</td>
            <td class="public-compare-highlight-col">ธาตุอาหารที่จำเป็นครบถ้วน</td>
          </tr>
          <tr>
            <th scope="row">ปริมาณสารเคมี</th>
            <td>ปริมาณมาก</td>
            <td>ปริมาณน้อย</td>
            <td class="public-compare-highlight-col">ปริมาณน้อย</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<?php include_once COMPONENT_PATH . '/lib_footer.php' ?>

<script src="/assets/js/leaflet.js"></script>
<script>
(function () {
  var mapData = <?= json_encode($homeMapData, JSON_UNESCAPED_UNICODE) ?>;
  var mapEl = document.getElementById('home-map');
  if (!mapEl) return;

  var map = L.map('home-map', { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  if (mapData.length === 0) {
    map.setView([15.87, 100.99], 6);
    return;
  }

  var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  function thaiShort(d) {
    if (!d) return '';
    var dt = new Date(d);
    return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + (dt.getFullYear() + 543);
  }

  var markers = mapData.map(function(item) {
    var m = L.marker([item.lat, item.lng]).addTo(map);
    m.bindPopup('<strong>' + thaiShort(item.date) + '</strong><br><span style="font-size:0.85rem">' + item.address + '</span>');
    return m;
  });

  if (markers.length === 1) {
    map.setView([mapData[0].lat, mapData[0].lng], 10);
  } else {
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
  }
  setTimeout(function() { map.invalidateSize(); }, 350);
}());
</script>
