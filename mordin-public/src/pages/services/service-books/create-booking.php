<?php
session_start();

$cPAGE['name'] = "จองคิววิเคราะห์ดิน";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/farmer";
$cPAGE['desc'] = "จองคิวตรวจวิเคราะห์ดินสำหรับแปลงที่เลือก";

// 1. ตรวจสอบว่า login หรือยัง
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

require_once __DIR__ . '/booking-page-helpers.php';

// 3. เตรียมข้อมูลพื้นฐาน
$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

$currentLand = null;
$calendars = [];
$serviceTypes = [];
$error = null;
$success = null;
$landId = null;

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
      $_SESSION['booking_success'] = "จองคิวสำเร็จ! เจ้าหน้าที่จะทำการตรวจสอบและยืนยันข้อมูลของท่าน";
      header('Location: /services/book/farmer');
      exit;
    } else {
      $errorMessage = $res['message'] ?? 'ไม่ทราบสาเหตุ';
      $errorMessage = publicBookingErrorMessage($errorMessage);
      $error = "การจองล้มเหลว: " . $errorMessage;
    }
  }
  // บันทึกล้มเหลว — ดึงข้อมูลหน้าเพจใหม่เพื่อแสดง error
  publicBookingLoadPageData($farmerId, $landId, $currentLand, $calendars, $serviceTypes);


} else {
  // --- 6B. Handle Page Load (โหลดข้อมูล) ---
  if (!$error) {
    $error = publicBookingLoadLandOrError($farmerId, $landId, $currentLand, "ไม่พบข้อมูลแปลงที่เลือก หรือแปลงนี้ไม่ได้เป็นของคุณ");
  }

  if (!$error) {
    $error = publicBookingLoadCalendarsOrError($calendars, "ไม่สามารถดึงข้อมูลรอบบริการได้ในขณะนี้");
    $serviceTypes = ServiceTypeAPI::getAllServiceTypes();
    if (empty($serviceTypes) || isset($serviceTypes['error'])) {
      $error = "ไม่สามารถดึงข้อมูลประเภทบริการได้";
      $serviceTypes = [];
    }
  }
}


// ฟังก์ชันช่วยจัดรูปแบบที่อยู่ปฏิทิน
include_once COMPONENT_PATH . 'lib_header.php';
?>
<section class="section">
  <div class="container">

    <?php if ($error || !$currentLand): ?>
      <div class="public-booking-result public-booking-result-error" data-aos="fade-up">
        <i class="bi bi-exclamation-triangle-fill public-booking-result-icon"></i>
        <h2><?= htmlspecialchars($error ?? 'ไม่พบข้อมูลแปลง') ?></h2>
        <p>กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่</p>
        <a href="/services/book/farmer" class="btn btn-secondary px-5">กลับหน้าแปลงของฉัน</a>
      </div>

    <?php else: ?>
      <div class="public-back-bar">
        <button type="button" class="public-back-button" onclick="history.back()">
          <i class="bi bi-arrow-left" aria-hidden="true"></i> ย้อนกลับ
        </button>
      </div>

      <form method="POST" id="formToConfirm">
        <input type="hidden" name="landId" value="<?= htmlspecialchars($landId) ?>">

        <div class="row gy-4">

          <div class="col-lg-4" data-aos="fade-up" data-aos-delay="100">
            <div class="public-booking-info-card">
              <div class="public-booking-info-header">
                <h3><i class="bi bi-person-check-fill me-2"></i>ข้อมูลผู้จอง</h3>
              </div>
              <div class="public-booking-info-body">
                <div class="public-booking-info-row">
                  <i class="bi bi-person-fill public-booking-info-icon"></i>
                  <div>
                    <div class="public-booking-info-label">เกษตรกร</div>
                    <div class="public-booking-info-value">
                      <?= htmlspecialchars($farmerProfile['firstName'] . ' ' . $farmerProfile['lastName']) ?>
                    </div>
                  </div>
                </div>
                <div class="public-booking-info-row">
                  <i class="bi bi-credit-card-fill public-booking-info-icon"></i>
                  <div>
                    <div class="public-booking-info-label">หมายเลขเกษตรกร</div>
                    <div class="public-booking-info-value">
                      <?= htmlspecialchars($farmerProfile['thaiFarmerId'] ?? '-') ?>
                    </div>
                  </div>
                </div>
                <div class="public-booking-info-row">
                  <i class="bi bi-pin-map-fill public-booking-info-icon"></i>
                  <div>
                    <div class="public-booking-info-label">แปลงที่จอง</div>
                    <div class="public-booking-info-value">
                      <?= htmlspecialchars($currentLand['name']) ?>
                    </div>
                  </div>
                </div>
                <div class="public-booking-info-row">
                  <i class="bi bi-rulers public-booking-info-icon"></i>
                  <div>
                    <div class="public-booking-info-label">พื้นที่</div>
                    <div class="public-booking-info-value">
                      <?= htmlspecialchars($currentLand['areaSize'] ?? '-') ?> ไร่
                    </div>
                  </div>
                </div>
              </div>
              <div class="public-booking-info-note mx-3 mb-3 px-3 py-2">
                <i class="bi bi-info-circle me-1"></i>
                ข้อมูลจะถูกส่งให้เจ้าหน้าที่ตรวจสอบก่อนยืนยัน
              </div>
            </div>
          </div>

          <div class="col-lg-8" data-aos="fade-up" data-aos-delay="150">
            <div class="public-booking-form-card">
              <div class="public-booking-form-header">
                <h3><i class="bi bi-calendar-check-fill me-2"></i>เลือกรอบบริการ</h3>
              </div>
              <div class="public-booking-form-body">
                <div class="row g-3">

                  <div class="col-12">
                    <label for="createServiceCalendarId" class="form-label">รอบบริการ (วันที่และสถานที่) <span class="text-danger">*</span></label>
                    <select id="createServiceCalendarId" name="serviceCalendarId" class="form-select" required>
                      <option value="" selected disabled>-- กรุณาเลือกรอบบริการ --</option>
                      <?php publicBookingRenderCalendarOptions($calendars); ?>
                    </select>
                  </div>

                  <div class="col-12">
                    <label for="createServiceTypeId" class="form-label">ประเภทบริการ <span class="text-danger">*</span></label>
                    <select id="createServiceTypeId" name="serviceTypeId" class="form-select" required>
                      <option value="" selected disabled>-- กรุณาเลือกประเภทบริการ --</option>
                      <?php foreach ($serviceTypes as $type): ?>
                        <option value="<?= $type['serviceTypeId'] ?>">
                          <?= htmlspecialchars($type['name']) ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                  </div>

                  <div class="col-12 mt-2">
                    <button type="button" class="btn btn-primary w-100 public-booking-submit"
                      data-bs-toggle="modal"
                      data-bs-target="#globalConfirmModal"
                      data-bs-title="ยืนยันการจอง"
                      data-bs-message="คุณต้องการยืนยันการจองคิวนี้ใช่หรือไม่?"
                      data-bs-form-id="formToConfirm">
                      <i class="bi bi-calendar-check-fill me-2"></i>ยืนยันการจอง
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

<?php include_once COMPONENT_PATH . 'lib_footer.php'; ?>
