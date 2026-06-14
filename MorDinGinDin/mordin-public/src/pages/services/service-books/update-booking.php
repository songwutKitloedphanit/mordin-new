<?php
session_start();

$cPAGE['name'] = "เปลี่ยนวันจองคิว";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/farmer";
$cPAGE['desc'] = "เปลี่ยนวันจองคิวตรวจวิเคราะห์ดิน";

if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

include_once(__DIR__ . '/../../../utils/date.php');
require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../services/ServiceCalendarAPI.php');
require_once(__DIR__ . '/../../../services/serviceTypeAPI.php');
require_once(__DIR__ . '/../../../services/Booking.php');

$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

$currentLand = null;
$calendars = [];
$error = null;
$success = null;
$landId = null;
$bookId = null;

//
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: /services/book/farmer');
  exit;
}

$landId = $_POST['landId'] ?? null;
$bookId = $_POST['bookId'] ?? null;
if (!$landId || !$bookId) {
  $_SESSION['booking_error'] = 'ข้อมูลการจองไม่ถูกต้อง';
  header('Location: /services/book/farmer');
  exit;
}

if (isset($_POST['serviceCalendarId'])) {
  $receivedServiceCalendarId = $_POST['serviceCalendarId'] ?? null;
  
  if (!$receivedServiceCalendarId) {
    $error = "กรุณาเลือกรอบบริการใหม่";
  } else {
    $bookingData = [
      'receivedServiceCalendarId' => intval($receivedServiceCalendarId),
      'farmerId'                => intval($farmerId) 
    ];

    $res = BookingAPI::updateBooking($bookId, $bookingData);

    if ($res['success']) {
      $_SESSION['booking_success'] = "เปลี่ยนวันจองสำเร็จ!";
      header('Location: /services/book/farmer');
      exit;
    } else {
      $errorMessage = $res['message'] ?? 'ไม่ทราบสาเหตุ';
      if (is_array($errorMessage)) {
        $errorMessage = implode(', ', $errorMessage);
      }
      $error = "การเปลี่ยนล้มเหลว: " . $errorMessage;
    }
  }

  //
  // ถ้า
  // Error
  // ต้องดึงข้อมูลหน้าเพจใหม่
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

} else {
  //
  // Handle
  // Page
  // Load
  // (โหลดข้อมูล)
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

  if (!$error) {
    $calendars = ServiceCalendarAPI::getPublicUpComingCalendar();
    if (empty($calendars) || isset($calendars['error'])) {
      $error = "ไม่สามารถดึงข้อมูลรอบบริการได้ในขณะนี้";
      $calendars = [];
    }
  }
}

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
          <li class="current">เปลี่ยนวันจอง</li>
        </ol>
      </nav>
      <h1>เปลี่ยนวันจองคิว</h1>
    </div>
  </div>

  <section class="section">
    <div class="container">

      <?php if ($error): ?>
        <div class="alert alert-danger text-center py-5">
          <i class="bi bi-exclamation-triangle-fill display-1 text-danger mb-3"></i>
          <h4><?= $error ?></h4>
          <a href="/services/book/farmer" class="btn btn-secondary mt-2">กลับ</a>
        </div>
      <?php elseif (!$currentLand && !$error): ?>
          <div class="alert alert-danger text-center py-5">
            <i class="bi bi-exclamation-triangle-fill display-1 text-danger mb-3"></i>
            <h4>ไม่พบข้อมูลแปลง</h4>
            <a href="/services/book/farmer" class="btn btn-secondary mt-2">กลับ</a>
          </div>
      <?php else: ?>
        <form method="POST" id="formToConfirm">
          <input type="hidden" name="landId" value="<?= htmlspecialchars($landId) ?>">
          <input type="hidden" name="bookId" value="<?= htmlspecialchars($bookId) ?>">

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
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-lg-8">
              <div class="card shadow border-0">
                <div class="card-header bg-white py-3">
                  <h5 class="mb-0 fw-bold"><i class="bi bi-calendar-check-fill me-2"></i>
                    เลือกวันจองใหม่</h5>
                </div>
                <div class="card-body p-4">

                  <div class="row g-3">
                    <div class="col-md-12">
                      <label class="form-label">รอบบริการใหม่ (วันที่และสถานที่) <span
                          class="text-danger">*</span></label>
                      <select name="serviceCalendarId" class="form-select" required>
                        <option value="" selected disabled>-- กรุณาเลือกรอบบริการใหม่ --</option>
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

                    <div class="col-12 mt-4">
                      <button type="button" class="btn btn-primary w-100 py-2 fw-bold"
                        data-bs-toggle="modal"
                        data-bs-target="#globalConfirmModal"
                        data-bs-title="ยืนยันการเปลี่ยน"
                        data-bs-message="คุณต้องการเปลี่ยนวันจองคิวนี้ใช่หรือไม่?">
                        ยืนยันการเปลี่ยน
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