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
require_once __DIR__ . '/../../../services/FarmerAPI.php';
require_once __DIR__ . '/../../../services/AddressAPI.php'; // [!!]
                                                             // เพิ่ม

// 3. เตรียมข้อมูล
$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];
$error = null;
$success = null;
$showWelcome = ($_GET['welcome'] ?? '') === '1';

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
    'landCode'    => isset($_POST['landCode']) && trim($_POST['landCode']) !== '' ? trim($_POST['landCode']) : null,
    'quotaCode'   => isset($_POST['quotaCode']) && trim($_POST['quotaCode']) !== '' ? trim($_POST['quotaCode']) : null,
    'village'     => isset($_POST['village']) && trim($_POST['village']) !== '' ? trim($_POST['village']) : null,
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


include_once COMPONENT_PATH . 'lib_header.php';
?>

<link rel="stylesheet" href="/assets/css/leaflet.css">

  <section class="section">
    <div class="container">
      <div class="public-back-bar">
        <button type="button" class="public-back-button" onclick="history.back()">
          <i class="bi bi-arrow-left" aria-hidden="true"></i> ย้อนกลับ
        </button>
      </div>
      <div class="row">
        <div class="col-lg-8 offset-lg-2">

          <?php if ($error): ?>
            <div class="alert alert-danger">
              <?= htmlspecialchars($error) ?>
            </div>
          <?php endif; ?>

          <?php if ($showWelcome): ?>
            <div class="alert alert-success d-flex align-items-start gap-2 ag-slide-down">
              <i class="bi bi-stars flex-shrink-0 mt-1"></i>
              <div>
                <strong>ยินดีต้อนรับ!</strong>
                เพิ่มแปลงปลูกแรกของคุณเพื่อเริ่มจองคิววิเคราะห์ดิน
              </div>
            </div>
          <?php endif; ?>

          <div class="card shadow border-0 scroll-reveal stagger-1">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold"><i class="bi bi-pin-map-fill me-2"></i> กรอกรายละเอียดแปลง</h5>
            </div>
            <div class="card-body p-4">
              <form method="POST" id="landForm">

                <input type="hidden" name="latitude" id="latitude">
                <input type="hidden" name="longitude" id="longitude">

                <div class="row g-3">

                  <div class="col-md-12">
                    <label for="landName" class="form-label">ชื่อแปลง <span class="text-danger">*</span></label>
                    <input id="landName" type="text" name="name" class="form-control" required placeholder="เช่น แปลงข้างบ้าน">
                  </div>

                  <div class="col-md-6">
                    <label for="landAreaSize" class="form-label">ขนาดพื้นที่ (ไร่) <span class="text-danger">*</span></label>
                    <input id="landAreaSize" type="number" step="0.01" name="areaSize" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label for="landVillage" class="form-label">หมู่บ้าน</label>
                    <input id="landVillage" type="text" name="village" class="form-control">
                  </div>

                  <hr class="my-3">
                  <h6 class="text-primary fw-bold">เลือกที่ตั้งแปลง</h6>

                  <div class="col-md-4">
                    <label for="provinceSelect" class="form-label">จังหวัด <span class="text-danger">*</span></label>
                    <select id="provinceSelect" class="form-select" required>
                      <option value="" selected disabled>-- เลือกจังหวัด --</option>
                      <?php foreach ($provinces as $province): ?>
                        <option value="<?= $province['code'] ?>"><?= htmlspecialchars($province['nameTh']) ?></option>
                      <?php endforeach; ?>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label for="districtSelect" class="form-label">อำเภอ <span class="text-danger">*</span></label>
                    <select id="districtSelect" class="form-select" required disabled>
                      <option value="">-- เลือกอำเภอ --</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label for="subdistrictSelect" class="form-label">ตำบล <span class="text-danger">*</span></label>
                    <select id="subdistrictSelect" class="form-select" required disabled>
                      <option value="">-- เลือกตำบล --</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label for="subdistrictCode" class="form-label">รหัสตำบล</label>
                    <input type="text" name="subdistrictCode" id="subdistrictCode" class="form-control" readonly>
                  </div>
                  <div class="col-md-6">
                    <label for="zipCode" class="form-label">รหัสไปรษณีย์</label>
                    <input type="text" name="zipCode" id="zipCode" class="form-control" readonly>
                  </div>

                  <div class="col-12">
                    <p class="form-label mb-2">ปักหมุดบนแผนที่ (คลิกบนแผนที่เพื่อเลือกพิกัด)</p>
                    <div id="mapContainer" class="d-none">
                      <div id="map" class="public-form-map"></div>
                      <small class="text-muted">คลิกบนแผนที่เพื่อปักหมุด หากต้องการย้ายหมุด ระบบจะถามยืนยันก่อนเปลี่ยนตำแหน่ง</small>
                    </div>
                    <div id="mapLoading" class="alert alert-secondary text-center">
                      กรุณาเลือก จังหวัด -> อำเภอ -> ตำบล เพื่อแสดงแผนที่
                    </div>
                  </div>


                  <hr class="my-3">

                  <div class="col-md-6">
                    <label for="landCode" class="form-label">รหัสแปลง (ถ้ามี)</label>
                    <input id="landCode" type="text" name="landCode" class="form-control">
                  </div>
                  <div class="col-md-6">
                    <label for="quotaCode" class="form-label">รหัสโควต้า (ถ้ามี)</label>
                    <input id="quotaCode" type="text" name="quotaCode" class="form-control">
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

<div id="pinConfirmDialog" class="public-map-confirm" hidden role="dialog" aria-modal="true" aria-labelledby="pinConfirmTitle">
  <div class="public-map-confirm-card" role="document">
    <div class="public-map-confirm-icon">
      <i class="bi bi-pin-map-fill" aria-hidden="true"></i>
    </div>
    <h3 id="pinConfirmTitle" class="public-map-confirm-title">ยืนยันการเปลี่ยนตำแหน่งหมุด</h3>
    <p class="public-map-confirm-text">ตำแหน่งหมุดเดิมจะถูกแทนที่ด้วยจุดที่คุณคลิกบนแผนที่ ต้องการเปลี่ยนตำแหน่งใช่หรือไม่?</p>
    <div class="public-map-confirm-actions">
      <button type="button" class="public-map-confirm-btn public-map-confirm-cancel" data-pin-confirm="cancel">ยกเลิก</button>
      <button type="button" class="public-map-confirm-btn public-map-confirm-accept" data-pin-confirm="accept">เปลี่ยนตำแหน่ง</button>
    </div>
  </div>
</div>

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
  const pinConfirmDialog = document.getElementById('pinConfirmDialog');

  // 1. เมื่อเลือกจังหวัด
  provinceSelect.addEventListener('change', async function() {
    const provinceCode = this.value;
    resetDistricts();
    resetSubdistricts();
    hideMap();
    if (!provinceCode) return;

    try {
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
      mapLoading.className = 'alert alert-danger text-center';
      mapLoading.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูลอำเภอ กรุณาลองใหม่';
      mapLoading.style.display = 'block';
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
      mapLoading.className = 'alert alert-danger text-center';
      mapLoading.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูลตำบล กรุณาลองใหม่';
      mapLoading.style.display = 'block';
    }
  });

  // 3. เมื่อเลือกตำบล
  subdistrictSelect.addEventListener('change', function() {
    const subdistrictCode = this.value;
    if (!subdistrictCode) {
      hideMap();
      return;
    }

    const selectedSub = subdistrictsCache.find(sub => sub.code === subdistrictCode);
    if (!selectedSub) return;

    subdistrictCodeInput.value = selectedSub.code;
    zipCodeInput.value = selectedSub.zipCode;

    const lat = parseFloat(selectedSub.latitude);
    const lng = parseFloat(selectedSub.longitude);

    if (lat && lng) {
      showMap(lat, lng, true, 15);
    } else {
      const fallback = subdistrictsCache.find(sub => parseFloat(sub.latitude) && parseFloat(sub.longitude));
      if (fallback) {
        showMap(parseFloat(fallback.latitude), parseFloat(fallback.longitude), true, 12);
      } else {
        showMap(13.0, 101.5, true, 8);
      }
    }
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
    mapContainer.classList.add('d-none');
    mapContainer.style.display = '';
    mapLoading.style.display = 'block';
    if (marker) {
      marker.remove();
      marker = null;
    }
    latInput.value = '';
    lngInput.value = '';
  }

  function showMap(lat, lng, autoPin = true, zoom = 15) {
    mapLoading.style.display = 'none';
    mapContainer.classList.remove('d-none');
    mapContainer.style.display = 'block';

    const centerLat = lat || 13.0;
    const centerLng = lng || 101.5;
    const location = [centerLat, centerLng];

    if (typeof L === 'undefined') {
      mapLoading.innerHTML = 'ไม่สามารถโหลดแผนที่ได้';
      mapLoading.style.display = 'block';
      mapContainer.classList.add('d-none');
      mapContainer.style.display = '';
      console.error('Leaflet is not loaded.');
      return;
    }

    const mapDiv = document.getElementById('map');
    if (!map) {
      map = L.map(mapDiv).setView(location, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      map.on('click', async function(event) {
        await setPinnedLocation(event.latlng.lat, event.latlng.lng, true);
      });
    } else {
      map.setView(location, zoom);
    }

    if (marker) {
      marker.remove();
      marker = null;
    }
    latInput.value = '';
    lngInput.value = '';

    if (autoPin) {
      setPinnedLocation(centerLat, centerLng, false);
    }

    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }

  async function setPinnedLocation(lat, lng, requireConfirm) {
    if (requireConfirm && marker) {
      const ok = await confirmPinChange();
      if (!ok) return;
    }

    const location = [lat, lng];
    if (!marker) {
      marker = L.marker(location, { draggable: false }).addTo(map);
    } else {
      marker.setLatLng(location);
    }

    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
  }

  function confirmPinChange() {
    if (!pinConfirmDialog) {
      return Promise.resolve(false);
    }

    return new Promise(resolve => {
      const acceptButton = pinConfirmDialog.querySelector('[data-pin-confirm="accept"]');
      const cancelButton = pinConfirmDialog.querySelector('[data-pin-confirm="cancel"]');
      if (!acceptButton || !cancelButton) {
        resolve(false);
        return;
      }

      const close = result => {
        pinConfirmDialog.classList.remove('is-open');
        setTimeout(() => {
          pinConfirmDialog.hidden = true;
        }, 180);
        acceptButton.removeEventListener('click', onAccept);
        cancelButton.removeEventListener('click', onCancel);
        pinConfirmDialog.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeydown);
        resolve(result);
      };

      const onAccept = () => close(true);
      const onCancel = () => close(false);
      const onBackdrop = event => {
        if (event.target === pinConfirmDialog) close(false);
      };
      const onKeydown = event => {
        if (event.key === 'Escape') close(false);
      };

      acceptButton.addEventListener('click', onAccept);
      cancelButton.addEventListener('click', onCancel);
      pinConfirmDialog.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKeydown);

      pinConfirmDialog.hidden = false;
      requestAnimationFrame(() => {
        pinConfirmDialog.classList.add('is-open');
        acceptButton.focus();
      });
    });
  }


</script>

<?php include_once COMPONENT_PATH . "lib_footer.php" ?>
