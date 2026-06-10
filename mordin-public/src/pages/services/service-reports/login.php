<?php
  session_start();

  $cPAGE['name']  = "ผลการวิเคราะห์ดิน";
  $cPAGE['alias'] = "service";
  $cPAGE['link']  = "/services/report/login";
  $cPAGE['desc']  = "เข้าสู่ระบบเพื่อดูผลการวิเคราะห์ดินสำหรับเกษตรกร";

  require_once __DIR__ . '/../../../services/FarmerAPI.php';
  $errorMessage = '';

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      $phone = preg_replace('/\D/', '', $_POST['phone'] ?? '');
      
      $birthDay = $_POST['birthDay'] ?? '';
      $birthMonth = $_POST['birthMonth'] ?? '';
      $birthYear = $_POST['birthYear'] ?? '';
      
      $birthYearAD = intval($birthYear) - 543;
      $birthDate = sprintf("%04d-%02d-%02d", $birthYearAD, intval($birthMonth), intval($birthDay));

      $result = FarmerAPI::publicLogin($phone, $birthDate);

      if (isset($result['error'])) {
          $errorMessage = $result['error'];
      } elseif (isset($result['httpCode']) && ($result['httpCode'] === 200 || $result['httpCode'] === 201)) {
          session_regenerate_id(true);
          $_SESSION['farmer_profile'] = $result['data'];
          $_SESSION['report_auth'] = [
              'login_type' => 'phone_dob',
              'identifier' => $phone,
              'phone' => $phone,
              'login_time' => date('Y-m-d H:i:s')
          ];
          header('Location: /services/report/land');
          exit;
      } else {
          $errorMessage = $result['data']['message'] ?? 'ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      }
  }

  include_once COMPONENT_PATH . 'lib_header.php';
?>

<section class="section public-login-page">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-xl-4 col-lg-5 col-md-7 col-sm-10" data-aos="fade-up">

        <div class="public-login-card">

          <div class="public-login-card-header">
            <div class="public-login-card-icon">
              <i class="bi bi-bar-chart-line-fill"></i>
            </div>
            <h4>เข้าสู่ระบบ</h4>
            <p>ดูผลการวิเคราะห์ดินของท่าน</p>
          </div>

          <div class="public-login-card-body">

            <?php if ($errorMessage): ?>
              <div class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                <span><?= htmlspecialchars($errorMessage) ?></span>
              </div>
            <?php endif; ?>

             <form action="<?= htmlspecialchars($_SERVER['REQUEST_URI']) ?>" method="post" id="loginForm">

               <div class="mb-3">
                 <label for="phone_input" class="form-label">หมายเลขโทรศัพท์ (ชื่อผู้ใช้)</label>
                 <div class="input-group">
                   <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
                   <input type="text" class="form-control" id="phone_input" name="phone"
                     placeholder="กรอกหมายเลขโทรศัพท์ 10 หลัก" maxlength="12" required
                     value="<?= isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : '' ?>">
                 </div>
               </div>

               <div class="mb-4">
                 <label class="form-label">วันเดือนปีเกิด (รหัสผ่าน)</label>
                 <div class="row g-2">
                   <div class="col-4">
                     <select class="form-select" name="birthDay" required>
                       <option value="" disabled selected>วัน</option>
                       <?php for ($d = 1; $d <= 31; $d++): ?>
                         <option value="<?= $d ?>" <?= (isset($_POST['birthDay']) && $_POST['birthDay'] == $d) ? 'selected' : '' ?>><?= $d ?></option>
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
                         <option value="<?= $m ?>" <?= (isset($_POST['birthMonth']) && $_POST['birthMonth'] == $m) ? 'selected' : '' ?>><?= $name ?></option>
                       <?php endforeach; ?>
                     </select>
                   </div>
                   <div class="col-4">
                     <select class="form-select" name="birthYear" required>
                       <option value="" disabled selected>ปี พ.ศ.</option>
                       <?php
                       $currentYearBE = date('Y') + 543;
                       for ($y = $currentYearBE - 100; $y <= $currentYearBE; $y++): ?>
                         <option value="<?= $y ?>" <?= (isset($_POST['birthYear']) && $_POST['birthYear'] == $y) ? 'selected' : '' ?>><?= $y ?></option>
                       <?php endfor; ?>
                     </select>
                   </div>
                 </div>
               </div>

               <button type="submit" class="btn btn-primary w-100 text-white btn-lg">
                 <i class="bi bi-box-arrow-in-right"></i> เข้าสู่ระบบ
               </button>

             </form>

             <div class="public-login-divider"><span>ยังไม่ได้ลงทะเบียน?</span></div>

             <a href="services/book/register" class="public-login-register-link">
               <i class="bi bi-person-plus"></i> ยังไม่มีบัญชี? สมัครที่นี่
             </a>

             <div class="text-center mt-3">
               <a href="" class="text-muted small">
                 <i class="bi bi-arrow-left me-1"></i>กลับหน้าหลัก
               </a>
             </div>

           </div>
         </div>

       </div>
     </div>
   </div>
 </section>

 <script src="assets/js/public-formatters.js"></script>
 <script>
   document.addEventListener('DOMContentLoaded', function() {
     const phoneInput = document.getElementById('phone_input');
     const form = document.getElementById('loginForm');

     if (phoneInput) {
       // Format phone number on load if it exists
       phoneInput.value = PublicFormatters.formatPhoneNumber(phoneInput.value);

       phoneInput.addEventListener('input', function(e) {
         e.target.value = PublicFormatters.formatPhoneNumber(e.target.value);
       });
     }

     if (form) {
       form.addEventListener('submit', function() {
         if (phoneInput) phoneInput.value = phoneInput.value.replace(/-/g, '');
       });
     }
   });
 </script>

<?php include_once COMPONENT_PATH . 'lib_footer.php'; ?>
