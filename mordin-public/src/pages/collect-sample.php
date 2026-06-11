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
    $farmerId      = filter_var($_POST['farmerId'] ?? null, FILTER_VALIDATE_INT);
    $landId        = filter_var($_POST['landId'] ?? null, FILTER_VALIDATE_INT);

    $birthDay      = $_POST['birthDay'] ?? '';
    $birthMonth    = $_POST['birthMonth'] ?? '';
    $birthYear     = $_POST['birthYear'] ?? '';
    $birthDate     = null;

    if ($birthDay && $birthMonth && $birthYear) {
      $ceYear = (int)$birthYear - 543;
      $birthDate = sprintf('%04d-%02d-%02d', $ceYear, (int)$birthMonth, (int)$birthDay);
    }

    if (trim($_POST['firstName'] ?? '') === '') $errors['firstName'] = 'กรุณากรอกชื่อ';
    if (trim($_POST['lastName'] ?? '') === '')  $errors['lastName']  = 'กรุณากรอกนามสกุล';
    if (!preg_match('/^[0-9]{10}$/', $phoneNumber))  $errors['phoneNumber']    = 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    if ($collectMode === 'first_time') {
      if (!preg_match('/^[0-9]{13}$/', $thaiNationalId)) $errors['thaiNationalId'] = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }
    if (!$birthDate) $errors['birthDate'] = 'กรุณากรอกวัน/เดือน/ปีเกิด';
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
      'birthDate'     => $birthDate,
      'landCode'      => trim($_POST['landCode'] ?? ''),
      'landName'      => trim($_POST['landName'] ?? ''),
      'factoryId'     => (int)$factoryId,
      'serviceAreaId' => (int)$serviceAreaId,
      'serviceTypeId' => (int)$serviceTypeId,
      'latitude'      => $latitude,
      'longitude'     => $longitude,
    ];

    if ($farmerId && $farmerId > 0) {
      $formData['farmerId'] = $farmerId;
    }
    if ($landId && $landId > 0) {
      $formData['landId'] = $landId;
    }

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

          <!-- Stepper progress bar -->
          <div class="collect-sample-stepper">
            <div class="step-item active" id="stepHeader1">
              <div class="step-number">1</div>
              <div class="step-label">ข้อมูลเกษตรกร</div>
            </div>
            <div class="step-line"></div>
            <div class="step-item" id="stepHeader2">
              <div class="step-number">2</div>
              <div class="step-label">ข้อมูลแปลง</div>
            </div>
            <div class="step-line"></div>
            <div class="step-item" id="stepHeader3">
              <div class="step-number">3</div>
              <div class="step-label">ข้อมูลบริการ</div>
            </div>
          </div>

          <div class="collect-sample-public-card">
            <div class="collect-sample-public-card-header">
              <h4 class="collect-sample-public-card-title mb-0" id="cardTitleText">
                <i class="fas fa-seedling me-2"></i>ข้อมูลเกษตรกร (ขั้นตอนที่ 1)
              </h4>
            </div>
            <div class="collect-sample-public-card-body">
              <form method="post" onsubmit="return validateForm(event)" id="collectForm">

                <!-- STEP 1: Farmer Info -->
                <div class="collect-sample-step-content" id="step1Content">
                  <input type="hidden" name="farmerId" id="farmerId" value="<?= htmlspecialchars($_POST['farmerId'] ?? '') ?>">
                  <input type="hidden" name="landId" id="landId" value="<?= htmlspecialchars($_POST['landId'] ?? '') ?>">

                  <!-- farmer info fields -->
                  <div id="farmerFields">
                    <div class="collect-sample-section-title"><i class="fas fa-user"></i>ข้อมูลเกษตรกร</div>
                    
                    <!-- Name row: hidden for returning users -->
                    <div class="row g-3 mb-3" id="nameFieldsRow" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
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

                    <!-- Phone & Citizen ID row: Citizen ID is hidden for returning users -->
                    <div class="row g-3 mb-3">
                      <div class="<?= $collectMode === 'returning' ? 'col-md-12' : 'col-md-6' ?>" id="phoneFieldCol">
                        <label class="form-label"><span class="text-danger">* </span>หมายเลขโทรศัพท์</label>
                        <input type="text" name="phoneNumber" placeholder="080xxxxxxx" class="form-control <?= isset($errors['phoneNumber']) ? 'is-invalid' : '' ?>"
                          value="<?= htmlspecialchars($collectExamForm['phoneNumber']) ?>">
                        <?php if (isset($errors['phoneNumber'])): ?><div class="invalid-feedback"><?= $errors['phoneNumber'] ?></div><?php endif; ?>
                      </div>
                      <div class="col-md-6" id="nationalIdFieldCol" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
                        <label class="form-label"><span class="text-danger">* </span>รหัสบัตรประชาชน</label>
                        <input type="text" name="thaiNationalId" placeholder="1 2345 67890 12 3" class="form-control <?= isset($errors['thaiNationalId']) ? 'is-invalid' : '' ?>"
                          value="<?= htmlspecialchars($collectExamForm['thaiNationalId']) ?>">
                        <?php if (isset($errors['thaiNationalId'])): ?><div class="invalid-feedback"><?= $errors['thaiNationalId'] ?></div><?php endif; ?>
                      </div>
                    </div>

                    <!-- Date of Birth dropdowns -->
                    <div class="row g-3 mb-3">
                      <div class="col-12">
                        <label class="form-label"><span class="text-danger">* </span>วัน/เดือน/ปี เกิด (พ.ศ.)</label>
                        <div class="row g-2">
                          <div class="col-4">
                            <select class="form-select <?= isset($errors['birthDate']) ? 'is-invalid' : '' ?>" name="birthDay" id="birthDay" required>
                              <option value="" disabled selected>วัน</option>
                              <?php for ($d = 1; $d <= 31; $d++): ?>
                                <option value="<?= $d ?>"><?= $d ?></option>
                              <?php endfor; ?>
                            </select>
                          </div>
                          <div class="col-4">
                            <select class="form-select <?= isset($errors['birthDate']) ? 'is-invalid' : '' ?>" name="birthMonth" id="birthMonth" required>
                              <option value="" disabled selected>เดือน</option>
                              <?php
                              $months = [
                                1 => 'ม.ค.', 2 => 'ก.พ.', 3 => 'มี.ค.', 4 => 'เม.ย.', 5 => 'พ.ค.', 6 => 'มิ.ย.',
                                7 => 'ก.ค.', 8 => 'ส.ค.', 9 => 'ก.ย.', 10 => 'ต.ค.', 11 => 'พ.ย.', 12 => 'ธ.ค.'
                              ];
                              foreach ($months as $m => $name): ?>
                                <option value="<?= $m ?>"><?= $name ?></option>
                              <?php endforeach; ?>
                            </select>
                          </div>
                          <div class="col-4">
                            <select class="form-select <?= isset($errors['birthDate']) ? 'is-invalid' : '' ?>" name="birthYear" id="birthYear" required>
                              <option value="" disabled selected>ปี พ.ศ.</option>
                              <?php
                              $currentYearBE = date('Y') + 543;
                              for ($y = $currentYearBE - 100; $y <= $currentYearBE; $y++): ?>
                                <option value="<?= $y ?>"><?= $y ?></option>
                              <?php endfor; ?>
                            </select>
                          </div>
                        </div>
                        <?php if (isset($errors['birthDate'])): ?><div class="invalid-feedback d-block"><?= $errors['birthDate'] ?></div><?php endif; ?>
                      </div>
                    </div>
                  </div><!-- /farmerFields -->

                  <div class="d-flex justify-content-end mt-4">
                    <button type="button" id="step1NextBtn" class="btn btn-primary px-4 fw-semibold" onclick="handleStep1Next()">
                      ถัดไป <i class="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div><!-- /step1Content -->

                <!-- STEP 2: Land Info -->
                <div class="collect-sample-step-content" id="step2Content" style="display:none">
                  <?php if ($collectMode === 'returning'): ?>
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

                  <input type="hidden" name="latitude" id="latitude" value="<?= htmlspecialchars($collectExamForm['latitude'] ?? '') ?>">
                  <input type="hidden" name="longitude" id="longitude" value="<?= htmlspecialchars($collectExamForm['longitude'] ?? '') ?>">

                  <!-- map -->
                  <div id="mapSection" <?= $collectMode === 'returning' ? 'style="display:none"' : '' ?>>
                    <div class="collect-sample-section-title"><i class="fas fa-location-dot"></i>พิกัดแปลง</div>
                    <div class="collect-sample-map-toolbar">
                      <span>เลือกตำแหน่งแปลงจากแผนที่ (คลิกที่แผนที่เพื่อปักหมุดพิกัดแปลง)</span>
                    </div>
                    <div class="collect-sample-map-panel"><div id="map"></div></div>
                  </div>

                  <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-secondary px-4 fw-semibold" onclick="goToStep(1)">
                      <i class="fas fa-arrow-left me-2"></i> ย้อนกลับ
                    </button>
                    <button type="button" class="btn btn-primary px-4 fw-semibold" onclick="goToStep(3)">
                      ถัดไป <i class="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div><!-- /step2Content -->

                <!-- STEP 3: Service & Coordinates -->
                <div class="collect-sample-step-content" id="step3Content" style="display:none">
                  <!-- service fields -->
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

                  <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-secondary px-4 fw-semibold" onclick="goToStep(2)">
                      <i class="fas fa-arrow-left me-2"></i> ย้อนกลับ
                    </button>
                    <button type="submit" class="btn btn-primary px-4 fw-semibold">
                      <i class="fas fa-save me-2"></i> บันทึกข้อมูล
                    </button>
                  </div>
                </div><!-- /step3Content -->
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
let mapMarker = null;

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

  const latInput = document.getElementById('latitude');
  const lngInput = document.getElementById('longitude');

  let viewLat = 13.7563, viewLng = 100.5018, hasSaved = false;

  // Read current input values first, then fallback to PHP-injected saved coords
  const currentLat = latInput ? latInput.value : '';
  const currentLng = lngInput ? lngInput.value : '';
  if (currentLat !== '' && currentLng !== '') {
    const la = parseFloat(currentLat), lo = parseFloat(currentLng);
    if (!isNaN(la) && !isNaN(lo)) { viewLat = la; viewLng = lo; hasSaved = true; }
  } else if (savedLatStr !== '' && savedLngStr !== '') {
    const la = parseFloat(savedLatStr), lo = parseFloat(savedLngStr);
    if (!isNaN(la) && !isNaN(lo)) { viewLat = la; viewLng = lo; hasSaved = true; }
  }

  mapMarker = L.marker([viewLat, viewLng], { icon: markerIcon, draggable: false, autoPan: true }).addTo(mapInstance);
  mapInstance.setView([viewLat, viewLng], hasSaved ? 15 : 6);

  function setCoords(lat, lng) {
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
  }

  if (hasSaved) setCoords(viewLat, viewLng);

  if (L.Control.Geocoder) {
    L.Control.geocoder({ defaultMarkGeocode: false, placeholder: 'ค้นหา ตำบล, อำเภอ...', errorMessage: 'ไม่พบข้อมูล', geocoder: L.Control.Geocoder.arcgis() })
      .on('markgeocode', function(e) {
        const c = e.geocode.center;
        mapMarker.setLatLng(c); setCoords(c.lat, c.lng);
        e.geocode.bbox ? mapInstance.fitBounds(e.geocode.bbox) : mapInstance.setView(c, 15);
      }).addTo(mapInstance);
  }

  if (!hasSaved && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => { mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 16); mapMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]); setCoords(pos.coords.latitude, pos.coords.longitude); },
      err => {
        const msg = err.code === err.PERMISSION_DENIED ? 'คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาเปิดสิทธิ์หรือเลือกจุดเอง' : 'กรุณาเปิด GPS หรือปักหมุดเองบนแผนที่';
        Swal.fire({ icon: 'warning', title: 'ไม่สามารถระบุตำแหน่งได้', text: msg, confirmButtonText: 'ตกลง' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Map is always clickable to change coordinates, but triggers a confirmation popup
  mapInstance.on('click', function(e) {
    const newLat = e.latlng.lat;
    const newLng = e.latlng.lng;
    
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการเปลี่ยนพิกัด',
      text: 'คุณต้องการเปลี่ยนตำแหน่งพิกัดแปลงไปยังจุดที่เลือกใช่หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        mapMarker.setLatLng(e.latlng);
        setCoords(newLat, newLng);
      }
    });
  });
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
    data.map(s => `<option value="${s.code}" data-zip="${s.zipCode}" data-lat="${s.latitude || ''}" data-lng="${s.longitude || ''}">${s.nameTh}</option>`).join('');
}

function onSubdistrictChange(sel) {
  const opt = sel.options[sel.selectedIndex];
  const zipEl = document.getElementById('zipCode');
  if (zipEl) zipEl.value = opt ? (opt.dataset.zip || '') : '';

  if (opt && opt.dataset.lat && opt.dataset.lng) {
    const lat = parseFloat(opt.dataset.lat);
    const lng = parseFloat(opt.dataset.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      updateMapPin(lat, lng, true);
    }
  }
}

function updateMapPin(lat, lng, updateInputs = true) {
  const latVal = parseFloat(lat);
  const lngVal = parseFloat(lng);
  if (isNaN(latVal) || isNaN(lngVal)) return;

  if (mapMarker) {
    mapMarker.setLatLng([latVal, lngVal]);
  }
  if (mapInstance) {
    mapInstance.setView([latVal, lngVal], 15);
  }
  if (updateInputs) {
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    if (latInput) latInput.value = latVal.toFixed(6);
    if (lngInput) lngInput.value = lngVal.toFixed(6);
  }
}

// ── RETURNING MODE: FARMER LOOKUP ─────────────────────────────────────────────
let existingFarmerData = null;
let existingLands = [];
let currentActiveStep = 1;

async function handleStep1Next() {
  if (collectMode !== 'returning') {
    if (validateCurrentStep(1)) {
      goToStep(2);
    }
    return;
  }

  const phoneEl = document.querySelector('[name="phoneNumber"]');
  const rawPhone = phoneEl.value.replace(/\D/g, '');
  const birthDay = document.getElementById('birthDay').value;
  const birthMonth = document.getElementById('birthMonth').value;
  const birthYear = document.getElementById('birthYear').value;

  if (!rawPhone || !birthDay || !birthMonth || !birthYear) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณากรอกข้อมูล',
      text: 'กรุณากรอกหมายเลขโทรศัพท์และวัน/เดือน/ปีเกิด ให้ครบถ้วน',
      confirmButtonText: 'ตกลง'
    });
    return;
  }

  if (rawPhone.length !== 10) {
    Swal.fire({
      icon: 'warning',
      title: 'หมายเลขโทรศัพท์ไม่ถูกต้อง',
      text: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก',
      confirmButtonText: 'ตกลง'
    });
    return;
  }

  const btn = document.getElementById('step1NextBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>กำลังค้นหา...';

  try {
    const res = await fetch('/api/farmer-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: rawPhone, birthDay, birthMonth, birthYear })
    });
    const data = await res.json();

    if (data.success && data.data) {
      existingFarmerData = data.data;
      existingLands = data.data.lands || [];

      // fill hidden farmer fields
      document.querySelector('[name="firstName"]').value = data.data.firstName || '';
      document.querySelector('[name="lastName"]').value  = data.data.lastName  || '';
      document.getElementById('farmerId').value = data.data.farmerId || '';
      document.querySelector('[name="thaiNationalId"]').value = '';

      // populate land selector
      const landSel = document.getElementById('existingLandSelect');
      landSel.innerHTML = '<option value="">-- เลือกแปลงเดิม --</option>' +
        existingLands.map(l => `<option value="${l.landId}">${l.name} (${l.landCode || 'ไม่มีรหัสแปลง'})</option>`).join('');

      document.getElementById('existingLandPanel').style.display = 'block';

      // Show confirmation dialog with user's name
      Swal.fire({
        icon: 'success',
        title: 'พบข้อมูลเกษตรกร',
        text: `ยืนยันการใช้ข้อมูลของ คุณ ${data.data.firstName} ${data.data.lastName} ใช่หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: 'ใช่, ถูกต้อง',
        cancelButtonText: 'ไม่ใช่',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      }).then((result) => {
        if (result.isConfirmed) {
          goToStep(2);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่พบข้อมูลเกษตรกร',
        text: 'ไม่พบข้อมูลเกษตรกรจากเบอร์โทรและวันเกิดที่ระบุ กรุณาตรวจสอบข้อมูล หรือเลือกกรอกข้อมูลครั้งแรก',
        confirmButtonText: 'ตกลง'
      });
      existingFarmerData = null;
      existingLands = [];
      document.getElementById('existingLandPanel').style.display = 'none';
      document.getElementById('farmerId').value = '';
    }
  } catch(e) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล',
      confirmButtonText: 'ตกลง'
    });
    existingFarmerData = null;
    existingLands = [];
    document.getElementById('existingLandPanel').style.display = 'none';
    document.getElementById('farmerId').value = '';
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function applyExistingLand(landId) {
  if (!landId) {
    document.getElementById('landId').value = '';
    // clear — hide form sections
    document.getElementById('landFields').style.display = 'none';
    document.getElementById('serviceFields').style.display = 'none';
    document.getElementById('mapSection').style.display = 'none';
    return;
  }
  const land = existingLands.find(l => l.landId == landId);
  if (!land) return;

  document.getElementById('landId').value = landId;

  // fill land fields
  document.querySelector('[name="landCode"]').value = land.landCode || '';
  document.querySelector('[name="landName"]').value = land.name || '';

  const latValF = parseFloat(land.latitude);
  const lngValF = parseFloat(land.longitude);
  if (!isNaN(latValF) && !isNaN(lngValF)) {
    document.getElementById('latitude').value = latValF.toFixed(6);
    document.getElementById('longitude').value = lngValF.toFixed(6);
  } else {
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
  }

  // hide new land fields (no need for address) and show map
  document.getElementById('landFields').style.display = 'none';
  document.getElementById('serviceFields').style.display = 'block';
  document.getElementById('mapSection').style.display = 'block';
  // Update map marker to selected land's position
  if (!isNaN(latValF) && !isNaN(lngValF)) {
    updateMapPin(latValF, lngValF, false);
  }
  // Init map if not yet (container was hidden during goToStep(2))
  initMap();
  if (mapInstance) { setTimeout(function() { mapInstance.invalidateSize(); }, 150); }
}

function startNewLand() {
  document.getElementById('existingLandSelect').value = '';
  document.getElementById('landId').value = '';

  // Clear coordinate fields so they don't bleed-through from the previously selected existing land
  document.getElementById('latitude').value = '';
  document.getElementById('longitude').value = '';

  // Clear new land fields as well
  document.querySelector('[name="landCode"]').value = '';
  document.querySelector('[name="landName"]').value = '';
  const areaSizeInput = document.querySelector('[name="areaSize"]');
  if (areaSizeInput) areaSizeInput.value = '';
  
  const provinceSel = document.getElementById('provinceCode');
  if (provinceSel) provinceSel.value = '';
  const districtSel = document.getElementById('districtCode');
  if (districtSel) districtSel.innerHTML = '<option value="">-- กรุณาเลือกจังหวัดก่อน --</option>';
  const subdistrictSel = document.getElementById('subdistrictCode');
  if (subdistrictSel) subdistrictSel.innerHTML = '<option value="">-- กรุณาเลือกอำเภอก่อน --</option>';
  const zipInput = document.getElementById('zipCode');
  if (zipInput) zipInput.value = '';

  document.getElementById('landFields').style.display = 'block';
  document.getElementById('serviceFields').style.display = 'block';
  document.getElementById('mapSection').style.display = 'block';
  // Init map if not yet (container was hidden during goToStep(2))
  initMap();
  if (mapInstance) { setTimeout(function() { mapInstance.invalidateSize(); }, 150); }
}

// ── STEP WIZARD NAVIGATION ───────────────────────────────────────────────────
function goToStep(step) {
  if (step > currentActiveStep) {
    if (!validateCurrentStep(currentActiveStep)) {
      return;
    }
  }

  currentActiveStep = step;

  // Show/hide step contents
  document.getElementById('step1Content').style.display = (step === 1) ? 'block' : 'none';
  document.getElementById('step2Content').style.display = (step === 2) ? 'block' : 'none';
  document.getElementById('step3Content').style.display = (step === 3) ? 'block' : 'none';

  // Update card titles
  const titles = {
    1: '<i class="fas fa-user me-2"></i>ข้อมูลเกษตรกร (ขั้นตอนที่ 1)',
    2: '<i class="fas fa-map-marked-alt me-2"></i>ข้อมูลแปลง (ขั้นตอนที่ 2)',
    3: '<i class="fas fa-building me-2"></i>ข้อมูลบริการ (ขั้นตอนที่ 3)'
  };
  document.getElementById('cardTitleText').innerHTML = titles[step];

  // Update stepper headers
  for (let s = 1; s <= 3; s++) {
    const header = document.getElementById('stepHeader' + s);
    if (s === step) {
      header.classList.add('active');
      header.classList.remove('completed');
    } else if (s < step) {
      header.classList.add('completed');
      header.classList.remove('active');
    } else {
      header.classList.remove('active');
      header.classList.remove('completed');
    }
  }

  // Initialize and resize map when reaching step 2 (map lives in step 2)
  if (step === 2) {
    initMap();
    if (mapInstance) {
      setTimeout(function() {
        mapInstance.invalidateSize();
      }, 150);
    }
  }

  // When going to step 3 in returning mode, ensure service fields are shown if land selected
  if (step === 3 && collectMode === 'returning') {
    const existLandEl = document.getElementById('existingLandSelect');
    if (existLandEl && existLandEl.value) {
      document.getElementById('serviceFields').style.display = 'block';
    }
  }

  // Smooth scroll to card top
  document.querySelector('.collect-sample-public-card').scrollIntoView({ behavior: 'smooth' });
}

// ── VALIDATION ────────────────────────────────────────────────────────────────
function showInputError(element, message) {
  element.classList.add('is-invalid');
  let fb = element.nextElementSibling;
  if (!fb || !fb.classList.contains('invalid-feedback')) {
    fb = document.createElement('div');
    fb.className = 'invalid-feedback';
    element.after(fb);
  }
  fb.textContent = message;
}

function clearInputError(element) {
  element.classList.remove('is-invalid');
  const fb = element.nextElementSibling;
  if (fb && fb.classList.contains('invalid-feedback')) {
    fb.remove();
  }
}

function validateCurrentStep(step) {
  let isValid = true;

  if (step === 1) {
    if (collectMode === 'returning') {
      if (!existingFarmerData) {
        Swal.fire({
          icon: 'warning',
          title: 'ยังไม่ได้ระบุข้อมูลเกษตรกร',
          text: 'กรุณากรอกข้อมูลในขั้นตอนที่ 1 และกดยืนยันผ่านปุ่มถัดไปก่อน',
          confirmButtonText: 'ตกลง'
        });
        return false;
      }
    }

    // Validate Step 1: Farmer Info
    const firstNameEl = document.querySelector('[name="firstName"]');
    if (!firstNameEl.value.trim()) {
      showInputError(firstNameEl, 'กรุณากรอกชื่อจริง');
      isValid = false;
    } else {
      clearInputError(firstNameEl);
    }

    const lastNameEl = document.querySelector('[name="lastName"]');
    if (!lastNameEl.value.trim()) {
      showInputError(lastNameEl, 'กรุณากรอกนามสกุล');
      isValid = false;
    } else {
      clearInputError(lastNameEl);
    }

    const phoneEl = document.querySelector('[name="phoneNumber"]');
    const phoneDigits = phoneEl.value.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      showInputError(phoneEl, 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      isValid = false;
    } else {
      clearInputError(phoneEl);
    }

    const nationalIdEl = document.querySelector('[name="thaiNationalId"]');
    if (collectMode === 'first_time') {
      const idDigits = nationalIdEl.value.replace(/\D/g, '');
      if (!idDigits || idDigits.length !== 13) {
        showInputError(nationalIdEl, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
        isValid = false;
      } else {
        clearInputError(nationalIdEl);
      }
    } else {
      clearInputError(nationalIdEl);
    }

    const bDay = document.getElementById('birthDay');
    const bMonth = document.getElementById('birthMonth');
    const bYear = document.getElementById('birthYear');
    if (!bDay.value || !bMonth.value || !bYear.value) {
      bDay.classList.add('is-invalid');
      bMonth.classList.add('is-invalid');
      bYear.classList.add('is-invalid');
      isValid = false;

      const parent = bDay.closest('.row').parentElement;
      let feedback = parent.querySelector('.invalid-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback d-block';
        feedback.textContent = 'กรุณาเลือกวัน/เดือน/ปีเกิด ให้ครบถ้วน';
        parent.appendChild(feedback);
      }
    } else {
      bDay.classList.remove('is-invalid');
      bMonth.classList.remove('is-invalid');
      bYear.classList.remove('is-invalid');
      const parent = bDay.closest('.row').parentElement;
      const feedback = parent.querySelector('.invalid-feedback');
      if (feedback) feedback.remove();
    }
  }
  else if (step === 2) {
    // Validate Step 2: Land Info
    if (collectMode === 'returning') {
      if (!existingFarmerData) {
        Swal.fire({ icon: 'warning', title: 'ยังไม่ได้ระบุข้อมูลเกษตรกร', text: 'กรุณาค้นหาและยืนยันข้อมูลเกษตรกรในขั้นตอนที่ 1 ก่อน', confirmButtonText: 'ตกลง' });
        return false;
      }

      const landSelectVal = document.getElementById('existingLandSelect').value;
      const landFieldsVisible = document.getElementById('landFields').style.display === 'block';

      if (!landSelectVal && !landFieldsVisible) {
        Swal.fire({ icon: 'warning', title: 'ยังไม่ได้เลือกแปลง', text: 'กรุณาเลือกแปลงเดิม หรือกดเพิ่มแปลงใหม่ก่อน', confirmButtonText: 'ตกลง' });
        return false;
      }

      if (landFieldsVisible) {
        isValid = validateNewLandFields();
      }
    } else {
      isValid = validateNewLandFields();
    }

    // Validate coordinates (map is in step 2)
    if (isValid) {
      const mapSectionEl = document.getElementById('mapSection');
      if (mapSectionEl && mapSectionEl.style.display !== 'none') {
        const latVal = document.getElementById('latitude').value;
        const lngVal = document.getElementById('longitude').value;
        if (!latVal || !lngVal) {
          Swal.fire({ icon: 'warning', title: 'ไม่พบพิกัดบนแผนที่', text: 'กรุณาคลิกบนแผนที่เพื่อระบุตำแหน่งแปลงก่อนดำเนินการต่อ', confirmButtonText: 'ตกลง' });
          isValid = false;
        }
      }
    }
  }
  else if (step === 3) {
    // Validate Step 3: Service info
    const factoryId = document.getElementById('factoryId');
    const serviceAreaId = document.getElementById('serviceAreaId');
    const serviceTypeId = document.getElementById('serviceTypeId');

    if (!factoryId.value) {
      showInputError(factoryId, 'กรุณาเลือกโรงงาน');
      isValid = false;
    } else {
      clearInputError(factoryId);
    }

    if (!serviceAreaId.value) {
      showInputError(serviceAreaId, 'กรุณาเลือกเขตส่งเสริม');
      isValid = false;
    } else {
      clearInputError(serviceAreaId);
    }

    if (!serviceTypeId.value) {
      showInputError(serviceTypeId, 'กรุณาเลือกประเภทการให้บริการ');
      isValid = false;
    } else {
      clearInputError(serviceTypeId);
    }
  }

  return isValid;
}

function validateNewLandFields() {
  let ok = true;

  const areaSizeEl = document.querySelector('[name="areaSize"]');
  const size = parseFloat(areaSizeEl.value);
  if (isNaN(size) || size <= 0) {
    showInputError(areaSizeEl, 'กรุณากรอกพื้นที่เป็นตัวเลขมากกว่า 0');
    ok = false;
  } else {
    clearInputError(areaSizeEl);
  }

  const provinceEl = document.getElementById('provinceCode');
  if (!provinceEl.value) {
    showInputError(provinceEl, 'กรุณาเลือกจังหวัด');
    ok = false;
  } else {
    clearInputError(provinceEl);
  }

  const districtEl = document.getElementById('districtCode');
  if (!districtEl.value) {
    showInputError(districtEl, 'กรุณาเลือกอำเภอ');
    ok = false;
  } else {
    clearInputError(districtEl);
  }

  const subdistrictEl = document.getElementById('subdistrictCode');
  if (!subdistrictEl.value) {
    showInputError(subdistrictEl, 'กรุณาเลือกตำบล');
    ok = false;
  } else {
    clearInputError(subdistrictEl);
  }

  return ok;
}

function clearError(input) {
  clearInputError(input);
}

function validateForm(event) {
  event.preventDefault();

  if (!validateCurrentStep(1) || !validateCurrentStep(2) || !validateCurrentStep(3)) {
    Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณาตรวจสอบและกรอกข้อมูลที่จำเป็นในแต่ละขั้นตอนให้ครบถ้วน', confirmButtonText: 'ตกลง' });
    return false;
  }

  const form = event.target;

  // strip formatting before submit
  const pIn = form.querySelector('[name="phoneNumber"]');
  if (pIn) pIn.value = pIn.value.replace(/\D/g, '');
  const tIn = form.querySelector('[name="thaiNationalId"]');
  if (tIn) tIn.value = tIn.value.replace(/\D/g, '');

  form.submit();
  return true;
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
});
</script>

</body>

</html>
