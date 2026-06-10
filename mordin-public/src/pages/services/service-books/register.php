<?php
session_start();

$cPAGE['name'] = "";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/login";
$cPAGE['desc'] = "สมัครสมาชิกเพื่อใช้บริการจองคิว";

require_once __DIR__ . '/../../../services/FarmerAPI.php';
require_once __DIR__ . '/../../../services/FactoryAPI.php';
require_once __DIR__ . '/../../../services/ServiceAreaAPI.php';

$error = null;
$success = null;
$formData = [
    'firstName' => '',
    'lastName' => '',
    'phone' => '',
    'thaiNationalId' => '',
    'factoryId' => '',
    'serviceAreaId' => '',
    'thaiFarmerId' => '',
    'lineUserId' => '',
    'birthDay' => '',
    'birthMonth' => '',
    'birthYear' => '',
];
$serviceAreasForSelectedFactory = [];

$factories = factoryAPI::getAllFactories()['data'] ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $phone = preg_replace('/\D+/', '', $_POST['phone'] ?? '');
    $thaiNationalId = preg_replace('/\D+/', '', $_POST['thaiNationalId'] ?? '');
    $thaiFarmerId = trim($_POST['thaiFarmerId'] ?? '');
    $lineUserId = trim($_POST['lineUserId'] ?? '');
    $factoryId = filter_var($_POST['factoryId'] ?? null, FILTER_VALIDATE_INT);
    $serviceAreaId = filter_var($_POST['serviceAreaId'] ?? null, FILTER_VALIDATE_INT);

    $birthDay = $_POST['birthDay'] ?? '';
    $birthMonth = $_POST['birthMonth'] ?? '';
    $birthYear = $_POST['birthYear'] ?? '';

    $birthDate = null;
    if ($birthDay && $birthMonth && $birthYear) {
        $birthYearAD = intval($birthYear) - 543;
        $birthDate = sprintf("%04d-%02d-%02d", $birthYearAD, intval($birthMonth), intval($birthDay));
    }

    $formData = [
        'firstName' => trim($_POST['firstName'] ?? ''),
        'lastName' => trim($_POST['lastName'] ?? ''),
        'phone' => $phone,
        'thaiNationalId' => $thaiNationalId,
        'factoryId' => $factoryId ?: '',
        'serviceAreaId' => $serviceAreaId ?: '',
        'thaiFarmerId' => $thaiFarmerId,
        'lineUserId' => $lineUserId,
        'birthDay' => $birthDay,
        'birthMonth' => $birthMonth,
        'birthYear' => $birthYear,
    ];

    if ($factoryId) {
        $serviceAreasForSelectedFactory = serviceAreaAPI::getServiceAreasByFactory($factoryId)['data'] ?? [];
    }

    $validationErrors = [];

    if ($formData['firstName'] === '') {
        $validationErrors[] = 'กรุณากรอกชื่อจริง';
    }

    if ($formData['lastName'] === '') {
        $validationErrors[] = 'กรุณากรอกนามสกุล';
    }

    if (!preg_match('/^[0-9]{10}$/', $phone)) {
        $validationErrors[] = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    }

    if ($thaiNationalId !== '' && !preg_match('/^[0-9]{13}$/', $thaiNationalId)) {
        $validationErrors[] = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }

    if (!$birthDay || !$birthMonth || !$birthYear) {
        $validationErrors[] = 'กรุณากรอกวันเดือนปีเกิด';
    }

    if (!$factoryId || $factoryId <= 0) {
        $validationErrors[] = 'กรุณาเลือกโรงงาน';
    }

    if (!$serviceAreaId || $serviceAreaId <= 0) {
        $validationErrors[] = 'กรุณาเลือกเขตส่งเสริม';
    }

    $data = [
        'firstName' => $formData['firstName'],
        'lastName' => $formData['lastName'],
        'phone' => $phone,
        'thaiNationalId' => $thaiNationalId !== '' ? $thaiNationalId : null,
        'thaiFarmerId' => $thaiFarmerId !== '' ? $thaiFarmerId : null,
        'lineUserId' => $lineUserId !== '' ? $lineUserId : null,
        'factoryId' => (int)$factoryId,
        'serviceAreaId' => (int)$serviceAreaId,
        'birthDate' => $birthDate,
    ];

    if ($validationErrors) {
        $error = implode(' / ', $validationErrors);
    } else {
        $res = FarmerAPI::registerFarmer($data);

        if ($res['success']) {
            $success = "สมัครรับบริการสำเร็จ! คุณสามารถใช้เบอร์โทรและวันเดือนปีเกิดเพื่อเข้าสู่ระบบได้เลย";
        } else {
            $error = "สมัครล้มเหลว: " . $res['message'];
        }
    }
}

include_once COMPONENT_PATH . 'lib_header.php';
?>

<section class="section public-login-page" style="align-items:flex-start;padding-top:40px;padding-bottom:56px;">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-xl-6 col-lg-8 col-md-10" data-aos="fade-up">

        <?php if ($success): ?>
          <div class="public-login-card text-center">
            <div class="public-login-card-header">
              <div class="public-login-card-icon">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <h4>สมัครสำเร็จ!</h4>
              <p class="mb-0" style="color:rgba(255,255,255,0.8);font-size:0.9rem">ท่านสามารถเข้าสู่ระบบได้เลย</p>
            </div>
            <div class="public-login-card-body">
              <div class="alert alert-success d-flex align-items-start gap-2 text-start">
                <i class="bi bi-info-circle-fill flex-shrink-0 mt-1"></i>
                <span><?= htmlspecialchars($success) ?></span>
              </div>
              <a href="/services/book/login" class="btn btn-primary w-100 text-white mt-2">
                <i class="bi bi-box-arrow-in-right"></i> ไปหน้าเข้าสู่ระบบ
              </a>
            </div>
          </div>

        <?php else: ?>

          <div class="public-login-card">
            <div class="public-login-card-header">
              <div class="public-login-card-icon">
                <i class="bi bi-person-plus-fill"></i>
              </div>
              <h4>สมัครรับบริการ</h4>
              <p class="mb-0" style="color:rgba(255,255,255,0.8);font-size:0.9rem">กรอกข้อมูลเพื่อลงทะเบียนใช้งานระบบ</p>
            </div>

            <div class="public-login-card-body">

              <?php if ($error): ?>
                <div class="alert alert-danger d-flex align-items-start gap-2 mb-4" role="alert">
                  <i class="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
                  <span><?= htmlspecialchars($error) ?></span>
                </div>
              <?php endif; ?>

              <form method="POST">
                <p class="public-register-section-label">ข้อมูลส่วนตัว</p>
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label for="registerFirstName" class="form-label">ชื่อจริง <span class="text-danger">*</span></label>
                    <input id="registerFirstName" type="text" name="firstName" class="form-control" required
                      placeholder="กรอกชื่อจริง"
                      value="<?= htmlspecialchars($formData['firstName']) ?>">
                  </div>
                  <div class="col-sm-6">
                    <label for="registerLastName" class="form-label">นามสกุล <span class="text-danger">*</span></label>
                    <input id="registerLastName" type="text" name="lastName" class="form-control" required
                      placeholder="กรอกนามสกุล"
                      value="<?= htmlspecialchars($formData['lastName']) ?>">
                  </div>
                </div>

                <p class="public-register-section-label">ข้อมูลสำหรับเข้าสู่ระบบ</p>
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label for="registerPhone" class="form-label">เบอร์โทรศัพท์ (ชื่อผู้ใช้) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
                      <input id="registerPhone" type="text" name="phone" class="form-control" required
                        maxlength="12" inputmode="numeric" placeholder="0XX-XXX-XXXX"
                        value="<?= htmlspecialchars($formData['phone']) ?>">
                    </div>
                    <div class="form-text">ใช้เป็นชื่อผู้ใช้ในการเข้าสู่ระบบ</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label">วันเดือนปีเกิด (รหัสผ่าน) <span class="text-danger">*</span></label>
                    <div class="row g-2">
                      <div class="col-4">
                        <select class="form-select" name="birthDay" required>
                          <option value="" disabled selected>วัน</option>
                          <?php for ($d = 1; $d <= 31; $d++): ?>
                            <option value="<?= $d ?>" <?= $formData['birthDay'] == $d ? 'selected' : '' ?>><?= $d ?></option>
                          <?php endfor; ?>
                        </select>
                      </div>
                      <div class="col-4">
                        <select class="form-select" name="birthMonth" required>
                          <option value="" disabled selected>เดือน</option>
                          <?php
                          $months = [
                            1 => 'ม.ค.', 2 => 'ก.พ.', 3 => 'มี.ค.', 4 => 'เม.ย.',
                            5 => 'พ.ค.', 6 => 'มิ.ย.', 7 => 'ก.ค.', 8 => 'ส.ค.',
                            9 => 'ก.ย.', 10 => 'ต.ค.', 11 => 'พ.ย.', 12 => 'ธ.ค.'
                          ];
                          foreach ($months as $m => $name): ?>
                            <option value="<?= $m ?>" <?= $formData['birthMonth'] == $m ? 'selected' : '' ?>><?= $name ?></option>
                          <?php endforeach; ?>
                        </select>
                      </div>
                      <div class="col-4">
                        <select class="form-select" name="birthYear" required>
                          <option value="" disabled selected>ปี พ.ศ.</option>
                          <?php
                          $currentYearBE = date('Y') + 543;
                          for ($y = $currentYearBE - 100; $y <= $currentYearBE; $y++): ?>
                            <option value="<?= $y ?>" <?= $formData['birthYear'] == $y ? 'selected' : '' ?>><?= $y ?></option>
                          <?php endfor; ?>
                        </select>
                      </div>
                    </div>
                    <div class="form-text">ใช้เป็นรหัสผ่านในการเข้าสู่ระบบ</div>
                  </div>
                </div>

                <p class="public-register-section-label">ข้อมูลระบุตัวตนเพิ่มเติม</p>
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label for="registerThaiNationalId" class="form-label">เลขบัตรประชาชน</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-card-text"></i></span>
                      <input id="registerThaiNationalId" type="text" name="thaiNationalId" class="form-control"
                        maxlength="17" inputmode="numeric" placeholder="X-XXXX-XXXXX-XX-X"
                        value="<?= htmlspecialchars($formData['thaiNationalId']) ?>">
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <label for="registerThaiFarmerId" class="form-label">รหัสเกษตรกร</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person-badge"></i></span>
                      <input id="registerThaiFarmerId" type="text" name="thaiFarmerId" class="form-control"
                        placeholder="กรอกรหัสเกษตรกร"
                        value="<?= htmlspecialchars($formData['thaiFarmerId']) ?>">
                    </div>
                  </div>
                </div>

                <p class="public-register-section-label">เขตส่งเสริม</p>
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label for="factorySelect" class="form-label">โรงงาน <span class="text-danger">*</span></label>
                    <select name="factoryId" id="factorySelect" class="form-select" required>
                      <option value="" disabled <?= $formData['factoryId'] === '' ? 'selected' : '' ?>>-- เลือกโรงงาน --</option>
                      <?php foreach ($factories as $factory): ?>
                        <option value="<?= $factory['factoryId'] ?>"
                          <?= (string)$formData['factoryId'] === (string)$factory['factoryId'] ? 'selected' : '' ?>>
                          <?= htmlspecialchars($factory['name']) ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                  </div>
                  <div class="col-sm-6">
                    <label for="serviceAreaSelect" class="form-label">เขตส่งเสริม <span class="text-danger">*</span></label>
                    <select name="serviceAreaId" id="serviceAreaSelect" class="form-select" required
                      <?= empty($serviceAreasForSelectedFactory) ? 'disabled' : '' ?>>
                      <option value="" disabled <?= $formData['serviceAreaId'] === '' ? 'selected' : '' ?>>
                        <?= $formData['factoryId'] === '' ? '-- กรุณาเลือกโรงงานก่อน --' : '-- เลือกเขตส่งเสริม --' ?>
                      </option>
                      <?php foreach ($serviceAreasForSelectedFactory as $area): ?>
                        <option value="<?= $area['serviceAreaId'] ?>"
                          <?= (string)$formData['serviceAreaId'] === (string)$area['serviceAreaId'] ? 'selected' : '' ?>>
                          <?= htmlspecialchars($area['name']) ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                  </div>
                </div>

                <p class="public-register-section-label">ข้อมูลเพิ่มเติม <span class="text-muted fw-normal">(ไม่บังคับ)</span></p>
                <div class="row g-3 mb-4">
                  <div class="col-sm-12">
                    <label for="registerLineUserId" class="form-label">Line User ID</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-chat-dots"></i></span>
                      <input id="registerLineUserId" type="text" name="lineUserId" class="form-control"
                        placeholder="กรอก Line User ID (ถ้ามี)"
                        value="<?= htmlspecialchars($formData['lineUserId']) ?>">
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 text-white btn-lg">
                  <i class="bi bi-person-check-fill"></i> ยืนยันการสมัคร
                </button>
              </form>

              <div class="public-login-divider"><span>มีบัญชีอยู่แล้ว?</span></div>
              <a href="services/book/login" class="public-login-register-link">
                <i class="bi bi-box-arrow-in-right"></i> กลับไปหน้าเข้าสู่ระบบ
              </a>

            </div>
          </div>

        <?php endif; ?>
      </div>
    </div>
  </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const factorySelect = document.getElementById('factorySelect');
    const serviceAreaSelect = document.getElementById('serviceAreaSelect');
    const phoneInput = document.querySelector('input[name="phone"]');
    const idInput = document.querySelector('input[name="thaiNationalId"]');
    const form = document.querySelector('form');

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

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    if (idInput) {
        idInput.addEventListener('input', function(e) {
            e.target.value = formatIDCard(e.target.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            if (phoneInput) phoneInput.value = phoneInput.value.replace(/-/g, '');
            if (idInput) idInput.value = idInput.value.replace(/-/g, '');
        });
    }

    factorySelect.addEventListener('change', async function() {
        const factoryId = this.value;

        // เคลียร์และปิดใช้งาน service area dropdown
        serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- กำลังโหลด... --</option>';
        serviceAreaSelect.disabled = true;

        if (!factoryId) {
            serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- กรุณาเลือกโรงงานก่อน --</option>';
            return;
        }

        try {
            // เรียก API ที่เราสร้างใน routes.php
            const response = await fetch(`/api/service-areas/by-factory/${factoryId}`);
            if (!response.ok) throw new Error('Failed to fetch service areas');

            const serviceAreas = await response.json();

            // เคลียร์อีกครั้ง
            serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- เลือกเขตส่งเสริม --</option>';

            if (serviceAreas.length === 0) {
                 serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- ไม่พบเขตส่งเสริม --</option>';
                 return;
            }

            // เติม options
            serviceAreas.forEach(area => {
                const option = new Option(area.name, area.serviceAreaId);
                serviceAreaSelect.add(option);
            });

            // เปิดใช้งาน dropdown
            serviceAreaSelect.disabled = false;

        } catch (err) {
            console.error(err);
            serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- โหลดล้มเหลว --</option>';
        }
    });
});
</script>

<?php include_once COMPONENT_PATH . 'lib_footer.php'; ?>
