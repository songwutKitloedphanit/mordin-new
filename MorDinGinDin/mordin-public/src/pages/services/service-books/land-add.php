<?php
session_start();

$cPAGE['name'] = "เพิ่มแปลงปลูก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/farmer";
$cPAGE['desc'] = "เพิ่มแปลงปลูกใหม่สำหรับเกษตรกร";

// 1. ตรวจสอบ Login
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

// 2. Include services
require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../services/AddressAPI.php'); // [!!]
                                                             // เพิ่ม

// 3. เตรียมข้อมูล
$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];
$error = null;
$success = null;

// [!!] ดึงข้อมูลจังหวัดสำหรับ
// Dropdown
// แรก
$res = AddressAPI::getProvinces();
$provinces = $res['success'] ? $res['data'] : [];

// 4. Handle Form Submit (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  
  // รวบรวมข้อมูลจากฟอร์ม
  $data = [
    'farmerId'    => intval($farmerId),
    'name'        => $_POST['name'] ?? null,
    'areaSize'    => isset($_POST['areaSize']) && $_POST['areaSize'] !== '' ? floatval($_POST['areaSize']) : null,
    'latitude'    => isset($_POST['latitude']) && $_POST['latitude'] !== '' ? (string) round(floatval($_POST['latitude']), 6) : null,
    'longitude'   => isset($_POST['longitude']) && $_POST['longitude'] !== '' ? (string) round(floatval($_POST['longitude']), 6) : null,
    'landCode'    => $_POST['landCode'] ?? null,
    'quotaCode'   => $_POST['quotaCode'] ?? null,
    'village'     => $_POST['village'] ?? null,
    'subdistrictCode' => $_POST['subdistrictCode'] ?? null, // [!!]
                                                            // จะมาจาก
                                                            // Dropdown
    'zipCode'     => !empty($_POST['zipCode']) ? intval($_POST['zipCode']) : 0, // [!!]
                                                                                  // จะมาจาก
                                                                                  // Dropdown
  ];

  $res = FarmerAPI::createLand($data);

  if ($res['success']) {
    $_SESSION['booking_success'] = 'สร้างแปลงปลูก "' . htmlspecialchars($data['name']) . '" เรียบร้อยแล้ว';
    header('Location: /services/book/farmer');
    exit;
  } else {
    $error = "สร้างแปลงปลูกล้มเหลว: " . ($res['message'] ?? 'ไม่ทราบสาเหตุ');
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
          <li class="current">เพิ่มแปลงปลูก</li>
        </ol>
      </nav>
      <h1>เพิ่มแปลงปลูกใหม่</h1>
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

          <div class="card shadow border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold"><i class="bi bi-pin-map-fill me-2"></i> กรอกรายละเอียดแปลง</h5>
            </div>
            <div class="card-body p-4">
              <form method="POST" id="landForm">
                
                <input type="hidden" name="latitude" id="latitude">
                <input type="hidden" name="longitude" id="longitude">

                <div class="row g-3">
                  
                  <div class="col-md-12">
                    <label class="form-label">ชื่อแปลง <span class="text-danger">*</span></label>
                    <input type="text" name="name" class="form-control" required placeholder="เช่น แปลงข้างบ้าน">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">ขนาดพื้นที่ (ไร่) <span class="text-danger">*</span></label>
                    <input type="number" step="0.01" name="areaSize" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">หมู่บ้าน</label>
                    <input type="text" name="village" class="form-control">
                  </div>
                  
                  <hr class="my-3">
                  <h6 class="text-primary fw-bold">เลือกที่ตั้งแปลง</h6>

                  <div class="col-md-4">
                    <label class="form-label">จังหวัด <span class="text-danger">*</span></label>
                    <select id="provinceSelect" class="form-select" required>
                      <option value="" selected disabled>-- เลือกจังหวัด --</option>
                      <?php foreach ($provinces as $province): ?>
                        <option value="<?= $province['code'] ?>"><?= htmlspecialchars($province['nameTh']) ?></option>
                      <?php endforeach; ?>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">อำเภอ <span class="text-danger">*</span></label>
                    <select id="districtSelect" class="form-select" required disabled>
                      <option value="">-- เลือกอำเภอ --</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">ตำบล <span class="text-danger">*</span></label>
                    <select id="subdistrictSelect" class="form-select" required disabled>
                      <option value="">-- เลือกตำบล --</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">รหัสตำบล</label>
                    <input type="text" name="subdistrictCode" id="subdistrictCode" class="form-control" readonly>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">รหัสไปรษณีย์</label>
                    <input type="text" name="zipCode" id="zipCode" class="form-control" readonly>
                  </div>

                  <div class="col-12">
                    <label class="form-label">ปักหมุดบนแผนที่</label>
                    <div id="mapContainer" style="display: none;">
                      <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
                      <small class="text-muted">ลากหมุดเพื่อระบุตำแหน่งที่แน่นอนของแปลง</small>
                    </div>
                    <div id="mapLoading" class="alert alert-secondary text-center">
                      กรุณาเลือก จังหวัด -> อำเภอ -> ตำบล เพื่อแสดงแผนที่
                    </div>
                  </div>


                  <hr class="my-3">

                  <div class="col-md-6">
                    <label class="form-label">รหัสแปลง (ถ้ามี)</label>
                    <input type="text" name="landCode" class="form-control">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">รหัสโควต้า (ถ้ามี)</label>
                    <input type="text" name="quotaCode" class="form-control">
                  </div>

                  <div class="col-12 mt-4">
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                      <i class="bi bi-check-circle-fill"></i> บันทึกแปลงใหม่
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<script src="/assets/js/leaflet.js"></script>
<script>
  //
  // เก็บข้อมูล
  // subdistricts
  // ที่ดึงมา
  // เพื่อใช้ซ้ำ
  let subdistrictsCache = [];
  let map, marker;

  const provinceSelect = document.getElementById('provinceSelect');
  const districtSelect = document.getElementById('districtSelect');
  const subdistrictSelect = document.getElementById('subdistrictSelect');
  
  const subdistrictCodeInput = document.getElementById('subdistrictCode');
  const zipCodeInput = document.getElementById('zipCode');
  const latInput = document.getElementById('latitude');
  const lngInput = document.getElementById('longitude');

  const mapContainer = document.getElementById('mapContainer');
  const mapLoading = document.getElementById('mapLoading');

  // 1. เมื่อเลือกจังหวัด
  provinceSelect.addEventListener('change', async function() {
    const provinceCode = this.value;
    resetDistricts();
    resetSubdistricts();
    hideMap();
    if (!provinceCode) return;

    try {
      //
      // ใช้
      // API
      // ที่เราทำใน
      // AddressAPI.php
      // แต่เราจะเรียกผ่าน
      // URL
      // (ต้องสร้าง
      // route
      // ให้มัน)
      //
      // ***
      // เพื่อความง่าย
      // ผมจะสมมติว่าคุณสร้าง
      // API
      // endpoint
      // ที่
      // public/api/
      // ***
      //
      // คุณต้องสร้าง
      // 2
      // routes
      // นี้ใน
      // routes.php:
      //
      // Flight::route('/api/districts/by-province/@provinceCode', function($provinceCode){
      //   require_once(__DIR__ . '/services/AddressAPI.php');
      //   $res = AddressAPI::getDistrictsByProvince($provinceCode);
      //   if ($res['success']) Flight::json($res['data']);
      //   else Flight::halt($res['httpCode'], $res['message']);
      // });
      //
      // Flight::route('/api/subdistricts/by-district/@districtCode', function($districtCode){
      //   require_once(__DIR__ . '/services/AddressAPI.php');
      //   $res = AddressAPI::getSubdistrictsByDistrict($districtCode);
      //   if ($res['success']) Flight::json($res['data']);
      //   else Flight::halt($res['httpCode'], $res['message']);
      // });

      const response = await fetch(`/api/districts/by-province/${provinceCode}`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const districts = await response.json();

      districts.forEach(district => {
        const option = new Option(district.nameTh, district.code);
        districtSelect.add(option);
      });
      districtSelect.disabled = false;

    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลอำเภอ');
    }
  });

  // 2. เมื่อเลือกอำเภอ
  districtSelect.addEventListener('change', async function() {
    const districtCode = this.value;
    resetSubdistricts();
    hideMap();
    if (!districtCode) return;

    try {
      const response = await fetch(`/api/subdistricts/by-district/${districtCode}`);
      if (!response.ok) throw new Error('Failed to fetch subdistricts');
      
      subdistrictsCache = await response.json(); // [!!]
                                                  // เก็บใน
                                                  // cache

      subdistrictsCache.forEach(sub => {
        const option = new Option(sub.nameTh, sub.code);
        subdistrictSelect.add(option);
      });
      subdistrictSelect.disabled = false;

    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลตำบล');
    }
  });

  // 3. เมื่อเลือกตำบล
  subdistrictSelect.addEventListener('change', function() {
    const subdistrictCode = this.value;
    if (!subdistrictCode) {
      hideMap();
      return;
    }

    //
    // ค้นหาข้อมูลตำบลจาก
    // cache
    const selectedSub = subdistrictsCache.find(sub => sub.code === subdistrictCode);
    if (!selectedSub) return;

    //
    // อัปเดตฟอร์ม
    subdistrictCodeInput.value = selectedSub.code;
    zipCodeInput.value = selectedSub.zipCode;

    //
    // แสดงแผนที่
    showMap(selectedSub.latitude, selectedSub.longitude);
  });

  // --- ฟังก์ชันช่วยเหลือ ---
  function resetDistricts() {
    districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
    districtSelect.disabled = true;
  }
  function resetSubdistricts() {
    subdistrictSelect.innerHTML = '<option value="">-- เลือกตำบล --</option>';
    subdistrictSelect.disabled = true;
    subdistrictCodeInput.value = '';
    zipCodeInput.value = '';
  }

  function hideMap() {
    mapContainer.style.display = 'none';
    mapLoading.style.display = 'block';
    latInput.value = '';
    lngInput.value = '';
  }

  function showMap(lat, lng) {
    mapLoading.style.display = 'none';
    mapContainer.style.display = 'block';

    const centerLat = parseFloat(lat) || 13.7563;
    const centerLng = parseFloat(lng) || 100.5018;
    const location = [centerLat, centerLng];

    latInput.value = centerLat.toFixed(6);
    lngInput.value = centerLng.toFixed(6);

    if (typeof L === 'undefined') {
      mapLoading.innerHTML = 'ไม่สามารถโหลดแผนที่ได้';
      mapLoading.style.display = 'block';
      mapContainer.style.display = 'none';
      console.error('Leaflet is not loaded.');
      return;
    }

    const mapDiv = document.getElementById('map');
    if (!map) {
      map = L.map(mapDiv).setView(location, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
    } else {
      map.setView(location, 15);
    }

    if (!marker) {
      marker = L.marker(location, { draggable: true }).addTo(map);
      marker.on('dragend', function() {
        const newPos = marker.getLatLng();
        latInput.value = newPos.lat.toFixed(6);
        lngInput.value = newPos.lng.toFixed(6);
      });
    } else {
      marker.setLatLng(location);
    }

    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }


</script>

<?php include_once(COMPONENT_PATH . "lib_footer.php") ?>
