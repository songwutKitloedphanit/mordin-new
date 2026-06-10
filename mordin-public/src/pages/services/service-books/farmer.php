<?php
session_start();

$cPAGE['name'] = "จองวิเคราะห์ดิน";//"หน้าหลัก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/login";
$cPAGE['desc'] = "จองเพื่อรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

// ตรวจสอบว่า login หรือยัง ถ้ายัง ให้กลับไปหน้า login
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

require_once __DIR__ . '/../../../services/FarmerAPI.php';


$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

$landData = FarmerAPI::getLandsByFarmerId($farmerId);
$lands = [];
if ($landData['httpCode'] === 200) {
  $lands = $landData['data'];
} else {
  // จัดการกรณี API error
  echo "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน";
  // สามารถแสดงหน้า error ที่สวยงามกว่านี้ได้
  exit;
}

$bookingError = $_SESSION['booking_error'] ?? null;
$bookingSuccess = $_SESSION['booking_success'] ?? null;
unset($_SESSION['booking_error']); // เคลียร์ค่าทิ้งหลังจากอ่าน
unset($_SESSION['booking_success']); // เคลียร์ค่าทิ้งหลังจากอ่าน

$factoryName    = $farmerProfile['factory']['name'] ?? '-';
$serviceAreaName = $farmerProfile['serviceArea']['name'] ?? '-';

function getStatusTag($status)
{
  switch ($status) {
    case 'ไม่ตรวจ':
      return ['class' => 'text-danger', 'text' => 'ปรับปรุงด่วน'];
    case 'จอง':
      return ['class' => 'text-warning', 'text' => 'ควรปรับปรุง'];
    case 'ตรวจ':
      return ['class' => 'text-success', 'text' => 'ปกติ'];
    default:
      return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
  }
}

function getStatusInfo($result)
{
  // [!! FIX !!] เพิ่มการตรวจสอบค่า null หรือ ไม่ใช่ตัวเลข
  if (is_null($result) || !is_numeric($result)) {
    return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
  }

  if ($result > 7.7) {
    return ['class' => 'text-primary', 'text' => 'ดีเยี่ยม'];
  } elseif ($result > 3.3 && $result <= 7.7) {
    return ['class' => 'text-success', 'text' => 'ปกติ'];
  } elseif ($result <= 3.3) {
    return ['class' => 'text-danger', 'text' => 'ปรับปรุงด่วน'];
  }

  // เพิ่ม Fallback กรณีไม่เข้าเงื่อนไขใดเลย
  return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
}

$initialLat = 13.7563;
$initialLng = 100.5018;

foreach ($lands as $land) {
  if (!empty($land['latitude']) && !empty($land['longitude'])) {
    $initialLat = (float)$land['latitude'];
    $initialLng = (float)$land['longitude'];
    break;
  }
}


include_once COMPONENT_PATH . 'lib_header.php'
  ?>

<link rel="stylesheet" href="/assets/css/leaflet.css" />

<section id="farmer-dashboard" class="section public-farmer-dashboard">

  <div class="container">

    <?php if ($bookingError): ?>
      <div class="alert alert-danger" role="alert">
        <strong>ล้มเหลว!</strong> <?= htmlspecialchars($bookingError) ?>
      </div>
    <?php endif; ?>
    <?php if ($bookingSuccess): ?>
      <div class="alert alert-success" role="alert">
        <strong>สำเร็จ!</strong> <?= htmlspecialchars($bookingSuccess) ?>
      </div>
    <?php endif; ?>

    <div class="public-farmer-toolbar">
      <div class="public-segment-tabs" role="navigation" aria-label="เมนูจองและผลวิเคราะห์ดิน">
        <a href="services/book/farmer" class="public-segment-tab is-active">จองวิเคราะห์ดิน</a>
        <a href="services/report/land" class="public-segment-tab">ผลวิเคราะห์ดิน</a>
      </div>
    </div>

    <div class="row gy-4 align-items-stretch public-farmer-summary">

      <div class="col-lg-5" data-aos="fade-up" data-aos-delay="100">
        <div class="public-farmer-map-card">
          <h3><i class="bi bi-map-fill me-2 text-primary"></i>ตำแหน่งแปลงปลูก</h3>
          <div id="land-map" class="public-farmer-map">
          </div>
        </div>
      </div>

      <div class="col-lg-7" data-aos="fade-up" data-aos-delay="100">
        <div class="public-member-card">
          <h3><i class="bi bi-person-fill me-2 text-primary"></i>ข้อมูลสมาชิก</h3>

          <table class="table public-member-table">
            <tbody>
              <tr>
                <th>ชื่อ-นามสกุล</th>
                <td><?= htmlspecialchars($farmerProfile['firstName'] . ' ' . $farmerProfile['lastName']) ?></td>
              </tr>
              <tr>
                <th>หมายเลขเกษตรกร</th>
                <td><?= htmlspecialchars($farmerProfile['thaiFarmerId'] ?? '-') ?></td>
              </tr>
              <tr>
                <th>หมายเลขโทรศัพท์</th>
                <td><?= htmlspecialchars($farmerProfile['phone']) ?></td>
              </tr>
              <tr>
                <th>โรงงาน</th>
                <td><?= htmlspecialchars($factoryName) ?></td>
              </tr>
              <tr>
                <th>เขตบริการ</th>
                <td><?= htmlspecialchars($serviceAreaName) ?></td>
              </tr>
            </tbody>
          </table>

          <div class="public-member-actions">
            <button onclick="location.href='/services/book/farmer/edit'" type="button"
              class="btn btn-warning text-white">
              <i class="bi bi-brush-fill"></i> แก้ไขข้อมูล
            </button>
            <button onclick="location.href='/services/book/land/add'" type="button"
              class="btn btn-success text-white">
              <i class="bi bi-pin-map-fill"></i> เพิ่มแปลงปลูก
            </button>
          </div>
        </div>
      </div>

      <div class="col-12 public-land-list" data-aos="fade-up" data-aos-delay="100">
        <hr class="public-land-divider">
        <h3>รายการแปลงปลูก</h3>
        <div class="row gy-4 public-land-grid">

          <?php if (empty($lands)): ?>
            <p class="text-center">ไม่พบข้อมูลผลการวิเคราะห์ดิน</p>
          <?php else: ?>
            <?php foreach ($lands as $land): ?>
              <?php
              $rawStatus      = $land['landStatus']['status'] ?? '';
              $landStatusInfo = getStatusInfo($land['landStatus']['resultValue']);
              $badgeMap    = ['ไม่ตรวจ' => 'badge-status-none', 'จอง' => 'badge-status-booked', 'ตรวจ' => 'badge-status-done'];
              $labelMap    = ['ไม่ตรวจ' => 'ยังไม่ตรวจ', 'จอง' => 'รอการตรวจ', 'ตรวจ' => 'ตรวจแล้ว'];
              $cardClassMap = ['ไม่ตรวจ' => 'status-none', 'จอง' => 'status-booked', 'ตรวจ' => 'status-done'];
              $badgeClass  = $badgeMap[$rawStatus]    ?? 'badge-status-unknown';
              $badgeLabel  = $labelMap[$rawStatus]    ?? 'ไม่มีข้อมูล';
              $cardClass   = $cardClassMap[$rawStatus] ?? '';
              ?>

              <div class="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div class="public-land-card <?= $cardClass ?>">

                  <div class="public-land-card-header">
                    <span class="public-land-badge <?= $badgeClass ?>"><?= $badgeLabel ?></span>
                    <form action="/services/book/land/edit" method="POST">
                      <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                      <button type="submit" class="public-land-edit-btn">
                        <i class="bi bi-pencil-fill"></i> แก้ไข
                      </button>
                    </form>
                  </div>

                  <h3 class="public-land-name"><?= htmlspecialchars($land['name']) ?></h3>
                  <p class="public-land-area">
                    <i class="bi bi-rulers"></i> <?= htmlspecialchars($land['areaSize'] ?? '-') ?> ไร่
                  </p>

                  <?php if ($rawStatus === 'จอง' && !empty($land['landStatus']['bookedDate'])): ?>
                    <p class="public-land-booked-info">
                      <i class="bi bi-calendar-check"></i>
                      จองวันที่ <?= htmlspecialchars($land['landStatus']['bookedDate']) ?>
                      <?php if (!empty($land['landStatus']['daysRemaining'])): ?>
                        <span class="text-muted">(อีก <?= htmlspecialchars($land['landStatus']['daysRemaining']) ?> วัน)</span>
                      <?php endif; ?>
                    </p>
                  <?php endif; ?>

                  <?php if (!empty($land['landStatus']['analysisDate'])): ?>
                    <div class="public-land-result">
                      <span class="public-land-result-label <?= $landStatusInfo['class'] ?>">
                        <i class="bi bi-circle-fill"></i> <?= htmlspecialchars($landStatusInfo['text']) ?>
                      </span>
                      <span class="public-land-result-date">
                        ตรวจเมื่อ <?= htmlspecialchars($land['landStatus']['daysPassed'] ?? '-') ?> วันที่แล้ว
                      </span>
                    </div>
                  <?php endif; ?>

                  <div class="public-land-actions mt-auto pt-3">

                    <?php if ($rawStatus === 'ไม่ตรวจ'): ?>
                      <form action="/services/book/create-booking" method="POST" class="w-100">
                        <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                        <button type="submit" class="btn btn-primary text-white w-100">
                          <i class="bi bi-cart-plus-fill"></i> จองเลย
                        </button>
                      </form>

                    <?php elseif ($rawStatus === 'จอง'): ?>
                      <div class="public-land-actions-inline w-100">
                        <form action="/services/book/update-booking" method="POST">
                          <input type="hidden" name="bookId" value="<?= $land['landStatus']['bookId'] ?>">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-warning text-white">
                            <i class="bi bi-arrow-left-right"></i> เปลี่ยนวัน
                          </button>
                        </form>
                        <form action="/services/book/cancel-booking" method="POST"
                          id="cancelForm-<?= $land['landStatus']['bookId'] ?>">
                          <input type="hidden" name="bookId" value="<?= $land['landStatus']['bookId'] ?>">
                          <button type="button" class="btn btn-danger text-white"
                            data-bs-toggle="modal" data-bs-target="#globalConfirmModal"
                            data-bs-title="ยืนยันการยกเลิก"
                            data-bs-message="คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?"
                            data-bs-form-id="cancelForm-<?= $land['landStatus']['bookId'] ?>">
                            <i class="bi bi-cart-dash-fill"></i> ยกเลิก
                          </button>
                        </form>
                      </div>

                    <?php elseif ($rawStatus === 'ตรวจ'): ?>
                      <div class="public-land-actions-stack w-100">
                        <form action="/services/book/create-booking" method="POST">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-primary text-white w-100">
                            <i class="bi bi-cart-plus-fill"></i> จองเลย
                          </button>
                        </form>
                        <form action="services/report/summary" method="POST">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-success text-white w-100">
                            <i class="bi bi-bar-chart-line-fill"></i> ผลวิเคราะห์
                          </button>
                        </form>
                      </div>
                    <?php endif; ?>

                    <a href="services/soil" class="btn btn-outline-secondary w-100">
                      <i class="bi bi-basket-fill"></i> เก็บตัวอย่างดิน
                    </a>
                  </div>

                </div>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>

        </div>
      </div>
    </div>

  </div>


</section><!-- /Contact Section -->


<?php include_once COMPONENT_PATH . "lib_footer.php" ?>

<script src="/assets/js/leaflet.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {

  const initialLat = <?= json_encode($initialLat) ?>;
  const initialLng = <?= json_encode($initialLng) ?>;

  const map = L.map('land-map').setView([initialLat, initialLng], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const lands = <?= json_encode($lands, JSON_UNESCAPED_UNICODE) ?>;
  const markers = [];

  lands.forEach(land => {
    if (land.latitude && land.longitude) {

      const lat = parseFloat(land.latitude);
      const lng = parseFloat(land.longitude);

      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <b>${land.name}</b><br>
          พื้นที่: ${land.areaSize ?? '-'} ไร่<br>
          สถานะ: ${land.landStatus?.status ?? '-'}
        `);

      markers.push(marker);
    }
  });

  // zoom ครอบทุกหมุด
  if (markers.length > 1) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  }
});
</script>
