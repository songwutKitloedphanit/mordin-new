<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(SERVICES_PATH . 'service-area/factoryAPI.php');
require_once(SERVICES_PATH . 'service-area/serviceAreaAPI.php');
require_once(SERVICES_PATH . 'serviceTypeAPI.php');
require_once(SERVICES_PATH . 'qr-code/QRCodeAPI.php');
require_once(TYPES_PATH . 'sample.php');

// รับ $qrCode, $isValidCode, และ $code จาก route
$code = isset($code) ? $code : ($_GET['code'] ?? null); // เพิ่มการกำหนด $code
$isValidCode = isset($isValidCode) ? $isValidCode : false;
$qrCode = isset($qrCode) ? $qrCode : [];

if (empty($code)) {
?>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        confirmButtonText: 'ตกลง'
      });
    });
  </script>
  <?php
  die();
}

$factories = FactoryAPI::getAllFactories();
$serviceTypes = ServiceTypeAPI::getAllServiceTypes();

// echo "<pre>";
// print_r($qrCode);
// echo "</pre>";

$collectExamForm = [
  'firstName' => $qrCode['firstName'] ?? '',
  'lastName' => $qrCode['lastName'] ?? '',
  'landCode' => $qrCode['landCode'] ?? '',
  'landName' => $qrCode['landName'] ?? '',
  // [FIXED] ใส่ ?? '' ป้องกัน Error กรณี book ยังไม่มี หรือ latitude เป็น null
  'latitude' => $qrCode['book']['latitude'] ?? '',
  'longitude' => $qrCode['book']['longitude'] ?? '',
  'phoneNumber' => $qrCode['phoneNumber'] ?? '',
  'thaiNationalId' => $qrCode['thaiNationalId'] ?? '',
  'serviceAreaId' => isset($qrCode['book']['serviceAreaId']) ? (int)$qrCode['book']['serviceAreaId'] : null,
  'serviceTypeId' => $qrCode['book']['serviceTypeId'] ?? null,
];

$selectedFactory = isset($qrCode['book']['serviceArea']['factoryId'])
  ? (int)$qrCode['book']['serviceArea']['factoryId']
  : ($factories[0]['factoryId'] ?? null); // เผื่อว่า $factories เป็น array ว่าง

// ดึงข้อมูลโรงงานพร้อม serviceAreas จาก API getFactoryById
if ($selectedFactory) {
  $factoryData = FactoryAPI::getFactoryById($selectedFactory);
  $serviceAreas = $factoryData['serviceAreas'] ?? [];
} else {
  $serviceAreas = [];
}


$serviceAreasByFactory = [];
foreach ($factories as $factory) {
  $factoryData = FactoryAPI::getFactoryById($factory['factoryId']);
  $serviceAreasByFactory[$factory['factoryId']] = $factoryData['serviceAreas'] ?? [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if ($qrCode['status'] !== SampleStatusEnum::DISTRIBUTED) {
  ?>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        Swal.fire({
          icon: 'warning',
          title: 'ตัวอย่างถูกส่งออกแล้ว',
          text: 'ไม่สามารถแก้ไขข้อมูลได้',
          confirmButtonText: 'ตกลง'
        });
      });
    </script>
    <?php
  } else {
    $formData = [
      'firstName' => $_POST['firstName'] ?? '',
      'lastName' => $_POST['lastName'] ?? '',
      'phoneNumber' => $_POST['phoneNumber'] ?? '',
      'thaiNationalId' => $_POST['thaiNationalId'] ?? '',
      'landCode' => $_POST['landCode'] ?? '',
      'landName' => $_POST['landName'] ?? '',
      'factoryId' => (int)($_POST['factoryId'] ?? 0),
      'serviceAreaId' => (int)($_POST['serviceAreaId'] ?? 0),
      'serviceTypeId' => (int)($_POST['serviceTypeId'] ?? 0),
      'latitude' => $_POST['latitude'],
      'longitude' => $_POST['longitude'],
    ];



    $result = QRCodeAPI::updateDataByFarmer($code, $formData);

    if (isset($result['error'])) {
    ?>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณาติดต่อเจ้าหน้าที่',
            confirmButtonText: 'ตกลง'
          });
        });
      </script>
    <?php
    } else {
    ?>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          Swal.fire({
            icon: 'success',
            title: 'เพิ่มข้อมูลตัวอย่างดินสำเร็จ',
            text: 'คุณได้เพิ่มข้อมูลตัวอย่างดินเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            <?php
            // อัปเดต $qrCode เพื่อให้แสดงข้อมูลล่าสุดหลังบันทึก
            $qrCode = QRCodeAPI::getQrCodeByEncryptCode($code);
            $collectExamForm = [
              'firstName' => $qrCode['firstName'] ?? '',
              'lastName' => $qrCode['lastName'] ?? '',
              'landCode' => $qrCode['landCode'] ?? '',
              'landName' => $qrCode['landName'] ?? '',
              // [FIXED] ใส่ ?? '' ป้องกัน Error ตรงนี้ด้วย
              'latitude' => $qrCode['book']['latitude'] ?? '',
              'longitude' => $qrCode['book']['longitude'] ?? '',
              'phoneNumber' => $qrCode['phoneNumber'] ?? '',
              'thaiNationalId' => $qrCode['thaiNationalId'] ?? '',
              'serviceAreaId' => isset($qrCode['book']['serviceAreaId']) ? (int)$qrCode['book']['serviceAreaId'] : null,
              'serviceTypeId' => $qrCode['book']['serviceTypeId'] ?? null,
            ];

            $selectedFactory = isset($qrCode['book']['serviceArea']['factoryId'])
              ? (int)$qrCode['book']['serviceArea']['factoryId']
              : ($factories[0]['factoryId'] ?? null);
            if ($selectedFactory) {
              $factoryData = FactoryAPI::getFactoryById($selectedFactory);
              $serviceAreas = $factoryData['serviceAreas'] ?? [];
            } else {
              $serviceAreas = [];
            }

            // อัปเดต $serviceAreasByFactory ใหม่
            $serviceAreasByFactory = [];
            foreach ($factories as $factory) {
              $factoryData = FactoryAPI::getFactoryById($factory['factoryId']);
              $serviceAreasByFactory[$factory['factoryId']] = $factoryData['serviceAreas'] ?? [];
            }
            ?>
            document.querySelector('input[name="firstName"]').value = '<?= htmlspecialchars($collectExamForm['firstName']) ?>';
            document.querySelector('input[name="lastName"]').value = '<?= htmlspecialchars($collectExamForm['lastName']) ?>';
            document.querySelector('input[name="phoneNumber"]').value = '<?= htmlspecialchars($collectExamForm['phoneNumber']) ?>';
            document.querySelector('input[name="thaiNationalId"]').value = '<?= htmlspecialchars($collectExamForm['thaiNationalId']) ?>';
            document.querySelector('input[name="landCode"]').value = '<?= htmlspecialchars($collectExamForm['landCode']) ?>';
            document.querySelector('input[name="landName"]').value = '<?= htmlspecialchars($collectExamForm['landName']) ?>';
            document.querySelector('select[name="factoryId"]').value = '<?= $selectedFactory ?>';
            updateServiceAreas();
            document.querySelector('select[name="serviceTypeId"]').value = '<?= $collectExamForm['serviceTypeId'] ?? '' ?>';
            
            // [ADDED] อัปเดตค่า Lat/Lng ใน Input Hidden หลังบันทึกสำเร็จ
            document.getElementById('latitude').value = '<?= $collectExamForm['latitude'] ?>';
            document.getElementById('longitude').value = '<?= $collectExamForm['longitude'] ?>';
          })
        });
      </script>
<?php
    }
  } 
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>MITR PHOL-SOIL</title>
  <meta name="description" content="">
  <meta name="keywords" content="">

  <base href="/">

  <link href="assets/img/mitr.jpg" rel="icon">
  <link href="assets/img/mitr.jpg" rel="apple-touch-icon">
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">


  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="assets/vendor/aos/aos.css" rel="stylesheet">
  <link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet">

  <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">
  <link href="assets/vendor/fontawesome/css/all.min.css" rel="stylesheet">
  <link href="assets/vendor/fontawesome/js/all.min.js" rel="stylesheet">

  <link href="assets/css/main.css" rel="stylesheet">
  <link href="assets/css/leaflet.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/Control.Geocoder.css" />
  

  <style>
    .invalid-feedback {
      display: none;
      color: #dc3545;
      font-size: 0.875em;
      margin-top: 0.25rem;
    }

    .is-invalid~.invalid-feedback {
      display: block;
    }
    #map {
      height: 400px;
      width: 100%;
    }
  </style>

</head>

<body style="background-color: #eee">

  <main class="main">
    <div class="contact-page">
    <?php if(!$isValidCode) { ?>
      
    <div class="alert alert-danger text-center shadow">
      <h4>QR Code ไม่ถูกต้อง</h4>
      <p>กรุณาติดต่อเจ้าหน้าที่เพื่อขอความช่วยเหลือ</p>
    </div>
    <?php } else { ?>
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-md-12 col-lg-12"> <div class="card shadow-sm">
              <div class="card-header bg-primary text-white text-center">
                <h4 class="mb-0 text-white">แบบฟอร์มเก็บตัวอย่างดิน</h4>
              </div>
              <div class="card-body">
                <form method="post" onsubmit="return validateForm(event)">
                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>ชื่อ</label>
                      <input type="text" name="firstName" class="form-control <?= isset($errors['firstName']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['firstName']) ?>"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                      <?php if (isset($errors['firstName'])): ?>
                        <div class="invalid-feedback"><?= $errors['firstName'] ?></div>
                      <?php endif; ?>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>นามสกุล</label>
                      <input type="text" name="lastName" class="form-control <?= isset($errors['lastName']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['lastName']) ?>"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                      <?php if (isset($errors['lastName'])): ?>
                        <div class="invalid-feedback"><?= $errors['lastName'] ?></div>
                      <?php endif; ?>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>หมายเลขโทรศัพท์</label>
                      <input type="text" placeholder="090xxxxxxx" name="phoneNumber" class="form-control <?= isset($errors['phoneNumber']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['phoneNumber']) ?>"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                      <?php if (isset($errors['phoneNumber'])): ?>
                        <div class="invalid-feedback"><?= $errors['phoneNumber'] ?></div>
                      <?php endif; ?>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>รหัสบัตรประชาชน</label>
                      <input type="text" placeholder="173xxxxxxxxxx" name="thaiNationalId" class="form-control <?= isset($errors['thaiNationalId']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['thaiNationalId']) ?>"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                      <?php if (isset($errors['thaiNationalId'])): ?>
                        <div class="invalid-feedback"><?= $errors['thaiNationalId'] ?></div>
                      <?php endif; ?>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>โรงงาน</label>
                      <select name="factoryId" id="factoryId" class="form-select"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                        <?php foreach ($factories as $factory): ?>
                          <option value="<?= $factory['factoryId'] ?>"
                            <?= ($factory['factoryId'] == $selectedFactory) ? 'selected' : '' ?>
                            <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                            <?= $factory['name'] ?> (<?= $factory['initial'] ?>)
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>เขตส่งเสริม</label>
                      <select name="serviceAreaId" id="serviceAreaId" class="form-select"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                        <?php foreach ($serviceAreas as $area): ?>
                          <option value="<?= $area['serviceAreaId'] ?>"
                            <?= ($area['serviceAreaId'] == $collectExamForm['serviceAreaId']) ? 'selected' : '' ?>>
                            เขต <?= $area['code'] ?> <?= $area['name'] ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted">หมายเลขแปลง</label>
                      <input type="text" name="landCode" class="form-control"
                        value="<?= $collectExamForm['landCode'] ?>"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                    </div>
                    <div class="col-md-6">
                      <label class="mb-2 text-muted">ชื่อแปลง</label>
                      <input type="text" name="landName" class="form-control"
                        value="<?= $collectExamForm['landName'] ?>"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="mb-2 text-muted"><span class="text-danger">* </span>ประเภทการให้บริการ</label>
                      <select name="serviceTypeId" class="form-select"
                        <?= $qrCode['status'] != SampleStatusEnum::DISTRIBUTED ? 'disabled' : '' ?>>
                        <?php foreach ($serviceTypes as $serviceType): ?>
                          <option value="<?= $serviceType['serviceTypeId'] ?>"
                            <?= ($serviceType['serviceTypeId'] == $collectExamForm['serviceTypeId']) ? 'selected' : '' ?>>
                            <?= $serviceType['name'] ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                  </div>

                  <input type="hidden" name="latitude" id="latitude" value="<?= isset($collectExamForm['latitude']) ? $collectExamForm['latitude'] : '' ?>">
                  <input type="hidden" name="longitude" id="longitude" value="<?= isset($collectExamForm['longitude']) ? $collectExamForm['longitude'] : '' ?>">

                <div class="d-flex justify-content-between align-items-center mb-3">
                  <label class="mb-0">พิกัด</label>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="toggleEditBtn">
                    <label class="form-check-label" for="toggleEditBtn">แก้ไขพิกัด</label>
                  </div>
                </div>
                                      
                  <div id="map"></div>
                 

                  <?php if ($qrCode['status'] == SampleStatusEnum::DISTRIBUTED) { ?>
                    <div class="text-end">
                      <button type="submit" class="btn btn-primary">บันทึกข้อมูล</button>
                    </div>
                  <?php } ?>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    <?php } ?>
    </div>
  </main>

  <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="assets/vendor/php-email-form/validate.js"></script>
  <script src="assets/vendor/aos/aos.js"></script>
  <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
  <script src="assets/vendor/purecounter/purecounter_vanilla.js"></script>
  <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>

  <script src="assets/js/main.js" defer></script>

  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script src="assets/js/leaflet.js"></script>
<script src="assets/js/Control.Geocoder.js"></script>
<script>
  if (typeof L !== 'undefined') {
    console.log('Leaflet loaded successfully');

    document.addEventListener('DOMContentLoaded', function() {
      // สร้างแผนที่
      const map = L.map('map');

      // Layer แผนที่
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      });
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      });

      osmLayer.addTo(map);

      const baseMaps = {
        "แผนที่ปกติ": osmLayer,
        "ดาวเทียม": satelliteLayer
      };
      L.control.layers(baseMaps).addTo(map);

      const markerIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      // --- จัดการตำแหน่งเริ่มต้น ---
      const savedLatStr = "<?= $collectExamForm['latitude'] ?? '' ?>";
      const savedLngStr = "<?= $collectExamForm['longitude'] ?? '' ?>";
      
      let viewLat = 13.7563; 
      let viewLng = 100.5018;
      let hasSavedLocation = false;

      if (savedLatStr !== '' && savedLngStr !== '') {
        const lat = parseFloat(savedLatStr);
        const lng = parseFloat(savedLngStr);
        if (!isNaN(lat) && !isNaN(lng)) {
          viewLat = lat;
          viewLng = lng;
          hasSavedLocation = true;
        }
      }

      const marker = L.marker([viewLat, viewLng], {
        icon: markerIcon,
        draggable: false, 
        autoPan: true
      }).addTo(map);

      map.setView([viewLat, viewLng], hasSavedLocation ? 15 : 6); // ถ้าไม่มีค่า Zoom ไกลๆ ก่อน

      function updateLatLngInputs(lat, lng) {
        document.getElementById('latitude').value = lat.toFixed(6);
        document.getElementById('longitude').value = lng.toFixed(6);
      }

      if (hasSavedLocation) {
         updateLatLngInputs(viewLat, viewLng);
      } else {
         document.getElementById('latitude').value = '';
         document.getElementById('longitude').value = '';
      }

      if (L.Control.Geocoder) {
          L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'ค้นหา ตำบล, อำเภอ...',
            errorMessage: 'ไม่พบข้อมูล',
            geocoder: L.Control.Geocoder.arcgis()
          })
          .on('markgeocode', function(e) {
            const bbox = e.geocode.bbox;
            const center = e.geocode.center;
            marker.setLatLng(center);
            updateLatLngInputs(center.lat, center.lng); // ค้นหาเจอถือว่าได้พิกัด ใส่ค่าได้

            if (bbox) {
              map.fitBounds(bbox);
            } else {
              map.setView(center, 15);
            }
            
            enableEditMode(); 
          })
          .addTo(map);
      }

      if (!hasSavedLocation) {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Success: หาเจอ
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              map.setView([lat, lng], 16);
              marker.setLatLng([lat, lng]);
              updateLatLngInputs(lat, lng); // เจอ GPS แล้วใส่ค่าลง Input

              // Swal.fire({
              //     icon: 'success',
              //     title: 'ระบุตำแหน่งสำเร็จ',
              //     text: 'ระบบดึงพิกัดปัจจุบันของคุณเรียบร้อยแล้ว',
              //     timer: 2000,
              //     showConfirmButton: false
              // });
            },
            (error) => {
              // *** จุดสำคัญ 2: Error แจ้งเตือนเมื่อไม่เจอพิกัด ***
              console.error('Geolocation error:', error);
              let errorMsg = 'กรุณาเปิด GPS หรือปักหมุดเองบนแผนที่';
              if (error.code === error.PERMISSION_DENIED) {
                  errorMsg = 'คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาเปิดสิทธิ์หรือเลือกจุดเอง';
              }
              
              Swal.fire({
                icon: 'warning',
                title: 'ไม่สามารถระบุตำแหน่งได้',
                text: errorMsg,
                confirmButtonText: 'ตกลง'
              });
              
              // ไม่มีการเรียก updateLatLngInputs ค่าจึงยังเป็นค่าว่าง
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
           Swal.fire({
                icon: 'error',
                title: 'Browser ไม่รองรับ',
                text: 'Browser ของคุณไม่รองรับการระบุตำแหน่ง',
                confirmButtonText: 'ตกลง'
           });
        }
      }

      // --- Event Handlers ---
      const toggleSwitch = document.getElementById('toggleEditBtn');
      let isEditMode = false;

      function enableEditMode() {
         if(toggleSwitch && !toggleSwitch.checked) {
             toggleSwitch.checked = true;
             toggleSwitch.dispatchEvent(new Event('change'));
         }
      }

      toggleSwitch.addEventListener('change', function() {
        isEditMode = this.checked; 
        
        if (isEditMode) {
          marker.dragging.enable();
          map.on('click', moveMarkerToClickedPosition);
          marker.bindTooltip("เลื่อนแผนที่หรือคลิกเพื่อเปลี่ยนตำแหน่ง", {
            permanent: false, 
            direction: 'top'
          });
        } else {
          marker.dragging.disable();
          map.off('click', moveMarkerToClickedPosition);
          marker.unbindTooltip();
        }
      });

      function moveMarkerToClickedPosition(e) {
        marker.setLatLng(e.latlng);
        updateLatLngInputs(e.latlng.lat, e.latlng.lng); // คลิกเอง ใส่ค่าได้
      }

      marker.on('dragend', function() {
        const newPos = marker.getLatLng();
        updateLatLngInputs(newPos.lat, newPos.lng); // ลากเอง ใส่ค่าได้
      });

      map.on('move', function() {
        if (isEditMode) {
          const center = map.getCenter();
          marker.setLatLng(center);
          updateLatLngInputs(center.lat, center.lng); // เลื่อนแผนที่ ใส่ค่าได้
        }
      });

      console.log('Map initialized');
    });
  } else {
    console.error('Leaflet not loaded');
  }
</script>


  <script>
    const serviceAreasByFactory = <?php echo json_encode($serviceAreasByFactory); ?>;

    function updateServiceAreas() {
      const factoryIdElement = document.getElementById('factoryId');
      if (!factoryIdElement) {
        console.error("factoryId element not found");
        return;
      }

      const factoryId = factoryIdElement.value;
      const serviceAreaSelect = document.getElementById('serviceAreaId');
      if (!serviceAreaSelect) {
        console.error("serviceAreaId element not found");
        return;
      }
      if (!serviceAreaSelect) {
        console.error("serviceAreaId element not found");
        return;
      }
      serviceAreaSelect.innerHTML = '';

      if (serviceAreasByFactory[factoryId] && serviceAreasByFactory[factoryId].length > 0) {
        serviceAreasByFactory[factoryId].forEach(area => {
          const option = document.createElement('option');
          option.value = area.serviceAreaId;
          option.text = `เขต ${area.code} ${area.name}`;
          if (area.serviceAreaId == <?= $collectExamForm['serviceAreaId'] ?? 'null' ?>) {
            option.selected = true;
          }
          serviceAreaSelect.appendChild(option);
        });
      } else {
        console.error(`No service areas found for factory with ID ${factoryId}`);
      }
    }

    function clearError(input) {
    // ลบ class is-invalid
    input.classList.remove('is-invalid');
    // ลบข้อความ invalid-feedback ถ้ามี
    const feedback = input.nextElementSibling;
    if (feedback && feedback.className.includes('invalid-feedback')) {
      feedback.remove();
    }
  }

    function formatIDCard(value) {
      if (!value) return value;
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 13);
      let formatted = limited;
      if (limited.length > 1) formatted = limited.slice(0, 1) + '-' + limited.slice(1);
      if (limited.length > 5) formatted = formatted.slice(0, 6) + '-' + formatted.slice(6);
      if (limited.length > 10) formatted = formatted.slice(0, 12) + '-' + formatted.slice(12);
      if (limited.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
      return formatted;
    }

    function formatPhoneNumber(value) {
      if (!value) return value;
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 10);
      let formatted = limited;
      if (limited.length > 3) formatted = limited.slice(0, 3) + '-' + limited.slice(3);
      if (limited.length > 6) formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
      return formatted;
    }

    function validateForm(event) {
      event.preventDefault();

      const form = event.target;
      
      // Clean data before validation
      const pInput = form.querySelector('[name="phoneNumber"]');
      if(pInput) pInput.value = pInput.value.replace(/-/g, '');
      const tInput = form.querySelector('[name="thaiNationalId"]');
      if(tInput) tInput.value = tInput.value.replace(/-/g, '');

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const errors = {};

      const latVal = document.getElementById('latitude').value;
      const lngVal = document.getElementById('longitude').value;

      if (!latVal || !lngVal || latVal.trim() === '' || lngVal.trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูลพิกัด',
            text: 'กรุณาระบุตำแหน่งบนแผนที่ก่อนบันทึกข้อมูล (เปิด GPS หรือคลิกแก้ไขพิกัด)',
            confirmButtonText: 'ตกลง'
          });
          return false;
      }

      const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'thaiNationalId', 'serviceAreaId', 'serviceTypeId', 'factoryId'];
      const fieldLabels = {
        firstName: 'ชื่อ',
        lastName: 'นามสกุล',
        phoneNumber: 'หมายเลขโทรศัพท์',
        thaiNationalId: 'รหัสบัตรประชาชน',
        serviceAreaId: 'เขตส่งเสริม',
        serviceTypeId: 'ประเภทการให้บริการ',
        factoryId: 'โรงงาน',
      };

      // ตรวจสอบฟิลด์ที่จำเป็น
      requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
          errors[field] = `กรุณากรอก${fieldLabels[field]}`;
        }
      });

      // ตรวจสอบรูปแบบหมายเลขโทรศัพท์
      if (data.phoneNumber && !/^[0-9]{10}$/.test(data.phoneNumber.replace(/-/g, ''))) {
        errors.phoneNumber = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
      }

      // ตรวจสอบรูปแบบรหัสบัตรประชาชน
      if (data.thaiNationalId && !/^[0-9]{13}$/.test(data.thaiNationalId.replace(/-/g, ''))) {
        errors.thaiNationalId = 'รหัสบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
      }

      // ลบ class is-invalid เดิม
      document.querySelectorAll('.is-invalid').forEach(input => {
        input.classList.remove('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.className.includes('invalid-feedback')) {
          feedback.remove();
        }
      });

      // เพิ่ม class is-invalid และข้อความข้อผิดพลาด
      for (let field in errors) {
        const input = form.querySelector(`[name="${field}"]`);
        if (input) {
          input.classList.add('is-invalid');
          const feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = errors[field];
          input.parentNode.appendChild(feedback);
        }
      }

      if (Object.keys(errors).length > 0) {
        return false;
      }

      // ถ้าผ่านการตรวจสอบ ให้ส่งฟอร์ม
      form.submit();
      return true;
    }


    // เพิ่ม event listener ให้ input และ select เพื่อล้าง error เมื่อมีการแก้ไข
    const inputs = document.querySelectorAll('input[name], select[name]');
    inputs.forEach(input => {
      input.addEventListener('input', () => clearError(input)); // สำหรับ input text
      input.addEventListener('change', () => clearError(input)); // สำหรับ select และ input อื่นๆ
    });

    // Auto-format listeners
    const phoneInput = document.querySelector('input[name="phoneNumber"]');
    if (phoneInput) {
        // Format on load if value exists
        phoneInput.value = formatPhoneNumber(phoneInput.value);
        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }
    const idInput = document.querySelector('input[name="thaiNationalId"]');
    if (idInput) {
        // Format on load if value exists
        idInput.value = formatIDCard(idInput.value);
        idInput.addEventListener('input', function(e) {
            e.target.value = formatIDCard(e.target.value);
        });
    }

    const factoryIdElement = document.getElementById('factoryId');
    if (factoryIdElement) {
      factoryIdElement.addEventListener('change', updateServiceAreas);
    }
  </script>

</body>

</html>