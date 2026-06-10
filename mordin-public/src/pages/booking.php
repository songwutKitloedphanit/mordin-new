<?php
// [Config]
$cPAGE['name']  = "จองคิวตรวจวิเคราะห์ดิน";
$cPAGE['alias'] = "booking";
$cPAGE['link']  = "booking";
$cPAGE['desc']  = "ลงทะเบียนจองคิวตรวจวิเคราะห์ดินล่วงหน้า";

include_once COMPONENT_PATH . 'lib_header.php';
include_once UTILS_PATH . 'date.php';
require_once SERVICES_PATH . 'ServiceCalendarAPI.php';
require_once SERVICES_PATH . 'Booking.php';
require_once SERVICES_PATH . 'ServiceTypeAPI.php'; // [NEW] Import Service Type

$calendarId = $_GET['calendarId'] ?? null;
$calendar = null;
$error = null;
$success = null;

// 1. ดึงข้อมูล Calendar
if ($calendarId) {
    $allCalendars = ServiceCalendarAPI::getPublicUpComingCalendar();
    if (!empty($allCalendars) && !isset($allCalendars['error'])) {
        foreach ($allCalendars as $cal) {
            if (intval($cal['serviceCalendarId']) === intval($calendarId)) {
                $calendar = $cal;
                break;
            }
        }
    }
    if (!$calendar) {
        $error = "ไม่พบข้อมูลรอบบริการ หรือรอบบริการนี้สิ้นสุดแล้ว";
    }
} else {
    $error = "ระบุรอบบริการไม่ถูกต้อง";
}

// [NEW] 2. ดึงข้อมูล Service Types สำหรับ Dropdown
$serviceTypes = ServiceTypeAPI::getAllServiceTypes();
// ถ้า API มีปัญหาหรือไม่มีข้อมูล ให้สร้าง Dummy ไว้กัน Error
if (empty($serviceTypes) || isset($serviceTypes['error'])) {
    $serviceTypes = [
        ['serviceTypeId' => 1, 'name' => 'วิเคราะห์ดินทั่วไป (Default)']
    ];
}

// 3. Handle Form Submit
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$error) {

    $bookingData = [
        'receivedServiceCalendarId' => intval($calendarId),
        'firstName'      => $_POST['firstName'],
        'lastName'       => $_POST['lastName'],
        'phoneNumber'    => $_POST['phoneNumber'],
        'thaiNationalId' => $_POST['thaiNationalId'],
        'landCode'       => $_POST['landCode'] ?? '',

        // [UPDATED] รับค่าจาก Dropdown
        'serviceTypeId'  => intval($_POST['serviceTypeId']),

        // ค่า Default อื่นๆ (ถ้าอนาคตต้องเลือก Factory/Area ก็ทำ Dropdown แบบเดียวกัน)
        'serviceAreaId'  => intval($_POST['serviceAreaId'] ?? 1),
        'factoryId'      => intval($_POST['factoryId'] ?? 1)
    ];

    $res = BookingAPI::createBooking($bookingData);

    if ($res['success']) {
        $success = "จองคิวสำเร็จ! เจ้าหน้าที่จะทำการตรวจสอบและยืนยันข้อมูลของท่าน";
    } else {
        $error = "การจองล้มเหลว: " . $res['message'];
    }
}

// จัดรูปแบบที่อยู่
$fullAddress = "-";
if ($calendar) {
    $village = $calendar['village'] ?? '-';
    $subdistrict = $calendar['subdistrictName'] ?? $calendar['subdistrict']['nameTh'] ?? '';
    $district = $calendar['districtName'] ?? $calendar['subdistrict']['district']['nameTh'] ?? '';
    $province = $calendar['provinceName'] ?? $calendar['subdistrict']['district']['province']['nameTh'] ?? '';
    $fullAddress = "{$village} ต.{$subdistrict} อ.{$district} จ.{$province}";
}
?>

<section class="section">
  <div class="container">

    <?php if ($success): ?>
      <div class="public-booking-result public-booking-result-success" data-aos="fade-up">
        <i class="bi bi-check-circle-fill public-booking-result-icon"></i>
        <h2 class="public-booking-result-title">จองคิวสำเร็จ!</h2>
        <p class="public-booking-result-msg">
          ระบบได้บันทึกข้อมูลการจองของคุณเรียบร้อยแล้ว<br>
          เจ้าหน้าที่จะทำการตรวจสอบและยืนยันข้อมูลของท่าน
        </p>
        <a href="calendar" class="btn btn-primary px-5">กลับหน้าปฏิทิน</a>
      </div>

    <?php elseif ($error): ?>
      <div class="public-booking-result public-booking-result-error" data-aos="fade-up">
        <i class="bi bi-exclamation-triangle-fill public-booking-result-icon"></i>
        <h2 class="public-booking-result-title">เกิดข้อผิดพลาด</h2>
        <p class="public-booking-result-msg"><?= htmlspecialchars($error) ?></p>
        <div class="d-flex gap-2">
          <a href="javascript:history.back()" class="btn btn-outline-secondary px-4">ย้อนกลับ</a>
          <a href="calendar" class="btn btn-secondary px-4">หน้าปฏิทิน</a>
        </div>
      </div>

    <?php else: ?>
      <div class="row gy-4">

        <div class="col-lg-4" data-aos="fade-up" data-aos-delay="100">
          <div class="public-booking-info-card">
            <div class="public-booking-info-header">
              <h3><i class="bi bi-calendar2-check me-2"></i>รายละเอียดรอบบริการ</h3>
            </div>
            <div class="public-booking-info-body">
              <div class="public-booking-info-row">
                <i class="bi bi-calendar-event public-booking-info-icon"></i>
                <div>
                  <div class="public-booking-info-label">วันที่บริการ</div>
                  <div class="public-booking-info-value">
                    <?= isset($calendar['date']) ? thaiDate($calendar['date']) : '-' ?>
                  </div>
                </div>
              </div>
              <div class="public-booking-info-row">
                <i class="bi bi-geo-alt-fill public-booking-info-icon"></i>
                <div>
                  <div class="public-booking-info-label">สถานที่</div>
                  <div class="public-booking-info-value"><?= htmlspecialchars($fullAddress) ?></div>
                </div>
              </div>
              <div class="public-booking-info-row">
                <i class="bi bi-truck public-booking-info-icon"></i>
                <div>
                  <div class="public-booking-info-label">รถโมบายเลขที่</div>
                  <div class="public-booking-info-value">
                    <?= htmlspecialchars($calendar['bus']['busNumber'] ?? '-') ?>
                  </div>
                </div>
              </div>
              <div class="public-booking-info-row">
                <i class="bi bi-clock public-booking-info-icon"></i>
                <div>
                  <div class="public-booking-info-label">เวลารับตัวอย่าง</div>
                  <div class="d-flex flex-column gap-1 mt-1">
                    <span class="public-booking-time-badge px-2 py-1">09:00 – 09:30 น. &nbsp;จองล่วงหน้า</span>
                    <span class="public-booking-time-badge px-2 py-1">09:30 – 10:00 น. &nbsp;Walk-in (จำกัด)</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="public-booking-info-note mx-3 mb-3 px-3 py-2">
              <i class="bi bi-info-circle me-1"></i>
              กรุณาเตรียมบัตรประชาชนและรหัสแปลงปลูก (ถ้ามี) มาในวันรับบริการ
            </div>
          </div>
        </div>

        <div class="col-lg-8" data-aos="fade-up" data-aos-delay="150">
          <div class="public-booking-form-card">
            <div class="public-booking-form-header">
              <h3><i class="bi bi-person-lines-fill me-2"></i>กรอกข้อมูลผู้จอง</h3>
            </div>
            <div class="public-booking-form-body">
              <form method="POST" id="bookingForm" novalidate>
                <input type="hidden" name="serviceAreaId" value="1">
                <input type="hidden" name="factoryId" value="1">

                <div class="row g-3">
                  <div class="col-12">
                    <label for="bookingServiceTypeId" class="form-label">ประเภทบริการ <span class="text-danger">*</span></label>
                    <select id="bookingServiceTypeId" name="serviceTypeId" class="form-select" required>
                      <option value="" selected disabled>-- กรุณาเลือกประเภทบริการ --</option>
                      <?php foreach ($serviceTypes as $type): ?>
                        <option value="<?= $type['serviceTypeId'] ?>">
                          <?= htmlspecialchars($type['name']) ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                  </div>

                  <div class="col-12">
                    <label for="thaiNationalId" class="form-label">เลขบัตรประชาชน (13 หลัก) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person-vcard-fill"></i></span>
                      <input type="text" name="thaiNationalId" id="thaiNationalId"
                        class="form-control" maxlength="17" required placeholder="X-XXXX-XXXXX-XX-X">
                    </div>
                    <div id="idCardFeedback" class="text-danger small mt-1 d-none">
                      กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง (เฉพาะตัวเลข)
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="bookingFirstName" class="form-label">ชื่อ <span class="text-danger">*</span></label>
                    <input id="bookingFirstName" type="text" name="firstName" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label for="bookingLastName" class="form-label">นามสกุล <span class="text-danger">*</span></label>
                    <input id="bookingLastName" type="text" name="lastName" class="form-control" required>
                  </div>

                  <div class="col-md-6">
                    <label for="bookingPhoneNumber" class="form-label">เบอร์โทรศัพท์ <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
                      <input id="bookingPhoneNumber" type="tel" name="phoneNumber" class="form-control" required>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="bookingLandCode" class="form-label">รหัสแปลง (ถ้ามี)</label>
                    <input id="bookingLandCode" type="text" name="landCode" class="form-control" placeholder="เช่น 10-1234">
                  </div>

                  <div class="col-12 mt-2">
                    <button type="button" id="btnSubmitBooking"
                      class="btn btn-primary w-100 public-booking-submit"
                      data-bs-toggle="modal" data-bs-target="#globalConfirmModal"
                      data-bs-title="ยืนยันการจอง"
                      data-bs-message="คุณต้องการยืนยันการจองคิววิเคราะห์ดินนี้ใช่หรือไม่?"
                      data-bs-form-id="bookingForm">
                      <i class="bi bi-calendar-check-fill me-2"></i>ยืนยันการจอง
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    <?php endif; ?>

  </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function () {

  const idInput   = document.getElementById('thaiNationalId');
  const phoneInput = document.querySelector('input[name="phoneNumber"]');
  const feedback   = document.getElementById('idCardFeedback');

  function formatIDCard(value) {
    const d = value.replace(/\D/g, '').slice(0, 13);
    let f = d;
    if (d.length > 1)  f = d.slice(0, 1)  + '-' + d.slice(1);
    if (d.length > 5)  f = f.slice(0, 6)  + '-' + f.slice(6);
    if (d.length > 10) f = f.slice(0, 12) + '-' + f.slice(12);
    if (d.length > 12) f = f.slice(0, 15) + '-' + f.slice(15);
    return f;
  }

  function formatPhone(value) {
    const d = value.replace(/\D/g, '').slice(0, 10);
    let f = d;
    if (d.length > 3) f = d.slice(0, 3) + '-' + d.slice(3);
    if (d.length > 6) f = f.slice(0, 7) + '-' + f.slice(7);
    return f;
  }

  if (idInput) {
    idInput.addEventListener('input', function (e) {
      e.target.value = formatIDCard(e.target.value);
      if (feedback) feedback.classList.add('d-none');
      idInput.classList.remove('is-invalid');
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      e.target.value = formatPhone(e.target.value);
    });
  }

  // Intercept confirm-modal trigger to validate first (capture phase runs before Bootstrap)
  const btn = document.getElementById('btnSubmitBooking');
  if (btn) {
    btn.addEventListener('click', function (e) {
      if (!idInput) return;
      const rawId = idInput.value.replace(/-/g, '');
      if (rawId.length !== 13 || !/^\d+$/.test(rawId)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        idInput.classList.add('is-invalid');
        if (feedback) feedback.classList.remove('d-none');
        idInput.focus();
        return;
      }
      // Pre-clean values so POST receives raw digits
      idInput.value = rawId;
      if (phoneInput) phoneInput.value = phoneInput.value.replace(/-/g, '');
    }, true); // capture phase
  }
});
</script>

<?php include_once COMPONENT_PATH . 'lib_footer.php'; ?>
