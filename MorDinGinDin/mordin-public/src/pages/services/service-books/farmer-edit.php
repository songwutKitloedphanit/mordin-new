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

require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../services/FactoryAPI.php');
require_once(__DIR__ . '/../../../services/ServiceAreaAPI.php');

$farmerId = $_SESSION['farmer_profile']['farmerId'];
$error = null;
$farmerData = null; 

// [!!] ดึงข้อมูลสำหรับ Dropdown โรงงาน
$factories = factoryAPI::getAllFactories()['data'] ?? [];
$serviceAreas = []; // [!!] เราจะดึงค่านี้หลังจากได้ $farmerData

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // --- 2A. Handle Form Submit (บันทึก) ---
    $updateData = [
        'firstName' => $_POST['firstName'],
        'lastName' => $_POST['lastName'],
        'phone' => $_POST['phone'],
        'thaiFarmerId' => $_POST['thaiFarmerId'] ?? null,
        'lineUserId' => $_POST['lineUserId'] ?? null,
        'factoryId' => (int)$_POST['factoryId'],
        'serviceAreaId' => (int)$_POST['serviceAreaId'],
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
        $farmerData['thaiNationalId'] = $_SESSION['farmer_profile']['thaiNationalIdMasked'] ?? 'N/A';
        // [!!] ถ้า error ต้องดึง Service Area
        // ของโรงงานที่เลือกผิดมาด้วย
        if(!empty($farmerData['factoryId'])) {
             $serviceAreas = serviceAreaAPI::getServiceAreasByFactory($farmerData['factoryId'])['data'] ?? [];
        }
    }

} else {
    // --- 2B. Handle Page Load (GET) ---
    $res = FarmerAPI::getFarmerById($farmerId);
    if ($res['success']) {
        $farmerData = $res['data'];
        // [!!]
        // เมื่อดึงข้อมูลเกษตรกรได้แล้ว
        // ค่อยดึงเขตส่งเสริมของโรงงานนั้นๆ
        if (!empty($farmerData['factoryId'])) {
            $serviceAreas = serviceAreaAPI::getServiceAreasByFactory($farmerData['factoryId'])['data'] ?? [];
        }
    } else {
        $error = "ไม่สามารถดึงข้อมูลได้: " . $res['message'];
    }
}

include_once(COMPONENT_PATH . 'lib_header.php');
?>

<main class="main">
  <div class="page-title">
    <div class="container">
      <nav class="breadcrumbs">
        <ol>
          <li><a href="/services/book/farmer">ข้อมูลเกษตรกร</a></li>
          <li class="current">แก้ไขข้อมูล</li>
        </ol>
      </nav>
      <h1>แก้ไขข้อมูลส่วนตัว</h1>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 offset-lg-3">
          
          <?php if ($error): ?>
            <div class="alert alert-danger">
              <?= htmlspecialchars($error) ?>
            </div>
          <?php endif; ?>

          <?php if ($farmerData): ?>
            <div class="card shadow border-0">
              <div class="card-body p-4">
                <form method="POST">
                  <div class="row g-3">
                    
                    <div class="col-md-6">
                      <label class="form-label">ชื่อจริง <span class="text-danger">*</span></label>
                      <input type="text" name="firstName" class="form-control" required 
                             value="<?= htmlspecialchars($farmerData['firstName'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">นามสกุล <span class="text-danger">*</span></label>
                      <input type="text" name="lastName" class="form-control" required
                             value="<?= htmlspecialchars($farmerData['lastName'] ?? '') ?>">
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">เบอร์โทรศัพท์ <span class="text-danger">*</span></label>
                      <input type="text" name="phone" class="form-control" required maxlength="10"
                             value="<?= htmlspecialchars($farmerData['phone'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">เลขบัตรประชาชน</label>
                      <input type="text" class="form-control" 
                             value="<?= htmlspecialchars($farmerData['thaiNationalId'] ?? '') ?>" 
                             disabled readonly>
                      <small class="text-muted">(ไม่สามารถแก้ไขได้)</small>
                    </div>

                    <hr class="my-2">
                    
                    <div class="col-md-6">
                      <label class="form-label">โรงงาน <span class="text-danger">*</span></label>
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
                      <label class="form-label">เขตส่งเสริม <span class="text-danger">*</span></label>
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
                      <label class="form-label">รหัสเกษตรกร (ถ้ามี)</label>
                      <input type="text" name="thaiFarmerId" class="form-control"
                             value="<?= htmlspecialchars($farmerData['thaiFarmerId'] ?? '') ?>">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Line User ID (ถ้ามี)</label>
                      <input type="text" name="lineUserId" class="form-control"
                             value="<?= htmlspecialchars($farmerData['lineUserId'] ?? '') ?>">
                    </div>
                    
                    <div class="col-12 mt-4">
                      <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                        บันทึกการเปลี่ยนแปลง
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

<?php include_once(COMPONENT_PATH . 'lib_footer.php'); ?>