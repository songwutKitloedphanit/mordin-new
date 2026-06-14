<?php
session_start();

$cPAGE['name'] = "จองวิเคราะห์ดิน";//"หน้าหลัก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/login";
$cPAGE['desc'] = "จองเพื่อรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

require_once(__DIR__ . '/../../../services/FarmerAPI.php');
$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $loginType = $_POST['loginType'] ?? 'farmer_id';
  $identifier = $_POST['identifier'] ?? '';
  $phone = $_POST['phone'] ?? '';

  $result = FarmerAPI::publicLogin($loginType, $identifier, $phone);

  // --- แก้ไข Logic การจัดการผลลัพธ์ ---
  if (isset($result['error'])) {
    // กรณีที่ 1: เชื่อมต่อ API ไม่ได้เลย (cURL error)
    $errorMessage = $result['error'];
  } elseif (isset($result['httpCode']) && $result['httpCode'] === 201) {
    // กรณีที่ 2: สำเร็จ (Backend ตอบกลับมาว่า 201 Created)
    $_SESSION['farmer_profile'] = $result['data'];
    header('Location: /services/book/farmer');
    exit;
  } else {
    // กรณีที่ 3: Backend ตอบกลับมาเป็น Error อื่นๆ (เช่น 400, 404)
    $errorMessage = $result['data']['message'] ?? 'ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
  }
}

include_once(COMPONENT_PATH . 'lib_header.php')
  ?>


<section id="about-us" class="section about-us">
  <div class="container">
    <div class="row gy-4" style="text-align: center;">
      <div class="col-lg-8 order-1 order-lg-2 mt-2" style="text-align: center; align-content: center;"
        data-aos="fade-up" data-aos-delay="100">
        <h3>เข้าสู่ระบบผลการวิเคราะห์ดิน</h3>

        <?php if ($errorMessage): ?>
          <div class="alert alert-danger my-3" role="alert">
            <?php echo htmlspecialchars($errorMessage); ?>
          </div>
        <?php endif; ?>

        <form action="<?= htmlspecialchars($_SERVER['REQUEST_URI']) ?>" method="post" data-aos="fade-up"
          data-aos-delay="200">
          <div class="row gy-4 mt-2">

            <div class="d-flex gap-2 justify-content-center">
              <input type="radio" name="loginType" value="farmer_id" onclick="changePlaceholder('หมายเลขเกษตรกร')"
                required checked>
              <label class="me-3">หมายเลขเกษตรกร</label>
              <input type="radio" name="loginType" value="thai_id" onclick="changePlaceholder('หมายเลขบัตรประชาชน')"
                required>
              <label>หมายเลขบัตรประชาชน</label>
            </div>

            <div class="col-md-12">
              <input type="text" class="form-control" id="identifier" name="identifier" placeholder="หมายเลขเกษตรกร"
                required>
            </div>

            <div class="col-md-12">
              <input type="text" class="form-control" name="phone" placeholder="หมายเลขโทรศัพท์" required>
            </div>

            <div class="col-md-12 text-center">
              <button type="submit" class="btn btn-success btn-lg text-white"
                style="width:300px;">ลงชื่อเข้าใช้ระบบ</button>
            </div>
          </div>
        </form>

        <hr>
        <div class="row mt-2">
          <div class="col-md-12" style="left: 25%;">
            <a href="services/book/register" class="btn btn-warning btn-lg text-white"
              style="width:300px;">สมัครเพื่อรับบริการ</a>
          </div>
        </div>
      </div>

      <?php include_once(COMPONENT_PATH . 'service.php') ?>
    </div>
  </div>
</section>

<script>
  function changePlaceholder(newPlaceholder) {
    document.getElementById("identifier").placeholder = newPlaceholder;
  }

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
    const identifierInput = document.getElementById('identifier');
    const phoneInput = document.querySelector('input[name="phone"]');
    const form = document.querySelector('form');

    if (identifierInput) {
        identifierInput.addEventListener('input', function(e) {
            const type = document.querySelector('input[name="loginType"]:checked').value;
            if (type === 'thai_id') {
                e.target.value = formatIDCard(e.target.value);
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            if (identifierInput) identifierInput.value = identifierInput.value.replace(/-/g, '');
            if (phoneInput) phoneInput.value = phoneInput.value.replace(/-/g, '');
        });
    }
  });
</script>

<?php include_once(COMPONENT_PATH . 'lib_footer.php') ?>