<?php
session_start();

$cPAGE['name'] = "แก้ไขแปลงปลูก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/farmer";
$cPAGE['desc'] = "แก้ไขข้อมูลแปลงปลูก";

// 1. ตรวจสอบ Login
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

// 2. Include services
require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../services/AddressAPI.php');

// 3. เตรียมข้อมูล
$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];
$error = null;
$success = null;
$land = null;
$landId = null;

// 4. ตรวจสอบ Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: /services/book/farmer');
  exit;
}

// 5. รับค่า Land ID จาก POST
$landId = $_POST['landId'] ?? null;
if (!$landId) {
  $_SESSION['booking_error'] = 'ไม่พบรหัสแปลง';
  header('Location: /services/book/farmer');
  exit;
}

// 6. ตรวจสอบว่าเป็นการ "โหลด" หรือ "บันทึก"
// (ถ้ามี 'name' มาด้วย คือการบันทึก)
if (isset($_POST['name'])) {
  // --- 6A. Handle Form Submit (บันทึก) ---
  $data = [
    'farmerId'    => intval($farmerId), // [สำคัญ] เพื่อยืนยันตัวตน
    'name'        => $_POST['name'] ?? null,
    'areaSize'    => !empty($_POST['areaSize']) ? floatval($_POST['areaSize']) : null,
    'latitude'    => $_POST['latitude'] ?? null,
    'longitude'   => $_POST['longitude'] ?? null,
    'landCode'    => $_POST['landCode'] ?? null,
    'quotaCode'   => $_POST['quotaCode'] ?? null,
    'village'     => $_POST['village'] ?? null,
  ];

  $res = FarmerAPI::updateLand($landId, $data);

  if ($res['success']) {
    $_SESSION['booking_success'] = 'แก้ไขแปลงปลูก "' . htmlspecialchars($data['name']) . '" เรียบร้อยแล้ว';
    header('Location: /services/book/farmer');
    exit;
  } else {
    $error = "แก้ไขล้มเหลว: " . ($res['message'] ?? 'ไม่ทราบสาเหตุ');
    // ดึงข้อมูลเดิมมาแสดงคู่กับ error (ยกเว้นข้อมูลที่มาจาก subdistrict)
    $landRes = FarmerAPI::getLandById($landId);
    if($landRes['success']) {
        $land = $landRes['data'];
        // เอาข้อมูลที่กรอกผิดทับลงไป
        $land = array_merge($land, $data);
    } else {
        $land = $data; // ถ้าดึงไม่สำเร็จ ก็ยังแสดงที่กรอกมา
    }
  }

} else {
  // --- 6B. Handle Page Load (โหลดข้อมูล) ---
  $res = FarmerAPI::getLandById($landId);
  if ($res['success']) {
    $land = $res['data'];
    // ตรวจสอบความเป็นเจ้าของ
    if ($land['farmerId'] != $farmerId) {
      $_SESSION['booking_error'] = 'คุณไม่มีสิทธิ์แก้ไขแปลงนี้';
      header('Location: /services/book/farmer');
      exit;
    }
  } else {
    $error = "ไม่พบข้อมูลแปลง: " . $res['message'];
  }
}


include_once(COMPONENT_PATH . 'lib_header.php');
?>

<link rel="stylesheet" href="/assets/css/leaflet.css">

<main class="main">
  <div class="page-title">
    <div class="container">
      <nav class="breadcrumbs">
        <ol>
          <li><a href="/services/book/farmer">ข้อมูลเกษตรกร</a></li>
          <li class="current">แก้ไขแปลงปลูก</li>
        </ol>
      </nav>
      <h1>แก้ไขแปลง: <?= htmlspecialchars($land['name'] ?? '...') ?></h1>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="row">
        <div class="col-lg-8 offset-lg-2">
          
          <?php if ($error): ?>
            <div class="alert alert-danger">
              <?= htmlspecialchars($error) ?>
            </div>
          <?php endif; ?>

          <?php if ($land): ?>
          <div class="card shadow border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold"><i class="bi bi-pin-map-fill me-2"></i> แก้ไขรายละเอียดแปลง</h5>
            </div>
            <div class="card-body p-4">
              <form method="POST">
                <input type="hidden" name="landId" value="<?= htmlspecialchars($landId) ?>">
                
                <input type="hidden" name="latitude" id="latitude" value="<?= htmlspecialchars($land['latitude'] ?? '') ?>">
                <input type="hidden" name="longitude" id="longitude" value="<?= htmlspecialchars($land['longitude'] ?? '') ?>">

                <div class="row g-3">
                  
                  <div class="col-md-12">
                    <label class="form-label">ชื่อแปลง <span class="text-danger">*</span></label>
                    <input type="text" name="name" class="form-control" required 
                           value="<?= htmlspecialchars($land['name'] ?? '') ?>">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">ขนาดพื้นที่ (ไร่)</label>
                    <input type="number" step="0.01" name="areaSize" class="form-control"
                           value="<?= htmlspecialchars($land['areaSize'] ?? '') ?>">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">หมู่บ้าน</label>
                    <input type="text" name="village" class="form-control"
                           value="<?= htmlspecialchars($land['village'] ?? '') ?>">
                  </div>
                  
                  <hr class="my-3">
                  <h6 class="text-primary fw-bold">ที่ตั้งแปลง (ไม่สามารถแก้ไขได้)</h6>

                  <div class="col-md-4">
                    <label class="form-label">จังหวัด</label>
                    <input type="text" class="form-control" 
                           value="<?= htmlspecialchars($land['subdistrict']['district']['province']['nameTh'] ?? 'N/A') ?>" readonly disabled>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">อำเภอ</label>
                    <input type="text" class="form-control" 
                           value="<?= htmlspecialchars($land['subdistrict']['district']['nameTh'] ?? 'N/A') ?>" readonly disabled>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">ตำบล</label>
                    <input type="text" class="form-control" 
                           value="<?= htmlspecialchars($land['subdistrict']['nameTh'] ?? 'N/A') ?>" readonly disabled>
                  </div>

                  <div class="col-12">
                    <label class="form-label">ปักหมุดบนแผนที่ (ลากหมุดเพื่อแก้ไข)</label>
                    <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
                  </div>

                  <hr class="my-3">

                  <div class="col-md-6">
                    <label class="form-label">รหัสแปลง (ถ้ามี)</label>
                    <input type="text" name="landCode" class="form-control"
                           value="<?= htmlspecialchars($land['landCode'] ?? '') ?>">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">รหัสโควต้า (ถ้ามี)</label>
                    <input type="text" name="quotaCode" class="form-control"
                           value="<?= htmlspecialchars($land['quotaCode'] ?? '') ?>">
                  </div>

                  <div class="col-12 mt-4">
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                      <i class="bi bi-check-circle-fill"></i> บันทึกการเปลี่ยนแปลง
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </section>
</main>

<script src="/assets/js/leaflet.js"></script>
<script>
  let map, marker;
  const latInput = document.getElementById('latitude');
  const lngInput = document.getElementById('longitude');

  function initMap() {
    const mapDiv = document.getElementById('map');
    if (!latInput || !lngInput || !mapDiv) return;

    const startLat = parseFloat(latInput.value) || 13.7563;
    const startLng = parseFloat(lngInput.value) || 100.5018;
    const startLocation = [startLat, startLng];

    if (typeof L === 'undefined') {
      mapDiv.innerHTML = 'ไม่สามารถโหลดแผนที่ได้';
      console.error('Leaflet is not loaded.');
      return;
    }

    latInput.value = startLat.toFixed(6);
    lngInput.value = startLng.toFixed(6);

    map = L.map(mapDiv).setView(startLocation, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    marker = L.marker(startLocation, { draggable: true }).addTo(map);
    marker.on('dragend', function() {
      const newPos = marker.getLatLng();
      latInput.value = newPos.lat.toFixed(6);
      lngInput.value = newPos.lng.toFixed(6);
    });

    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }

  document.addEventListener('DOMContentLoaded', initMap);
</script>

<?php include_once(COMPONENT_PATH . "lib_footer.php"); ?>
