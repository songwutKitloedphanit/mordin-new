<?php
session_start();

$cPAGE['name'] = "สมัครรับบริการ";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/login";
$cPAGE['desc'] = "สมัครสมาชิกเพื่อใช้บริการจองคิว";

require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../services/FactoryAPI.php');
require_once(__DIR__ . '/../../../services/ServiceAreaAPI.php');

$error = null;
$success = null;

// [!!] ดึงข้อมูลเฉพาะโรงงาน
$factories = factoryAPI::getAllFactories()['data'] ?? [];
// [!!] ลบ $serviceAreas
// ออกจากตรงนี้

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $phone = preg_replace('/\D+/', '', $_POST['phone'] ?? '');
    $thaiNationalId = preg_replace('/\D+/', '', $_POST['thaiNationalId'] ?? '');
    $thaiFarmerId = trim($_POST['thaiFarmerId'] ?? '');
    $lineUserId = trim($_POST['lineUserId'] ?? '');

    $data = [
        'firstName' => trim($_POST['firstName'] ?? ''),
        'lastName' => trim($_POST['lastName'] ?? ''),
        'phone' => $phone,
        'thaiNationalId' => $thaiNationalId !== '' ? $thaiNationalId : null,
        'thaiFarmerId' => $thaiFarmerId !== '' ? $thaiFarmerId : null,
        'lineUserId' => $lineUserId !== '' ? $lineUserId : null,
        'factoryId' => (int)$_POST['factoryId'],
        'serviceAreaId' => (int)$_POST['serviceAreaId'],
    ];

    $res = FarmerAPI::registerFarmer($data);

    if ($res['success']) {
        $success = "สมัครรับบริการสำเร็จ! คุณสามารถใช้เบอร์โทรและเลขบัตรประชาชนเพื่อเข้าสู่ระบบได้เลย";
    } else {
        $error = "สมัครล้มเหลว: " . $res['message'];
    }
}

include_once(COMPONENT_PATH . 'lib_header.php');
?>

<main class="main">
  <div class="page-title">
    <div class="container">
      <nav class="breadcrumbs">
        <ol>
          <li><a href="/services/book/login">เข้าสู่ระบบ</a></li>
          <li class="current">สมัครรับบริการ</li>
        </ol>
      </nav>
      <h1>สมัครรับบริการ</h1>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 offset-lg-3">

          <?php if ($success): ?>
            <div class="alert alert-success text-center">
              <?= htmlspecialchars($success) ?><br>
              <a href="/services/book/login" class="btn btn-primary mt-2">ไปหน้าเข้าสู่ระบบ</a>
            </div>
          <?php else: ?>
            
            <?php if ($error): ?>
              <div class="alert alert-danger">
                <?= htmlspecialchars($error) ?>
              </div>
            <?php endif; ?>

            <div class="card shadow border-0">
              <div class="card-body p-4">
                <form method="POST">
                  <div class="row g-3">
                    
                    <div class="col-md-6">
                      <label class="form-label">ชื่อจริง <span class="text-danger">*</span></label>
                      <input type="text" name="firstName" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">นามสกุล <span class="text-danger">*</span></label>
                      <input type="text" name="lastName" class="form-control" required>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">เบอร์โทรศัพท์ (ใช้เข้าระบบ) <span class="text-danger">*</span></label>
                      <input type="text" name="phone" class="form-control" required maxlength="12" inputmode="numeric">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">เลขบัตรประชาชน (13 หลัก) (ใช้เข้าระบบ)</label>
                      <input type="text" name="thaiNationalId" class="form-control" maxlength="17" inputmode="numeric">
                    </div>
                    
                    <hr class="my-2">

                    <div class="col-md-6">
                      <label class="form-label">โรงงาน <span class="text-danger">*</span></label>
                      <select name="factoryId" id="factorySelect" class="form-select" required>
                          <option value="" disabled selected>-- เลือกโรงงาน --</option>
                          <?php foreach ($factories as $factory): ?>
                              <option value="<?= $factory['factoryId'] ?>"><?= htmlspecialchars($factory['name']) ?></option>
                          <?php endforeach; ?>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">เขตส่งเสริม <span class="text-danger">*</span></label>
                      <select name="serviceAreaId" id="serviceAreaSelect" class="form-select" required disabled>
                          <option value="" disabled selected>-- กรุณาเลือกโรงงานก่อน --</option>
                          </select>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">รหัสเกษตรกร (ถ้ามี)</label>
                      <input type="text" name="thaiFarmerId" class="form-control">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Line User ID (ถ้ามี)</label>
                      <input type="text" name="lineUserId" class="form-control">
                    </div>


                    <div class="col-12 mt-4">
                      <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                        ยืนยันการสมัคร
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
</main>

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

<?php include_once(COMPONENT_PATH . 'lib_footer.php'); ?>
