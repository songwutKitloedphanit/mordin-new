<?php
session_start();

if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

$cPAGE['name'] = "แก้ไขข้อมูลส่วนตัว";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/farmer";
$cPAGE['desc'] = "แก้ไขข้อมูลส่วนตัวเกษตรกร";

require_once __DIR__ . '/../../../services/FarmerAPI.php';
require_once __DIR__ . '/../../../services/FactoryAPI.php';
require_once __DIR__ . '/../../../services/ServiceAreaAPI.php';

$farmerId = $_SESSION['farmer_profile']['farmerId'];
$error = null;
$farmerData = null;

// [!!] ดึงข้อมูลสำหรับ Dropdown โรงงาน
$factories = factoryAPI::getAllFactories()['data'] ?? [];
$serviceAreas = []; // [!!] เราจะดึงค่านี้หลังจากได้ $farmerData

$birthDay = '';
$birthMonth = '';
$birthYear = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $birthDay = $_POST['birthDay'] ?? '';
    $birthMonth = $_POST['birthMonth'] ?? '';
    $birthYear = $_POST['birthYear'] ?? '';

    $birthDate = null;
    if ($birthDay && $birthMonth && $birthYear) {
        $birthYearAD = intval($birthYear) - 543;
        $birthDate = sprintf("%04d-%02d-%02d", $birthYearAD, intval($birthMonth), intval($birthDay));
    }

    $updateData = [
        'firstName' => $_POST['firstName'],
        'lastName' => $_POST['lastName'],
        'phone' => $_POST['phone'],
        'thaiFarmerId' => $_POST['thaiFarmerId'] ?? null,
        'lineUserId' => $_POST['lineUserId'] ?? null,
        'factoryId' => (int)$_POST['factoryId'],
        'serviceAreaId' => (int)$_POST['serviceAreaId'],
        'birthDate' => $birthDate,
    ];

    $res = FarmerAPI::updateFarmer($farmerId, $updateData);

    if ($res['success']) {
        $_SESSION['farmer_profile']['firstName'] = $updateData['firstName'];
        $_SESSION['farmer_profile']['lastName'] = $updateData['lastName'];
        $_SESSION['farmer_profile']['phone'] = $updateData['phone'];

        $_SESSION['booking_success'] = "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว";
        header('Location: /services/book/farmer');
        exit;
    } else {
        $error = "อัปเดตล้มเหลว: " . $res['message'];
        $farmerData = $_POST;
        if(!empty($farmerData['factoryId'])) {
             $serviceAreas = serviceAreaAPI::getServiceAreasByFactory($farmerData['factoryId'])['data'] ?? [];
        }
    }

} else {
    $res = FarmerAPI::getFarmerById($farmerId);
    if ($res['success']) {
        $farmerData = $res['data'];
        if (!empty($farmerData['factoryId'])) {
            $serviceAreas = serviceAreaAPI::getServiceAreasByFactory($farmerData['factoryId'])['data'] ?? [];
        }
        
        if (!empty($farmerData['birthDate'])) {
            $parts = explode('-', $farmerData['birthDate']);
            if (count($parts) === 3) {
                $birthDay = intval($parts[2]);
                $birthMonth = intval($parts[1]);
                $birthYear = intval($parts[0]) + 543;
            }
        }
    } else {
        $error = "ไม่สามารถดึงข้อมูลได้: " . $res['message'];
    }
}

include_once COMPONENT_PATH . 'lib_header.php';
?>

  <section class="section">
    <div class="container">
      <div class="public-back-bar">
        <button type="button" class="public-back-button" onclick="history.back()">
          <i class="bi bi-arrow-left" aria-hidden="true"></i> ย้อนกลับ
        </button>
      </div>
      <div class="row">
        <div class="col-lg-6 offset-lg-3">

          <?php if ($error): ?>
            <div class="alert alert-danger">
              <?= htmlspecialchars($error) ?>
            </div>
          <?php endif; ?>

          <?php if ($farmerData): ?>
            <div class="public-booking-form-card">
              <div class="public-booking-form-header">
                <h3><i class="bi bi-person-fill me-2"></i>แก้ไขรายละเอียดสมาชิก</h3>
              </div>
              <div class="public-booking-form-body">
                <form method="POST">
                  <div class="row g-3">

                    <div class="col-md-6">
                      <label for="farmerEditFirstName" class="form-label">ชื่อจริง <span class="text-danger">*</span></label>
                      <input id="farmerEditFirstName" type="text" name="firstName" class="form-control" required
                             value="<?= htmlspecialchars($farmerData['firstName'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                      <label for="farmerEditLastName" class="form-label">นามสกุล <span class="text-danger">*</span></label>
                      <input id="farmerEditLastName" type="text" name="lastName" class="form-control" required
                             value="<?= htmlspecialchars($farmerData['lastName'] ?? '') ?>">
                    </div>

                    <div class="col-md-6">
                      <label for="farmerEditPhone" class="form-label">เบอร์โทรศัพท์ <span class="text-danger">*</span></label>
                      <input id="farmerEditPhone" type="text" name="phone" class="form-control" required maxlength="12"
                             value="<?= htmlspecialchars($farmerData['phone'] ?? '') ?>">
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">วันเดือนปีเกิด <span class="text-danger">*</span></label>
                      <div class="row g-2">
                        <div class="col-4">
                          <select class="form-select" name="birthDay" required>
                            <option value="" disabled <?= $birthDay === '' ? 'selected' : '' ?>>วัน</option>
                            <?php for ($d = 1; $d <= 31; $d++): ?>
                              <option value="<?= $d ?>" <?= $birthDay == $d ? 'selected' : '' ?>><?= $d ?></option>
                            <?php endfor; ?>
                          </select>
                        </div>
                        <div class="col-4">
                          <select class="form-select" name="birthMonth" required>
                            <option value="" disabled <?= $birthMonth === '' ? 'selected' : '' ?>>เดือน</option>
                            <?php
                            $months = [
                              1 => 'ม.ค.', 2 => 'ก.พ.', 3 => 'มี.ค.', 4 => 'เม.ย.',
                              5 => 'พ.ค.', 6 => 'มิ.ย.', 7 => 'ก.ค.', 8 => 'ส.ค.',
                              9 => 'ก.ย.', 10 => 'ต.ค.', 11 => 'พ.ย.', 12 => 'ธ.ค.'
                            ];
                            foreach ($months as $m => $name): ?>
                              <option value="<?= $m ?>" <?= $birthMonth == $m ? 'selected' : '' ?>><?= $name ?></option>
                            <?php endforeach; ?>
                          </select>
                        </div>
                        <div class="col-4">
                          <select class="form-select" name="birthYear" required>
                            <option value="" disabled <?= $birthYear === '' ? 'selected' : '' ?>>ปี พ.ศ.</option>
                            <?php
                            $currentYearBE = date('Y') + 543;
                            for ($y = $currentYearBE - 100; $y <= $currentYearBE; $y++): ?>
                              <option value="<?= $y ?>" <?= $birthYear == $y ? 'selected' : '' ?>><?= $y ?></option>
                            <?php endfor; ?>
                          </select>
                        </div>
                      </div>
                    </div>

                    <hr class="my-2">

                    <div class="col-md-6">
                      <label for="factorySelect" class="form-label">โรงงาน <span class="text-danger">*</span></label>
                      <select name="factoryId" id="factorySelect" class="form-select" required>
                          <option value="" disabled>-- เลือกโรงงาน --</option>
                          <?php foreach ($factories as $factory): ?>
                              <option value="<?= $factory['factoryId'] ?>"
                                <?= ($farmerData['factoryId'] ?? 0) == $factory['factoryId'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($factory['name']) ?>
                              </option>
                          <?php endforeach; ?>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label for="serviceAreaSelect" class="form-label">เขตส่งเสริม <span class="text-danger">*</span></label>
                      <select name="serviceAreaId" id="serviceAreaSelect" class="form-select" required>
                          <option value="" disabled>-- เลือกเขตส่งเสริม --</option>
                          <?php foreach ($serviceAreas as $area): ?>
                               <option value="<?= $area['serviceAreaId'] ?>"
                                <?= ($farmerData['serviceAreaId'] ?? 0) == $area['serviceAreaId'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($area['name']) ?>
                              </option>
                          <?php endforeach; ?>
                      </select>
                    </div>

                    <div class="col-md-6">
                      <label for="farmerEditThaiFarmerId" class="form-label">รหัสเกษตรกร (ถ้ามี)</label>
                      <input id="farmerEditThaiFarmerId" type="text" name="thaiFarmerId" class="form-control"
                             value="<?= htmlspecialchars($farmerData['thaiFarmerId'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                      <label for="farmerEditLineUserId" class="form-label">Line User ID (ถ้ามี)</label>
                      <input id="farmerEditLineUserId" type="text" name="lineUserId" class="form-control"
                             value="<?= htmlspecialchars($farmerData['lineUserId'] ?? '') ?>">
                    </div>

                    <div class="col-12 mt-4">
                      <button type="submit" class="btn btn-primary w-100 public-booking-submit">
                        <i class="bi bi-check-circle-fill me-1"></i> บันทึกการเปลี่ยนแปลง
                      </button>
                    </div>
                  </div>
                </form>
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
    const form = document.querySelector('form');

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
        // Format existing value on load
        phoneInput.value = formatPhoneNumber(phoneInput.value);

        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            if (phoneInput) phoneInput.value = phoneInput.value.replace(/-/g, '');
        });
    }

    factorySelect.addEventListener('change', async function() {
        const factoryId = this.value;

        serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- กำลังโหลด... --</option>';
        serviceAreaSelect.disabled = true;

        if (!factoryId) {
            serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- กรุณาเลือกโรงงานก่อน --</option>';
            return;
        }

        try {
            const response = await fetch(`/api/service-areas/by-factory/${factoryId}`);
            if (!response.ok) throw new Error('Failed to fetch service areas');

            const serviceAreas = await response.json();

            serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- เลือกเขตส่งเสริม --</option>';

            if (serviceAreas.length === 0) {
                 serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- ไม่พบเขตส่งเสริม --</option>';
                 return;
            }

            serviceAreas.forEach(area => {
                const option = new Option(area.name, area.serviceAreaId);
                serviceAreaSelect.add(option);
            });

            serviceAreaSelect.disabled = false;

        } catch (err) {
            console.error(err);
            serviceAreaSelect.innerHTML = '<option value="" disabled selected>-- โหลดล้มเหลว --</option>';
        }
    });
});
</script>

<?php include_once COMPONENT_PATH . 'lib_footer.php'; ?>
