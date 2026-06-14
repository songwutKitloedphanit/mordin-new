<?php
session_start();

$cPAGE['name'] = "จองคิววิเคราะห์ดิน";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/farmer"; // กลับไปหน้าข้อมูลเกษตรกร
$cPAGE['desc'] = "จองคิวตรวจวิเคราะห์ดินสำหรับแปลงที่เลือก";

// 1. ตรวจสอบว่า login หรือยัง
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

// 2. Include services ที่จำเป็น
include_once(__DIR__ . '/../../../utils/date.php');
require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../services/ServiceCalendarAPI.php');
require_once(__DIR__ . '/../../../services/serviceTypeAPI.php');
require_once(__DIR__ . '/../../../services/Booking.php');

// 3. เตรียมข้อมูลพื้นฐาน
$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

$currentLand = null;
$calendars = [];
$serviceTypes = [];
$error = null;
$success = null;
$landId = null;

// [!!]
// อ่านค่า
// Flash
// Message
// (เผื่อมี
// Error
// จากการ
// Submit)
$bookingError = $_SESSION['booking_error'] ?? null;
$bookingSuccess = $_SESSION['booking_success'] ?? null;
unset($_SESSION['booking_error']); 
unset($_SESSION['booking_success']); 

// 4. ตรวจสอบ Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: /services/book/farmer');
  exit;
}

// 5. รับค่า Land ID จาก POST
$landId = $_POST['landId'] ?? null;
if (!$landId) {
  $error = "ไม่พบรหัสแปลง (Land ID)";
}

// 6. ตรวจสอบว่าเป็นการ "โหลด" หรือ "บันทึก"
if (isset($_POST['serviceCalendarId'])) {
  // --- 6A. Handle Form Submit (บันทึก) ---
  $receivedServiceCalendarId = $_POST['serviceCalendarId'] ?? null;
  $serviceTypeId = $_POST['serviceTypeId'] ?? null;

  if (!$receivedServiceCalendarId || !$serviceTypeId) {
    $error = "กรุณาเลือกรอบบริการและประเภทบริการ";
  } else {
    $bookingData = [
      'receivedServiceCalendarId' => intval($receivedServiceCalendarId),
      'serviceTypeId'           => intval($serviceTypeId),
      'farmerId'                => intval($farmerId), // จาก Session
      'landId'                  => intval($landId)    // จาก POST
    ];

    $res = BookingAPI::createBooking($bookingData);

    if ($res['success']) {
      // [!!]
      // ตั้งค่า
      // Flash
      // Message
      // เพื่อให้
      // Modal
      // ในหน้า
      // farmer.php
      // ทำงาน
      $_SESSION['booking_success'] = "จองคิวสำเร็จ! เจ้าหน้าที่จะทำการตรวจสอบและยืนยันข้อมูลของท่าน";
      header('Location: /services/book/farmer');
      exit;
    } else {
      //
      // ถ้า
      // Error
      // จาก
      // API
      // (เช่น
      // จองซ้ำ)
      $errorMessage = $res['message'] ?? 'ไม่ทราบสาเหตุ';
      if (is_array($errorMessage)) {
        $errorMessage = implode(', ', $errorMessage);
      }
      $error = "การจองล้มเหลว: " . $errorMessage;
    }
  }
  
  //
  // ถ้าการบันทึกล้มเหลว
  // (เช่น
  // validate
  // ไม่ผ่าน
  // หรือ
  // API
  // error)
  // เราต้องดึงข้อมูลหน้าเพจใหม่
  $landData = FarmerAPI::getLandsByFarmerId($farmerId);
  if ($landData['httpCode'] === 200) {
    foreach ($landData['data'] as $land) {
      if ($land['landId'] == $landId) {
        $currentLand = $land;
        break;
      }
    }
  }
  $calendars = ServiceCalendarAPI::getPublicUpComingCalendar();
  $serviceTypes = ServiceTypeAPI::getAllServiceTypes();


} else {
  // --- 6B. Handle Page Load (โหลดข้อมูล) ---
  if (!$error) {
    $landData = FarmerAPI::getLandsByFarmerId($farmerId);
    if ($landData['httpCode'] === 200) {
      foreach ($landData['data'] as $land) {
        if ($land['landId'] == $landId) {
          $currentLand = $land;
          break;
        }
      }
    }
    if (!$currentLand) {
      $error = "ไม่พบข้อมูลแปลงที่เลือก หรือแปลงนี้ไม่ได้เป็นของคุณ";
    }
  }

  if (!$error) {
    $calendars = ServiceCalendarAPI::getPublicUpComingCalendar();
    if (empty($calendars) || isset($calendars['error'])) {
      $error = "ไม่สามารถดึงข้อมูลรอบบริการได้ในขณะนี้";
      $calendars = []; 
    }
    $serviceTypes = ServiceTypeAPI::getAllServiceTypes();
    if (empty($serviceTypes) || isset($serviceTypes['error'])) {
      $error = "ไม่สามารถดึงข้อมูลประเภทบริการได้";
      $serviceTypes = []; 
    }
  }
}


// ฟังก์ชันช่วยจัดรูปแบบที่อยู่ปฏิทิน
function getCalendarAddress($cal)
{
  $village = $cal['village'] ?? '-';
  $subdistrict = $cal['subdistrictName'] ?? $cal['subdistrict']['nameTh'] ?? '';
  $district = $cal['districtName'] ?? $cal['subdistrict']['district']['nameTh'] ?? '';
  $province = $cal['provinceName'] ?? $cal['subdistrict']['district']['province']['nameTh'] ?? '';
  return "{$village} ต.{$subdistrict} อ.{$district} จ.{$province}";
}

include_once(COMPONENT_PATH . 'lib_header.php');
?>

<main class="main">
  <div class="page-title">
    <div class="container">
      <nav class="breadcrumbs">
        <ol>
          <li><a href="/services/book/farmer">ข้อมูลเกษตรกร</a></li>
          <li class="current">จองคิว</li>
        </ol>
      </nav>
      <h1>ลงทะเบียนจองคิว (สำหรับสมาชิก)</h1>
    </div>
  </div>

  <section class="section">
    <div class="container">
      
      <?php if ($error): ?>
        <div class="alert alert-danger text-center py-5">
          <i class="bi bi-exclamation-triangle-fill display-1 text-danger mb-3"></i>
          <h4><?= $error ?></h4>
          <p>กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่</p>
          <a href="/services/book/farmer" class="btn btn-secondary mt-2">กลับ</a>
        </div>
      <?php elseif (!$currentLand && !$error): ?>
          <div class="alert alert-danger text-center py-5">
            <i class="bi bi-exclamation-triangle-fill display-1 text-danger mb-3"></i>
            <h4>ไม่พบข้อมูลแปลง</h4>
            <p>ไม่สามารถโหลดข้อมูลแปลงที่เลือกได้</p>
            <a href="/services/book/farmer" class="btn btn-secondary mt-2">กลับ</a>
          </div>
      <?php else: ?>
        <form method="POST" id="formToConfirm">
          <input type="hidden" name="landId" value="<?= htmlspecialchars($landId) ?>">

          <div class="row gy-4">

            <div class="col-lg-4">
              <div class="card shadow-sm border-0 h-100 bg-light">
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary mb-3">ข้อมูลการจอง</h5>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <i class="bi bi-person-fill text-info me-2"></i>
                      <strong>เกษตรกร:</strong>
                      <?= htmlspecialchars($farmerProfile['firstName'] . ' ' . $farmerProfile['lastName']) ?>
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-pin-map-fill text-danger me-2"></i>
                      <strong>สำหรับแปลง:</strong>
                      <?= htmlspecialchars($currentLand['name']) ?>
                    </li>
                    <li class="text-muted small ms-4">
                      (พื้นที่ <?= htmlspecialchars($currentLand['areaSize'] ?? '-') ?> ไร่)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-lg-8">
              <div class="card shadow border-0">
                <div class="card-header bg-white py-3">
                  <h5 class="mb-0 fw-bold"><i class="bi bi-calendar-check-fill me-2"></i>
                    เลือกวันและประเภทบริการ</h5>
                </div>
                <div class="card-body p-4">

                  <div class="row g-3">
                    <div class="col-md-12">
                      <label class="form-label">รอบบริการ (วันที่และสถานที่) <span
                          class="text-danger">*</span></label>
                      <select name="serviceCalendarId" class="form-select" required>
                        <option value="" selected disabled>-- กรุณาเลือกรอบบริการ --</option>
                        <?php foreach ($calendars as $cal): ?>
                          <option value="<?= $cal['serviceCalendarId'] ?>">
                            <?= htmlspecialchars(thaiDate($cal['date'])) ?>
                            |
                            <?= htmlspecialchars(getCalendarAddress($cal)) ?>
                            (รถเบอร์: <?= htmlspecialchars($cal['bus']['busNumber'] ?? '-') ?>)
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>

                    <div class="col-md-12">
                      <label class="form-label">ประเภทบริการ <span class="text-danger">*</span></label>
                      <select name="serviceTypeId" class="form-select" required>
                        <option value="" selected disabled>-- กรุณาเลือกประเภทบริการ --</option>
                        <?php foreach ($serviceTypes as $type): ?>
                          <option value="<?= $type['serviceTypeId'] ?>">
                            <?= htmlspecialchars($type['name']) ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </div>

                    <div class="col-12 mt-4">
                      <button type="button" class="btn btn-primary w-100 py-2 fw-bold"
                        data-bs-toggle="modal"
                        data-bs-target="#globalConfirmModal"
                        data-bs-title="ยืนยันการจอง"
                        data-bs-message="คุณต้องการยืนยันการจองคิวนี้ใช่หรือไม่?">
                        ยืนยันการจอง
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </form>
      <?php endif; ?>
    </div>
  </section>
</main>

<?php include_once(COMPONENT_PATH . 'lib_footer.php'); ?>
