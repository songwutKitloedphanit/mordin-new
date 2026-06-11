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
$landLoadError = null;
if (($landData['httpCode'] ?? 0) === 200) {
  $lands = $landData['data'];
} else {
  $landLoadError = $landData['data']['message'] ?? $landData['error'] ?? 'เกิดข้อผิดพลาดในการดึงข้อมูลแปลงปลูก';
}

$bookingError = $_SESSION['booking_error'] ?? null;
$bookingSuccess = $_SESSION['booking_success'] ?? null;
unset($_SESSION['booking_error']); // เคลียร์ค่าทิ้งหลังจากอ่าน
unset($_SESSION['booking_success']); // เคลียร์ค่าทิ้งหลังจากอ่าน

$factoryName    = $farmerProfile['factory']['name'] ?? '-';
$serviceAreaName = $farmerProfile['serviceArea']['name'] ?? '-';
$farmerFullName = trim(($farmerProfile['firstName'] ?? '') . ' ' . ($farmerProfile['lastName'] ?? ''));
$farmerInitial = preg_match('/./u', $farmerFullName, $initialMatch) ? $initialMatch[0] : 'U';

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

$landSummary = [
  'total' => count($lands),
  'pending' => 0,
  'booked' => 0,
  'checked' => 0,
];

foreach ($lands as $land) {
  $status = $land['landStatus']['status'] ?? '';
  if ($status === 'ไม่ตรวจ') {
    $landSummary['pending']++;
  } elseif ($status === 'จอง') {
    $landSummary['booked']++;
  } elseif ($status === 'ตรวจ') {
    $landSummary['checked']++;
  }
}


include_once COMPONENT_PATH . 'lib_header.php'
  ?>

<link rel="stylesheet" href="/assets/css/leaflet.css" />

<section class="section public-modern-page-hero public-farmer-modern-hero public-workspace-hero">
  <div class="container">
    <div class="public-modern-hero-grid">
      <div class="public-modern-hero-copy scroll-reveal">
        <span class="public-modern-kicker"><i class="bi bi-person-vcard"></i> BOOKING WORKSPACE</span>
        <h1>สวัสดี คุณ<?= htmlspecialchars($farmerFullName ?: 'ผู้ใช้งาน') ?></h1>
        <p>จัดการข้อมูลสมาชิก แปลงปลูก สถานะการจอง และเข้าถึงผลวิเคราะห์ดินจากบัญชีเกษตรกรของคุณ</p>
        <div class="public-workspace-chips">
          <span><i class="bi bi-building"></i><?= htmlspecialchars($factoryName) ?></span>
          <span><i class="bi bi-geo-alt"></i><?= htmlspecialchars($serviceAreaName) ?></span>
        </div>
      </div>
      <div class="public-modern-metrics scroll-reveal stagger-1">
        <div class="public-modern-metric">
          <span class="purecounter" data-purecounter-start="0" data-purecounter-end="<?= $landSummary['total'] ?>" data-purecounter-duration="1"><?= $landSummary['total'] ?></span>
          <p>แปลงทั้งหมด</p>
        </div>
        <div class="public-modern-metric">
          <span class="purecounter" data-purecounter-start="0" data-purecounter-end="<?= $landSummary['pending'] ?>" data-purecounter-duration="1"><?= $landSummary['pending'] ?></span>
          <p>ยังไม่ตรวจ</p>
        </div>
        <div class="public-modern-metric">
          <span class="purecounter" data-purecounter-start="0" data-purecounter-end="<?= $landSummary['booked'] ?>" data-purecounter-duration="1"><?= $landSummary['booked'] ?></span>
          <p>จองแล้ว</p>
        </div>
        <div class="public-modern-metric">
          <span class="purecounter" data-purecounter-start="0" data-purecounter-end="<?= $landSummary['checked'] ?>" data-purecounter-duration="1"><?= $landSummary['checked'] ?></span>
          <p>ตรวจแล้ว</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="farmer-dashboard" class="section public-farmer-dashboard">

  <div class="container">

    <?php if ($landLoadError): ?>
      <div class="alert alert-danger alert-dismissible fade show public-workspace-alert" role="alert">
        <strong>โหลดข้อมูลไม่สำเร็จ</strong> <?= htmlspecialchars($landLoadError) ?>
        <a href="/services/book/farmer" class="btn btn-sm btn-outline-danger ms-2">ลองใหม่</a>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    <?php endif; ?>
    <?php if ($bookingError): ?>
      <div class="alert alert-danger alert-dismissible fade show public-workspace-alert" role="alert">
        <strong>ล้มเหลว!</strong> <?= htmlspecialchars($bookingError) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    <?php endif; ?>
    <?php if ($bookingSuccess): ?>
      <div class="alert alert-success alert-dismissible fade show public-workspace-alert" role="alert">
        <strong>สำเร็จ!</strong> <?= htmlspecialchars($bookingSuccess) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    <?php endif; ?>

    <div class="public-farmer-toolbar">
      <div class="public-segment-tabs" role="navigation" aria-label="เมนูจองและผลวิเคราะห์ดิน">
        <a href="/services/book/farmer" class="public-segment-tab is-active">จองวิเคราะห์ดิน</a>
        <a href="/services/report/land" class="public-segment-tab">ผลวิเคราะห์ดิน</a>
      </div>
    </div>

    <div class="row gy-4 align-items-stretch public-farmer-summary">

      <div class="col-lg-4 scroll-reveal stagger-1">
        <div class="public-member-card public-modern-card">
          <div class="public-member-head">
            <span class="public-member-avatar"><?= htmlspecialchars($farmerInitial) ?></span>
            <div>
              <h3><?= htmlspecialchars($farmerFullName ?: 'ข้อมูลสมาชิก') ?></h3>
              <p><?= htmlspecialchars($farmerProfile['thaiFarmerId'] ?? 'ยังไม่มีเลขเกษตรกร') ?></p>
            </div>
          </div>

          <div class="public-member-facts">
            <div><span>หมายเลขโทรศัพท์</span><strong><?= htmlspecialchars($farmerProfile['phone']) ?></strong></div>
            <div><span>โรงงาน</span><strong><?= htmlspecialchars($factoryName) ?></strong></div>
            <div><span>เขตบริการ</span><strong><?= htmlspecialchars($serviceAreaName) ?></strong></div>
          </div>

          <div class="public-member-actions">
            <button onclick="location.href='/services/book/farmer/edit'" type="button"
              class="btn btn-outline-primary">
              <i class="bi bi-brush-fill"></i> แก้ไขข้อมูล
            </button>
            <button onclick="location.href='/services/book/land/add'" type="button"
              class="btn btn-success text-white">
              <i class="bi bi-pin-map-fill"></i> เพิ่มแปลงปลูก
            </button>
          </div>
        </div>
      </div>

      <?php if (!empty($lands)): ?>
        <div class="col-lg-8 scroll-reveal stagger-2">
          <div class="public-farmer-map-card public-modern-card">
            <div class="public-map-card-head">
              <h3><i class="bi bi-map-fill me-2 text-primary"></i>ตำแหน่งแปลงปลูก</h3>
              <span><?= count($lands) ?> แปลง</span>
            </div>
            <div id="land-map" class="public-farmer-map"></div>
          </div>
        </div>
      <?php endif; ?>

      <div class="col-12 public-land-list scroll-reveal stagger-1">
        <hr class="public-land-divider">
        <h3>รายการแปลงปลูก</h3>
        <div class="row gy-4 public-land-grid">

          <?php if (empty($lands)): ?>
            <div class="col-12">
              <div class="public-empty-land-card">
                <div class="public-empty-land-icon"><i class="bi bi-map"></i></div>
                <h4>ยังไม่มีแปลงปลูกในบัญชีของคุณ</h4>
                <p>เพิ่มแปลงปลูกแรกเพื่อเริ่มจองคิววิเคราะห์ดินและติดตามผลรายแปลง</p>
                <a href="/services/book/land/add?welcome=1" class="btn btn-primary text-white btn-lg">
                  <i class="bi bi-plus-circle"></i> เพิ่มแปลงปลูกแรก
                </a>
              </div>
            </div>
          <?php else: ?>
            <?php foreach ($lands as $land): ?>
              <?php
              $rawStatus      = $land['landStatus']['status'] ?? '';
              $landStatusInfo = getStatusInfo($land['landStatus']['resultValue'] ?? null);
              $badgeMap    = ['ไม่ตรวจ' => 'badge-status-none', 'จอง' => 'badge-status-booked', 'ตรวจ' => 'badge-status-done'];
              $labelMap    = ['ไม่ตรวจ' => 'ยังไม่ตรวจ', 'จอง' => 'รอการตรวจ', 'ตรวจ' => 'ตรวจแล้ว'];
              $cardClassMap = ['ไม่ตรวจ' => 'status-none', 'จอง' => 'status-booked', 'ตรวจ' => 'status-done'];
              $badgeClass  = $badgeMap[$rawStatus]    ?? 'badge-status-unknown';
              $badgeLabel  = $labelMap[$rawStatus]    ?? 'ไม่มีข้อมูล';
              $cardClass   = $cardClassMap[$rawStatus] ?? '';
              ?>

              <div class="col-xl-4 col-lg-6 scroll-reveal stagger-<?= (($landIdx = isset($landIdx) ? $landIdx + 1 : 0) % 5) + 1 ?>">
                <div class="public-land-card public-modern-card <?= $cardClass ?>">

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
                    <?php if (!empty($land['subdistrict']['nameTh'])): ?>
                      <span><i class="bi bi-geo"></i> ต.<?= htmlspecialchars($land['subdistrict']['nameTh']) ?></span>
                    <?php endif; ?>
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
                        <form action="/services/report/summary" method="POST">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-success text-white w-100">
                            <i class="bi bi-bar-chart-line-fill"></i> ผลวิเคราะห์
                          </button>
                        </form>
                      </div>
                    <?php endif; ?>

                    <a href="/services/soil" class="btn btn-outline-secondary w-100">
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
  const mapEl = document.getElementById('land-map');
  if (!mapEl || typeof L === 'undefined') return;

  const initialLat = <?= json_encode($initialLat) ?>;
  const initialLng = <?= json_encode($initialLng) ?>;

  const map = L.map(mapEl).setView([initialLat, initialLng], 7);

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
