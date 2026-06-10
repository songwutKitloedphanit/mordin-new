<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once SERVICES_PATH . 'service-area/factoryAPI.php';
require_once SERVICES_PATH . 'service-area/serviceAreaAPI.php';
require_once SERVICES_PATH . 'serviceTypeAPI.php';
require_once SERVICES_PATH . 'qr-code/QRCodeAPI.php';
require_once TYPES_PATH . 'sample.php';

// รับ $qrCode, $isValidCode, และ $code จาก route
$code = isset($code) ? $code : ($_GET['code'] ?? null); // เพิ่มการกำหนด $code
$isValidCode = isset($isValidCode) ? $isValidCode : false;
$qrCode = isset($qrCode) ? $qrCode : [];
$errors = [];

function renderCollectSampleAlert($icon, $title, $text)
{
?>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      Swal.fire({
        icon: <?= json_encode($icon, JSON_UNESCAPED_UNICODE) ?>,
        title: <?= json_encode($title, JSON_UNESCAPED_UNICODE) ?>,
        text: <?= json_encode($text, JSON_UNESCAPED_UNICODE) ?>,
        confirmButtonText: 'ตกลง'
      });
    });
  </script>
  <?php
}

if (empty($code)) {
  renderCollectSampleAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
  die();
}

function buildCollectExamForm($qrCode)
{
  return [
    'firstName' => $qrCode['firstName'] ?? '',
    'lastName' => $qrCode['lastName'] ?? '',
    'landCode' => $qrCode['landCode'] ?? '',
    'landName' => $qrCode['landName'] ?? '',
    'latitude' => $qrCode['book']['latitude'] ?? '',
    'longitude' => $qrCode['book']['longitude'] ?? '',
    'phoneNumber' => $qrCode['phoneNumber'] ?? '',
    'thaiNationalId' => $qrCode['thaiNationalId'] ?? '',
    'serviceAreaId' => isset($qrCode['book']['serviceAreaId']) ? (int)$qrCode['book']['serviceAreaId'] : null,
    'serviceTypeId' => $qrCode['book']['serviceTypeId'] ?? null,
  ];
}

function selectFactoryId($qrCode, $factories)
{
  return isset($qrCode['book']['serviceArea']['factoryId'])
    ? (int)$qrCode['book']['serviceArea']['factoryId']
    : ($factories[0]['factoryId'] ?? null);
}

function getServiceAreasForFactory($factoryId)
{
  if (!$factoryId) {
    return [];
  }

  $factoryData = FactoryAPI::getFactoryById($factoryId);
  return $factoryData['serviceAreas'] ?? [];
}

function buildServiceAreasByFactory($factories)
{
  $serviceAreasByFactory = [];

  foreach ($factories as $factory) {
    $factoryData = FactoryAPI::getFactoryById($factory['factoryId']);
    $serviceAreasByFactory[$factory['factoryId']] = $factoryData['serviceAreas'] ?? [];
  }

  return $serviceAreasByFactory;
}

require_once SERVICES_PATH . 'AddressAPI.php';

$factories        = FactoryAPI::getAllFactories();
$serviceTypes     = ServiceTypeAPI::getAllServiceTypes();
$provinces        = AddressAPI::getProvinces();
$provinces        = ($provinces['success'] ?? false) ? ($provinces['data'] ?? []) : [];

$collectExamForm  = buildCollectExamForm($qrCode);
$selectedFactory  = selectFactoryId($qrCode, $factories);
$serviceAreas     = getServiceAreasForFactory($selectedFactory);
$serviceAreasByFactory = buildServiceAreasByFactory($factories);

// --- mode detection ---
$collectMode = $_GET['mode'] ?? 'choice'; // choice | first_time | returning
if (!in_array($collectMode, ['choice', 'first_time', 'returning'])) {
  $collectMode = 'choice';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (($qrCode['status'] ?? null) !== SampleStatusEnum::DISTRIBUTED) {
    renderCollectSampleAlert('warning', 'ตัวอย่างถูกส่งออกแล้ว', 'ไม่สามารถแก้ไขข้อมูลได้');
  } else {
    $latitude      = trim($_POST['latitude'] ?? '');
    $longitude     = trim($_POST['longitude'] ?? '');
    $phoneNumber   = preg_replace('/\D+/', '', $_POST['phoneNumber'] ?? '');
    $thaiNationalId = preg_replace('/\D+/', '', $_POST['thaiNationalId'] ?? '');
    $factoryId     = filter_var($_POST['factoryId'] ?? null, FILTER_VALIDATE_INT);
    $serviceAreaId = filter_var($_POST['serviceAreaId'] ?? null, FILTER_VALIDATE_INT);
    $serviceTypeId = filter_var($_POST['serviceTypeId'] ?? null, FILTER_VALIDATE_INT);

    if (trim($_POST['firstName'] ?? '') === '') $errors['firstName'] = 'กรุณากรอกชื่อ';
    if (trim($_POST['lastName'] ?? '') === '')  $errors['lastName']  = 'กรุณากรอกนามสกุล';
    if (!preg_match('/^[0-9]{10}$/', $phoneNumber))  $errors['phoneNumber']    = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    if (!preg_match('/^[0-9]{13}$/', $thaiNationalId)) $errors['thaiNationalId'] = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    if (!$factoryId || $factoryId <= 0)     $errors['factoryId']     = 'กรุณาเลือกโรงงาน';
    if (!$serviceAreaId || $serviceAreaId <= 0) $errors['serviceAreaId'] = 'กรุณาเลือกเขตส่งเสริม';
    if (!$serviceTypeId || $serviceTypeId <= 0) $errors['serviceTypeId'] = 'กรุณาเลือกประเภทบริการ';
    if (!is_numeric($latitude)  || (float)$latitude  < -90  || (float)$latitude  > 90)  $errors['latitude']  = 'พิกัดละติจูดไม่ถูกต้อง';
    if (!is_numeric($longitude) || (float)$longitude < -180 || (float)$longitude > 180) $errors['longitude'] = 'พิกัดลองจิจูดไม่ถูกต้อง';

    $formData = [
      'firstName'     => trim($_POST['firstName'] ?? ''),
      'lastName'      => trim($_POST['lastName'] ?? ''),
      'phoneNumber'   => $phoneNumber,
      'thaiNationalId' => $thaiNationalId,
      'landCode'      => trim($_POST['landCode'] ?? ''),
      'landName'      => trim($_POST['landName'] ?? ''),
      'factoryId'     => (int)$factoryId,
      'serviceAreaId' => (int)$serviceAreaId,
      'serviceTypeId' => (int)$serviceTypeId,
      'latitude'      => $latitude,
      'longitude'     => $longitude,
    ];

    if (!empty($errors)) {
      renderCollectSampleAlert('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณาตรวจสอบข้อมูลที่จำเป็นและพิกัดบนแผนที่');
    } else {
      $result = QRCodeAPI::updateDataByFarmer($code, $formData);

      if (isset($result['error'])) {
        renderCollectSampleAlert('error', 'เกิดข้อผิดพลาด', 'กรุณาติดต่อเจ้าหน้าที่');
      } else {
        $qrCode = QRCodeAPI::getQrCodeByEncryptCode($code);
        $collectExamForm  = buildCollectExamForm($qrCode);
        $selectedFactory  = selectFactoryId($qrCode, $factories);
        $serviceAreas     = getServiceAreasForFactory($selectedFactory);
        $serviceAreasByFactory = buildServiceAreasByFactory($factories);
        ?>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            Swal.fire({
              icon: 'success',
              title: 'เพิ่มข้อมูลตัวอย่างดินสำเร็จ',
              text: 'คุณได้เพิ่มข้อมูลตัวอย่างดินเรียบร้อยแล้ว',
              confirmButtonText: 'ตกลง'
            });
          });
        </script>
        <?php
      }
    }
  }
}

$mainCssPath = __DIR__ . '/../../assets/css/main.css';
$mainCssVersion = file_exists($mainCssPath) ? filemtime($mainCssPath) : time();
$isFormLocked = ($qrCode['status'] ?? null) != SampleStatusEnum::DISTRIBUTED;
$formStatusLabel = $isFormLocked ? 'บันทึกข้อมูลแล้ว' : 'รอกรอกข้อมูล';
$formStatusClass = $isFormLocked ? 'bg-success' : 'bg-primary';

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
  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="assets/vendor/aos/aos.css" rel="stylesheet">
  <link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet">

  <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">
  <link href="assets/vendor/fontawesome/css/all.min.css" rel="stylesheet">

  <link href="assets/css/main.css?v=<?= $mainCssVersion ?>" rel="stylesheet">
  <link href="assets/css/leaflet.css" rel="stylesheet">

  <link href="assets/vendor/sweetalert2/sweetalert2.min.css" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/Control.Geocoder.css" />


</head>

<body class="collect-sample-body">

  <main class="main">
    <div class="collect-sample-public-shell">
      <?php if(!$isValidCode) { ?>
        <div class="collect-sample-public-container">
          <div class="alert alert-danger text-center shadow collect-sample-invalid-card">
            <h4>QR Code ไม่ถูกต้อง</h4>
            <p class="mb-0">กรุณาติดต่อเจ้าหน้าที่เพื่อขอความช่วยเหลือ</p>
          </div>
        </div>

      <?php } elseif ($isFormLocked) { ?>
        <div class="collect-sample-public-container d-flex justify-content-center align-items-center" style="min-height:60vh">
          <div class="alert alert-success text-center shadow px-5 py-4">
            <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
            <h4>บันทึกข้อมูลตัวอย่างดินเรียบร้อยแล้ว</h4>
            <p class="mb-0 text-muted">สถานะปัจจุบัน: <?= htmlspecialchars($qrCode['status'] ?? '') ?></p>
          </div>
        </div>

      <?php } elseif ($collectMode === 'choice') { ?>
        <div class="collect-sample-public-container">
          <div class="collect-sample-page-header">
            <div>
              <h1 class="collect-sample-page-title">แบบฟอร์มเก็บตัวอย่างดิน</h1>
              <div class="collect-sample-breadcrumb">
                <i class="fas fa-qrcode"></i>
                <span>กรอกข้อมูลจาก QR Code สำหรับการเก็บตัวอย่างดิน</span>
              </div>
            </div>
            <span class="collect-sample-status-pill">
              <i class="fas fa-circle text-primary" style="font-size:0.6rem"></i>
              <?= $formStatusLabel ?>
            </span>
          </div>
          <div class="collect-sample-public-card">
            <div class="collect-sample-public-card-header">
              <h4 class="collect-sample-public-card-title mb-0">
                <i class="fas fa-seedling me-2"></i>คุณเคยกรอกข้อมูลในระบบแล้วหรือไม่?
              </h4>
            </div>
            <div class="collect-sample-public-card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <a href="/collect-sample/<?= urlencode($code) ?>?mode=first_time" class="btn btn-outline-primary w-100 py-4 fw-semibold text-decoration-none">
                    <i class="fas fa-user-plus me-2"></i>กรอกข้อมูลครั้งแรก
                  </a>
                </div>
                <div class="col-md-6">
                  <a href="/collect-sample/<?= urlencode($code) ?>?mode=returning" class="btn btn-primary w-100 py-4 fw-semibold text-decoration-none text-white">
                    <i class="fas fa-user-check me-2"></i>เคยใส่ข้อมูลแล้ว
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      <?php } else { /* first_time or returning */ ?>
        <div class="collect-sample-public-container">
          <div class="collect-sample-page-header">
            <div>
              <a href="/collect-sample/<?= urlencode($code) ?>" class="collect-sample-back-btn text-decoration-none">
                <i class="fas fa-arrow-left"></i> ย้อนกลับ
              </a>
              <h1 class="collect-sample-page-title">แบบฟอร์มเก็บตัวอย่างดิน</h1>
              <div class="collect-sample-breadcrumb">
                <i class="fas fa-qrcode"></i>
                <span><?= $collectMode === 'returning' ? 'เกษตรกรเดิม — เลือกหรือเพิ่มแปลง' : 'กรอกข้อมูลครั้งแรก' ?></span>
              </div>
            </div>
            <span class="collect-sample-status-pill">
              <i class="fas fa-circle text-primary" style="font-size:0.6rem"></i>
              <?= $formStatusLabel ?>
            </span>
          </div>

          <div class="collect-sample-public-card">
            <div class="collect-sample-public-card-header">
              <h4 class="collect-sample-public-card-title mb-0">
                <i class="fas fa-seedling me-2"></i>ข้อมูลตัวอย่างดิน
              </h4>
            </div>
            <div class="collect-sample-public-card-body">
              <form method="post" onsubmit="return validateForm(event)" id="collectForm">

                <?php if ($collectMode === 'returning'): ?>
                <!-- returning: lookup panel -->
                <div class="collect-sample-section-title">
                  <i class="fas fa-search"></i>ค้นหาข้อมูลเกษตรกร
                </div>
                <div class="alert alert-light border mb-3" id="lookupPanel">
                  <div class="row g-3 align-items-end">
                    <div class="col-md-5">
                      <label class="form-label"><span class="text-danger">* </span>ชื่อจริง</label>
                      <input type="text" id="lookupFirstName" class="form-control" placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)">
                    </div>
                    <div class="col-md-5">
                      <label class="form-label"><span class="text-danger">* </span>เบอร์โทรศัพท์</label>
                      <input type="text" id="lookupPhone" class="form-control" placeholder="เช่น 080xxxxxxx">
                    </div>
                    <div class="col-md-2">
                      <button type="button" id="lookupBtn" class="btn btn-outline-primary w-100" onclick="doFarmerLookup()">ค้นหา</button>
                    </div>
                  </div>
                  <div id="lookupResult" class="mt-3" style="display:none"></div>
                </div>

                <!-- existing land selector (hidden until farmer found) -->
                <div id="existingLandPanel" style="display:none">
                  <div class="alert alert-primary border mb-3">
                    <label class="form-label fw-semibold">เลือกแปลงเดิม</label>
                    <select id="existingLandSelect" class="form-select mb-2" onchange="applyExistingLand(this.value)">
                      <option value="">-- เลือกแปลงเดิม --</option>
                    </select>
                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="startNewLand()">+ เพิ่มแปลงใหม่</button>
                  </div>
                </div>
                <?php endif; ?>

                <!-- farmer info fields -->
                <div id="farmerFields" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
                  <div class="collect-sample-section-title"><i class="fas fa-user"></i>ข้อมูลเกษตรกร</div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>ชื่อ <?= $collectMode === 'first_time' ? '<small class="text-muted">(ไม่ต้องใส่คำนำหน้า)</small>' : '' ?></label>
                      <input type="text" name="firstName" class="form-control <?= isset($errors['firstName']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['firstName']) ?>">
                      <?php if (isset($errors['firstName'])): ?><div class="invalid-feedback"><?= $errors['firstName'] ?></div><?php endif; ?>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>นามสกุล</label>
                      <input type="text" name="lastName" class="form-control <?= isset($errors['lastName']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['lastName']) ?>">
                      <?php if (isset($errors['lastName'])): ?><div class="invalid-feedback"><?= $errors['lastName'] ?></div><?php endif; ?>
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>หมายเลขโทรศัพท์</label>
                      <input type="text" name="phoneNumber" placeholder="080xxxxxxx" class="form-control <?= isset($errors['phoneNumber']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['phoneNumber']) ?>">
                      <?php if (isset($errors['phoneNumber'])): ?><div class="invalid-feedback"><?= $errors['phoneNumber'] ?></div><?php endif; ?>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>รหัสบัตรประชาชน</label>
                      <input type="text" name="thaiNationalId" placeholder="1 2345 67890 12 3" class="form-control <?= isset($errors['thaiNationalId']) ? 'is-invalid' : '' ?>"
                        value="<?= htmlspecialchars($collectExamForm['thaiNationalId']) ?>">
                      <?php if (isset($errors['thaiNationalId'])): ?><div class="invalid-feedback"><?= $errors['thaiNationalId'] ?></div><?php endif; ?>
                    </div>
                  </div>
                </div><!-- /farmerFields -->

                <!-- land fields -->
                <div id="landFields" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
                  <div class="collect-sample-section-title"><i class="fas fa-map-marked-alt"></i>ข้อมูลแปลง</div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>พื้นที่ (ไร่)</label>
                      <input type="number" step="0.01" min="0" name="areaSize" class="form-control" placeholder="เช่น 10.5"
                        value="<?= htmlspecialchars($_POST['areaSize'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">ชื่อแปลง</label>
                      <input type="text" name="landName" class="form-control"
                        value="<?= htmlspecialchars($collectExamForm['landName']) ?>">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>จังหวัด</label>
                      <select name="provinceCode" id="provinceCode" class="form-select" onchange="loadDistricts(this.value)">
                        <option value="">-- กรุณาเลือกจังหวัด --</option>
                        <?php foreach ($provinces as $p): ?>
                          <option value="<?= $p['code'] ?>" <?= (($_POST['provinceCode'] ?? '') == $p['code']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($p['nameTh']) ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>อำเภอ/เขต</label>
                      <select name="districtCode" id="districtCode" class="form-select" onchange="loadSubdistricts(this.value)">
                        <option value="">-- กรุณาเลือกจังหวัดก่อน --</option>
                      </select>
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>ตำบล/แขวง</label>
                      <select name="subdistrictCode" id="subdistrictCode" class="form-select" onchange="onSubdistrictChange(this)">
                        <option value="">-- กรุณาเลือกอำเภอก่อน --</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">รหัสไปรษณีย์</label>
                      <input type="text" name="zipCode" id="zipCode" class="form-control bg-light" readonly
                        placeholder="กรอกอัตโนมัติเมื่อเลือกตำบล"
                        value="<?= htmlspecialchars($_POST['zipCode'] ?? '') ?>">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label">หมายเลขแปลง</label>
                      <input type="text" name="landCode" class="form-control"
                        value="<?= htmlspecialchars($collectExamForm['landCode']) ?>">
                    </div>
                  </div>
                </div><!-- /landFields -->

                <!-- service fields (always shown when form visible) -->
                <div id="serviceFields" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
                  <div class="collect-sample-section-title"><i class="fas fa-building"></i>ข้อมูลบริการ</div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>โรงงาน</label>
                      <select name="factoryId" id="factoryId" class="form-select">
                        <?php foreach ($factories as $factory): ?>
                          <option value="<?= $factory['factoryId'] ?>" <?= ($factory['factoryId'] == $selectedFactory) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($factory['name']) ?> (<?= htmlspecialchars($factory['initial']) ?>)
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>เขตส่งเสริม</label>
                      <select name="serviceAreaId" id="serviceAreaId" class="form-select">
                        <?php foreach ($serviceAreas as $area): ?>
                          <option value="<?= $area['serviceAreaId'] ?>" <?= ($area['serviceAreaId'] == $collectExamForm['serviceAreaId']) ? 'selected' : '' ?>>
                            เขต <?= htmlspecialchars($area['code']) ?> <?= htmlspecialchars($area['name']) ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label"><span class="text-danger">* </span>ประเภทการให้บริการ</label>
                      <select name="serviceTypeId" id="serviceTypeId" class="form-select">
                        <?php foreach ($serviceTypes as $st): ?>
                          <option value="<?= $st['serviceTypeId'] ?>" <?= ($st['serviceTypeId'] == $collectExamForm['serviceTypeId']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($st['name']) ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                  </div>
                </div><!-- /serviceFields -->

                <input type="hidden" name="latitude" id="latitude" value="<?= htmlspecialchars($collectExamForm['latitude'] ?? '') ?>">
                <input type="hidden" name="longitude" id="longitude" value="<?= htmlspecialchars($collectExamForm['longitude'] ?? '') ?>">

                <!-- map (always shown when form visible) -->
                <div id="mapSection" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
                  <div class="collect-sample-section-title"><i class="fas fa-location-dot"></i>พิกัดแปลง</div>
                  <div class="collect-sample-map-toolbar">
                    <span>เลือกตำแหน่งแปลงจากแผนที่</span>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="toggleEditBtn" aria-checked="false">
                      <label class="form-check-label" for="toggleEditBtn">แก้ไขพิกัด</label>
                    </div>
                  </div>
                  <div class="collect-sample-map-panel"><div id="map"></div></div>
                </div>

                <div id="submitRow" class="d-grid gap-2 d-md-flex justify-content-md-end mt-4" <?= $collectMode === 'returning' ? 'style="display:none !important"' : '' ?>>
                  <button type="submit" class="btn btn-primary px-4 fw-semibold">
                    <i class="fas fa-save me-2"></i>บันทึกข้อมูล
                  </button>
                </div>

              </form>
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
  <script src="assets/js/public-formatters.js"></script>

  <script src="assets/vendor/sweetalert2/sweetalert2.all.min.js"></script>

<script src="assets/js/leaflet.js"></script>
<script src="assets/js/Control.Geocoder.js"></script>
<script>
// ── DATA FROM PHP ─────────────────────────────────────────────────────────────
const serviceAreasByFactory = <?= json_encode($serviceAreasByFactory) ?>;
const collectMode           = <?= json_encode($collectMode) ?>;
const savedLatStr           = <?= json_encode((string)($collectExamForm['latitude'] ?? '')) ?>;
const savedLngStr           = <?= json_encode((string)($collectExamForm['longitude'] ?? '')) ?>;
const preselectedServiceAreaId = <?= json_encode($collectExamForm['serviceAreaId'] ?? null) ?>;

// ── MAP ───────────────────────────────────────────────────────────────────────
let mapInstance = null;

function initMap() {
  if (mapInstance) return;
  if (!document.getElementById('map')) return;

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  });

  mapInstance = L.map('map');
  osmLayer.addTo(mapInstance);
  L.control.layers({ 'แผนที่ปกติ': osmLayer, 'ดาวเทียม': satelliteLayer }).addTo(mapInstance);

  const markerIcon = L.icon({ iconUrl: 'assets/img/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] });

  let viewLat = 13.7563, viewLng = 100.5018, hasSaved = false;
  if (savedLatStr !== '' && savedLngStr !== '') {
    const la = parseFloat(savedLatStr), lo = parseFloat(savedLngStr);
    if (!isNaN(la) && !isNaN(lo)) { viewLat = la; viewLng = lo; hasSaved = true; }
  }

  const marker = L.marker([viewLat, viewLng], { icon: markerIcon, draggable: false, autoPan: true }).addTo(mapInstance);
  mapInstance.setView([viewLat, viewLng], hasSaved ? 15 : 6);

  const latInput = document.getElementById('latitude');
  const lngInput = document.getElementById('longitude');

  function setCoords(lat, lng) {
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
  }

  if (hasSaved) setCoords(viewLat, viewLng);

  if (L.Control.Geocoder) {
    L.Control.geocoder({ defaultMarkGeocode: false, placeholder: 'ค้นหา ตำบล, อำเภอ...', errorMessage: 'ไม่พบข้อมูล', geocoder: L.Control.Geocoder.arcgis() })
      .on('markgeocode', function(e) {
        const c = e.geocode.center;
        marker.setLatLng(c); setCoords(c.lat, c.lng);
        e.geocode.bbox ? mapInstance.fitBounds(e.geocode.bbox) : mapInstance.setView(c, 15);
        enableEditMode();
      }).addTo(mapInstance);
  }

  if (!hasSaved && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => { mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 16); marker.setLatLng([pos.coords.latitude, pos.coords.longitude]); setCoords(pos.coords.latitude, pos.coords.longitude); },
      err => {
        const msg = err.code === err.PERMISSION_DENIED ? 'คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาเปิดสิทธิ์หรือเลือกจุดเอง' : 'กรุณาเปิด GPS หรือปักหมุดเองบนแผนที่';
        Swal.fire({ icon: 'warning', title: 'ไม่สามารถระบุตำแหน่งได้', text: msg, confirmButtonText: 'ตกลง' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const toggleSwitch = document.getElementById('toggleEditBtn');
  let isEditMode = false;

  function enableEditMode() {
    if (toggleSwitch && !toggleSwitch.checked) { toggleSwitch.checked = true; toggleSwitch.dispatchEvent(new Event('change')); }
  }

  toggleSwitch.addEventListener('change', function() {
    isEditMode = this.checked;
    this.setAttribute('aria-checked', isEditMode ? 'true' : 'false');
    if (isEditMode) {
      marker.dragging.enable();
      mapInstance.on('click', e => { marker.setLatLng(e.latlng); setCoords(e.latlng.lat, e.latlng.lng); });
      marker.bindTooltip('เลื่อนแผนที่หรือคลิกเพื่อเปลี่ยนตำแหน่ง', { permanent: false, direction: 'top' });
    } else {
      marker.dragging.disable();
      mapInstance.off('click');
      marker.unbindTooltip();
    }
  });

  marker.on('dragend', function() { const p = marker.getLatLng(); setCoords(p.lat, p.lng); });
  mapInstance.on('move', function() { if (isEditMode) { const c = mapInstance.getCenter(); marker.setLatLng(c); setCoords(c.lat, c.lng); } });
}

// ── SERVICE AREAS CASCADE ─────────────────────────────────────────────────────
function updateServiceAreas(preselect) {
  const factoryEl = document.getElementById('factoryId');
  const areaEl    = document.getElementById('serviceAreaId');
  if (!factoryEl || !areaEl) return;
  const areas = serviceAreasByFactory[factoryEl.value] || [];
  areaEl.innerHTML = areas.map(a =>
    `<option value="${a.serviceAreaId}" ${(preselect != null ? a.serviceAreaId == preselect : false) ? 'selected' : ''}>เขต ${a.code} ${a.name}</option>`
  ).join('');
}

// ── ADDRESS CASCADE ───────────────────────────────────────────────────────────
async function loadDistricts(provinceCode) {
  const distEl = document.getElementById('districtCode');
  const subEl  = document.getElementById('subdistrictCode');
  const zipEl  = document.getElementById('zipCode');
  distEl.innerHTML = '<option value="">กำลังโหลด...</option>';
  subEl.innerHTML  = '<option value="">-- กรุณาเลือกอำเภอก่อน --</option>';
  if (zipEl) zipEl.value = '';
  if (!provinceCode) { distEl.innerHTML = '<option value="">-- กรุณาเลือกจังหวัดก่อน --</option>'; return; }
  const res = await fetch(`/api/districts/${provinceCode}`);
  const data = await res.json();
  distEl.innerHTML = '<option value="">-- กรุณาเลือกอำเภอ --</option>' +
    data.map(d => `<option value="${d.code}">${d.nameTh}</option>`).join('');
}

async function loadSubdistricts(districtCode) {
  const subEl = document.getElementById('subdistrictCode');
  const zipEl = document.getElementById('zipCode');
  subEl.innerHTML = '<option value="">กำลังโหลด...</option>';
  if (zipEl) zipEl.value = '';
  if (!districtCode) { subEl.innerHTML = '<option value="">-- กรุณาเลือกอำเภอก่อน --</option>'; return; }
  const res = await fetch(`/api/subdistricts/${districtCode}`);
  const data = await res.json();
  subEl.innerHTML = '<option value="">-- กรุณาเลือกตำบล --</option>' +
    data.map(s => `<option value="${s.code}" data-zip="${s.zipCode}">${s.nameTh}</option>`).join('');
}

function onSubdistrictChange(sel) {
  const opt = sel.options[sel.selectedIndex];
  const zipEl = document.getElementById('zipCode');
  if (zipEl) zipEl.value = opt ? (opt.dataset.zip || '') : '';
}

// ── RETURNING MODE: FARMER LOOKUP ─────────────────────────────────────────────
let existingFarmerData = null;
let existingLands = [];

async function doFarmerLookup() {
  const firstName   = document.getElementById('lookupFirstName').value.trim();
  const rawPhone    = document.getElementById('lookupPhone').value.replace(/\D/g, '');
  const resultDiv   = document.getElementById('lookupResult');
  const btn         = document.getElementById('lookupBtn');

  if (!firstName || !rawPhone) {
    Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูล', text: 'กรุณากรอกชื่อและเบอร์โทรศัพท์', confirmButtonText: 'ตกลง' });
    return;
  }

  btn.disabled = true; btn.textContent = 'ค้นหา...';
  resultDiv.style.display = 'none';

  try {
    const res = await fetch('/api/farmer-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, phoneNumber: rawPhone })
    });
    const data = await res.json();

    if (data.success && data.data) {
      existingFarmerData = data.data;
      existingLands = data.data.lands || [];

      resultDiv.className = 'alert alert-success mt-3';
      resultDiv.innerHTML = `<i class="fas fa-check-circle me-2"></i>พบข้อมูล: <strong>${data.data.firstName} ${data.data.lastName}</strong>`;
      resultDiv.style.display = 'block';

      // fill farmer hidden fields
      document.querySelector('[name="firstName"]').value = data.data.firstName || '';
      document.querySelector('[name="lastName"]').value  = data.data.lastName  || '';
      document.querySelector('[name="phoneNumber"]').value  = data.data.phone  || '';
      document.querySelector('[name="thaiNationalId"]').value = data.data.thaiNationalId || '';

      // populate land selector
      const landSel = document.getElementById('existingLandSelect');
      landSel.innerHTML = '<option value="">-- เลือกแปลงเดิม --</option>' +
        existingLands.map(l => `<option value="${l.landId}">${l.name} (${l.landCode || 'ไม่มีรหัสแปลง'})</option>`).join('');

      document.getElementById('existingLandPanel').style.display = 'block';
    } else {
      resultDiv.className = 'alert alert-warning mt-3';
      resultDiv.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>ไม่พบข้อมูลเกษตรกร กรุณาตรวจสอบชื่อและเบอร์โทร';
      resultDiv.style.display = 'block';
    }
  } catch(e) {
    resultDiv.className = 'alert alert-danger mt-3';
    resultDiv.innerHTML = 'เกิดข้อผิดพลาดในการค้นหา';
    resultDiv.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'ค้นหา';
  }
}

function applyExistingLand(landId) {
  if (!landId) {
    // clear — hide form sections
    document.getElementById('landFields').style.display = 'none';
    document.getElementById('serviceFields').style.display = 'none';
    document.getElementById('mapSection').style.display = 'none';
    document.getElementById('submitRow').style.display = 'none';
    return;
  }
  const land = existingLands.find(l => l.landId == landId);
  if (!land) return;

  // fill land hidden fields
  document.querySelector('[name="landCode"]').value = land.landCode || '';
  document.querySelector('[name="landName"]').value = land.name || '';

  // show service + map
  document.getElementById('landFields').style.display = 'none'; // existing land = no need to re-enter land address
  document.getElementById('serviceFields').style.display = 'block';
  document.getElementById('mapSection').style.display = 'block';
  document.getElementById('submitRow').style.removeProperty('display');
  initMap();
}

function startNewLand() {
  document.getElementById('existingLandSelect').value = '';
  document.getElementById('landFields').style.display = 'block';
  document.getElementById('serviceFields').style.display = 'block';
  document.getElementById('mapSection').style.display = 'block';
  document.getElementById('submitRow').style.removeProperty('display');
  initMap();
}

// ── VALIDATION ────────────────────────────────────────────────────────────────
function clearError(input) {
  input.classList.remove('is-invalid');
  const fb = input.nextElementSibling;
  if (fb && fb.classList.contains('invalid-feedback')) fb.remove();
}

function validateForm(event) {
  event.preventDefault();
  const form = event.target;

  // strip formatting
  const pIn = form.querySelector('[name="phoneNumber"]');
  if (pIn) pIn.value = pIn.value.replace(/\D/g, '');
  const tIn = form.querySelector('[name="thaiNationalId"]');
  if (tIn) tIn.value = tIn.value.replace(/\D/g, '');

  const latVal = document.getElementById('latitude').value;
  const lngVal = document.getElementById('longitude').value;

  if (!latVal || !lngVal) {
    Swal.fire({ icon: 'warning', title: 'ไม่พบข้อมูลพิกัด', text: 'กรุณาระบุตำแหน่งบนแผนที่ก่อนบันทึก', confirmButtonText: 'ตกลง' });
    return false;
  }

  const data   = Object.fromEntries(new FormData(form));
  const errors = {};
  const labels = { firstName: 'ชื่อ', lastName: 'นามสกุล', phoneNumber: 'หมายเลขโทรศัพท์', thaiNationalId: 'รหัสบัตรประชาชน', serviceAreaId: 'เขตส่งเสริม', serviceTypeId: 'ประเภทการให้บริการ', factoryId: 'โรงงาน' };

  ['firstName','lastName','phoneNumber','thaiNationalId','serviceAreaId','serviceTypeId','factoryId'].forEach(f => {
    if (!data[f] || !data[f].trim()) errors[f] = `กรุณากรอก${labels[f]}`;
  });
  if (data.phoneNumber && !/^\d{10}$/.test(data.phoneNumber)) errors.phoneNumber = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
  if (data.thaiNationalId && !/^\d{13}$/.test(data.thaiNationalId)) errors.thaiNationalId = 'รหัสบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';

  document.querySelectorAll('.is-invalid').forEach(el => clearError(el));
  for (const [f, msg] of Object.entries(errors)) {
    const el = form.querySelector(`[name="${f}"]`);
    if (el) { el.classList.add('is-invalid'); const fb = document.createElement('div'); fb.className = 'invalid-feedback'; fb.textContent = msg; el.after(fb); }
  }
  if (Object.keys(errors).length) return false;

  form.submit(); return true;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // service areas cascade
  const factoryEl = document.getElementById('factoryId');
  if (factoryEl) {
    updateServiceAreas(preselectedServiceAreaId);
    factoryEl.addEventListener('change', () => updateServiceAreas(null));
  }

  // auto-format
  const phoneIn = document.querySelector('[name="phoneNumber"]');
  if (phoneIn) {
    phoneIn.value = PublicFormatters.formatPhoneNumber(phoneIn.value);
    phoneIn.addEventListener('input', e => e.target.value = PublicFormatters.formatPhoneNumber(e.target.value));
  }
  const idIn = document.querySelector('[name="thaiNationalId"]');
  if (idIn) {
    idIn.value = PublicFormatters.formatIDCard(idIn.value);
    idIn.addEventListener('input', e => e.target.value = PublicFormatters.formatIDCard(e.target.value));
  }

  // clear errors on change
  document.querySelectorAll('input[name], select[name]').forEach(el => {
    el.addEventListener('input',  () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  // init map for first_time (always visible); returning = only after land chosen
  if (collectMode === 'first_time') initMap();
});
</script>

</body>

</html>
