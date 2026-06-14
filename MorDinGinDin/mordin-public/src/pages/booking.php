<?php
// [Config]
$cPAGE['name']  = "จองคิวตรวจวิเคราะห์ดิน";
$cPAGE['alias'] = "booking";
$cPAGE['link']  = "booking";
$cPAGE['desc']  = "ลงทะเบียนจองคิวตรวจวิเคราะห์ดินล่วงหน้า";

include_once COMPONENT_PATH . 'lib_header.php';
include UTILS_PATH . 'date.php';
require_once(SERVICES_PATH . 'ServiceCalendarAPI.php');
require_once(SERVICES_PATH . 'Booking.php');
require_once(SERVICES_PATH . 'ServiceTypeAPI.php'); // [NEW] Import Service Type

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

<main class="main">
    <div class="page-title">
        <div class="container">
            <!-- <nav class="breadcrumbs">
                <ol>
                    <li><a href="calendar">ปฏิทิน</a></li>
                    <li class="current">จองคิว</li>
                </ol>
            </nav> -->
            <h1>ลงทะเบียนจองคิว</h1>
        </div>
    </div>

    <section class="section">
        <div class="container">
            <?php if ($success): ?>
                <div class="alert alert-success text-center py-5">
                    <i class="bi bi-check-circle-fill display-1 text-success mb-3"></i>
                    <h2><?= $success ?></h2>
                    <p>ระบบได้บันทึกข้อมูลการจองของคุณเรียบร้อยแล้ว</p>
                    <a href="calendar" class="btn btn-primary mt-3">กลับหน้าปฏิทิน</a>
                </div>
            <?php elseif ($error): ?>
                <div class="alert alert-danger text-center py-5">
                    <i class="bi bi-exclamation-triangle-fill display-1 text-danger mb-3"></i>
                    <h4><?= $error ?></h4>
                    <p>กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่</p>
                    <a href="calendar" class="btn btn-secondary mt-2">กลับ</a>
                </div>
            <?php else: ?>
                
                <div class="row gy-4">
                    <div class="col-lg-4">
                        <div class="card shadow-sm border-0 h-100 bg-light">
                            <div class="card-body">
                                <h5 class="card-title fw-bold text-primary mb-3">รายละเอียดรอบบริการ</h5>
                                <ul class="list-unstyled">
                                    <li class="mb-2">
                                        <i class="bi bi-calendar-event text-warning me-2"></i> 
                                        <strong>วันที่:</strong> <?= isset($calendar['date']) ? thaiDate($calendar['date']) : '-' ?>
                                    </li>
                                    <li class="mb-2">
                                        <i class="bi bi-geo-alt-fill text-danger me-2"></i> 
                                        <strong>สถานที่:</strong><br>
                                        <span class="ms-4 d-block text-muted small"><?= $fullAddress ?></span>
                                    </li>
                                    <li class="mb-2">
                                        <i class="bi bi-truck text-info me-2"></i> 
                                        <strong>รถโมบาย:</strong> เบอร์ <?= $calendar['bus']['busNumber'] ?? '-' ?>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-8">
                        <div class="card shadow border-0">
                            <div class="card-header bg-white py-3">
                                <h5 class="mb-0 fw-bold"><i class="bi bi-person-lines-fill me-2"></i> กรอกข้อมูลผู้จอง</h5>
                            </div>
                            <div class="card-body p-4">
                                <form method="POST" onsubmit="return validateForm()">
                                    
                                    <input type="hidden" name="serviceAreaId" value="1">
                                    <input type="hidden" name="factoryId" value="1">

                                    <div class="row g-3">
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

                                        <div class="col-md-12">
                                            <label class="form-label">เลขบัตรประชาชน (13 หลัก) <span class="text-danger">*</span></label>
                                            <input type="text" name="thaiNationalId" id="thaiNationalId" class="form-control" maxlength="13" required placeholder="กรอกเฉพาะตัวเลข">
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <label class="form-label">ชื่อ <span class="text-danger">*</span></label>
                                            <input type="text" name="firstName" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">นามสกุล <span class="text-danger">*</span></label>
                                            <input type="text" name="lastName" class="form-control" required>
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label">เบอร์โทรศัพท์ <span class="text-danger">*</span></label>
                                            <input type="tel" name="phoneNumber" class="form-control" required>
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label">รหัสแปลง (ถ้ามี)</label>
                                            <input type="text" name="landCode" class="form-control" placeholder="เช่น 10-1234">
                                        </div>

                                        <div class="col-12 mt-4">
                                            <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                                                ยืนยันการจอง
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
</main>

<script>
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

document.addEventListener('DOMContentLoaded', function() {
    const idInput = document.getElementById('thaiNationalId');
    const phoneInput = document.querySelector('input[name="phoneNumber"]');
    
    if (idInput) {
        idInput.addEventListener('input', function(e) {
            e.target.value = formatIDCard(e.target.value);
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }
});

function validateForm() {
    const idInput = document.getElementById('thaiNationalId');
    const phoneInput = document.querySelector('input[name="phoneNumber"]');
    
    // Validate length (cleaning first)
    const rawId = idInput.value.replace(/-/g, '');
    if(rawId.length !== 13 || isNaN(rawId)) {
        alert('กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง (เฉพาะตัวเลข)');
        return false;
    }

    if(!confirm('ยืนยันข้อมูลการจองใช่หรือไม่?')) {
        return false;
    }
    
    // Clean data before submit
    idInput.value = rawId;
    if (phoneInput) {
        phoneInput.value = phoneInput.value.replace(/-/g, '');
    }
    
    return true;
}
</script>

<?php include_once(COMPONENT_PATH . 'lib_footer.php'); ?>