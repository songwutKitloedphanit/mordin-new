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

require_once __DIR__ . '/booking-page-helpers.php';

$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

$currentLand = null;
$calendars = [];
$error = null;
$success = null;
$landId = null;
$bookId = null;

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
  // ตรวจสอบความเป็นเจ้าของ: landId ต้องเป็นของ farmer และ bookId ต้องตรงกับ booking ของแปลงนั้น (กัน IDOR)
  $ownerLand = publicBookingFindLand($farmerId, $landId);
  if (!$ownerLand || ($ownerLand['landStatus']['bookId'] ?? null) != $bookId) {
    $_SESSION['booking_error'] = 'คุณไม่มีสิทธิ์แก้ไขการจองนี้';
    header('Location: /services/book/farmer');
    exit;
  }

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
      $errorMessage = publicBookingErrorMessage($errorMessage);
      $error = "การเปลี่ยนล้มเหลว: " . $errorMessage;
    }
  }

  // บันทึกล้มเหลว — ดึงข้อมูลหน้าเพจใหม่เพื่อแสดง error
  publicBookingLoadPageData($farmerId, $landId, $currentLand, $calendars);

} else {
  $error = publicBookingLoadLandOrError($farmerId, $landId, $currentLand, "ไม่พบข้อมูลแปลงที่เลือก หรือแปลงนี้ไม่ได้เป็นของคุณ");

  if (!$error) {
    $error = publicBookingLoadCalendarsOrError($calendars, "ไม่สามารถดึงข้อมูลรอบบริการได้ในขณะนี้");
  }
}

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
          <input type="hidden" name="bookId" value="<?= htmlspecialchars($bookId) ?>">

          <div class="row gy-4">

            <div class="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div class="public-booking-info-card">
                <div class="public-booking-info-header">
                  <h3><i class="bi bi-arrow-left-right me-2"></i>ข้อมูลการเปลี่ยนวัน</h3>
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
                    <i class="bi bi-pin-map-fill public-booking-info-icon"></i>
                    <div>
                      <div class="public-booking-info-label">แปลงที่จอง</div>
                      <div class="public-booking-info-value">
                        <?= htmlspecialchars($currentLand['name']) ?>
                      </div>
                    </div>
                  </div>
                  <?php if (!empty($currentLand['landStatus']['bookedDate'])): ?>
                  <div class="public-booking-info-row">
                    <i class="bi bi-calendar-x public-booking-info-icon"></i>
                    <div>
                      <div class="public-booking-info-label">วันจองเดิม</div>
                      <div class="public-booking-info-value">
                        <?= htmlspecialchars($currentLand['landStatus']['bookedDate']) ?>
                      </div>
                    </div>
                  </div>
                  <?php endif; ?>
                </div>
                <div class="public-booking-info-note mx-3 mb-3 px-3 py-2">
                  <i class="bi bi-info-circle me-1"></i>
                  การเปลี่ยนวันจะยกเลิกรอบเดิมและจองรอบใหม่โดยอัตโนมัติ
                </div>
              </div>
            </div>

            <div class="col-lg-8" data-aos="fade-up" data-aos-delay="150">
              <div class="public-booking-form-card">
                <div class="public-booking-form-header">
                  <h3><i class="bi bi-calendar-check-fill me-2"></i>เลือกรอบบริการใหม่</h3>
                </div>
                <div class="public-booking-form-body">
                  <div class="row g-3">

                    <div class="col-12">
                      <label for="updateServiceCalendarId" class="form-label">รอบบริการ (วันที่และสถานที่) <span class="text-danger">*</span></label>
                      <select id="updateServiceCalendarId" name="serviceCalendarId" class="form-select" required>
                        <option value="" selected disabled>-- กรุณาเลือกรอบบริการใหม่ --</option>
                        <?php publicBookingRenderCalendarOptions($calendars); ?>
                      </select>
                    </div>

                    <div class="col-12 mt-2">
                      <button type="button" class="btn btn-warning text-white w-100 public-booking-submit"
                        data-bs-toggle="modal"
                        data-bs-target="#globalConfirmModal"
                        data-bs-title="ยืนยันการเปลี่ยนวัน"
                        data-bs-message="คุณต้องการเปลี่ยนวันจองคิวนี้ใช่หรือไม่?"
                        data-bs-form-id="formToConfirm">
                        <i class="bi bi-arrow-left-right me-2"></i>ยืนยันการเปลี่ยนวัน
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
