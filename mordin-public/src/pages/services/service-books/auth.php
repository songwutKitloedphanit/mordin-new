<?php
$authPanel = $authPanel ?? 'login';
$next = $next ?? ($_GET['next'] ?? '');
$errorMessage = $errorMessage ?? '';
$noticeMessage = $noticeMessage ?? '';
$loginFormData = $loginFormData ?? [
  'phone' => '',
  'birthDay' => '',
  'birthMonth' => '',
  'birthYear' => '',
];
$formData = $formData ?? [
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
$factories = $factories ?? [];
$serviceAreasForSelectedFactory = $serviceAreasForSelectedFactory ?? [];
$months = [
  1 => 'ม.ค.', 2 => 'ก.พ.', 3 => 'มี.ค.', 4 => 'เม.ย.',
  5 => 'พ.ค.', 6 => 'มิ.ย.', 7 => 'ก.ค.', 8 => 'ส.ค.',
  9 => 'ก.ย.', 10 => 'ต.ค.', 11 => 'พ.ย.', 12 => 'ธ.ค.'
];
$currentYearBE = (int) date('Y') + 543;
$authCssPath = __DIR__ . '/../../../../assets/css/public-auth.css';
$authCssVersion = file_exists($authCssPath) ? filemtime($authCssPath) : time();
$isRegister = $authPanel === 'register';

$h = static function ($value) {
  return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
};
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= $isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ' ?> | MITR PHOL-SOIL</title>
  <link href="/assets/img/mitr.jpg" rel="icon">
  <link href="/assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="/assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="/assets/css/public-auth.css?v=<?= $authCssVersion ?>" rel="stylesheet">
</head>
<body class="public-auth-body">
  <main class="auth-shell brand-replay <?= $isRegister ? 'register-active' : '' ?>" data-auth-shell>
    <a href="/" class="auth-home-link"><i class="bi bi-arrow-left"></i> กลับหน้าหลัก</a>

    <section class="auth-panel auth-panel-login" aria-labelledby="loginTitle">
      <div class="auth-form-card auth-fade-in">
        <div class="auth-mobile-tabs" role="tablist" aria-label="เลือกการเข้าใช้งาน">
          <a href="/services/book/login<?= $next !== '' ? '?next=' . rawurlencode($next) : '' ?>" class="<?= !$isRegister ? 'is-active' : '' ?>">เข้าสู่ระบบ</a>
          <a href="/services/book/register<?= $next !== '' ? '?next=' . rawurlencode($next) : '' ?>" class="<?= $isRegister ? 'is-active' : '' ?>">สมัครสมาชิก</a>
        </div>
        <p class="auth-kicker">FARMER ACCESS</p>
        <h1 id="loginTitle">เข้าสู่ระบบ</h1>
        <p class="auth-copy">ใช้เบอร์โทรศัพท์และวันเดือนปีเกิดเพื่อจองคิว ดูผลวิเคราะห์ และจัดการข้อมูลแปลงปลูก</p>

        <?php if (!$isRegister && $errorMessage): ?>
          <div class="auth-alert auth-alert-error ag-shake"><i class="bi bi-exclamation-triangle-fill"></i><?= $h($errorMessage) ?></div>
        <?php endif; ?>
        <?php if (!$isRegister && $noticeMessage): ?>
          <div class="auth-alert auth-alert-info"><i class="bi bi-info-circle-fill"></i><?= $h($noticeMessage) ?></div>
        <?php endif; ?>

        <form action="/services/book/login" method="post" id="loginForm" class="auth-form">
          <input type="hidden" name="next" value="<?= $h($next) ?>">
          <label class="auth-field">
            <span>หมายเลขโทรศัพท์</span>
            <div class="auth-input-icon">
              <i class="bi bi-telephone-fill"></i>
              <input type="text" id="phone_input" name="phone" maxlength="12" inputmode="numeric" placeholder="0XX-XXX-XXXX" required value="<?= $h($loginFormData['phone'] ?? '') ?>">
            </div>
          </label>

          <div class="auth-field">
            <span>วันเดือนปีเกิด</span>
            <div class="auth-date-grid">
              <select name="birthDay" required>
                <option value="" disabled <?= ($loginFormData['birthDay'] ?? '') === '' ? 'selected' : '' ?>>วัน</option>
                <?php for ($d = 1; $d <= 31; $d++): ?>
                  <option value="<?= $d ?>" <?= (string)($loginFormData['birthDay'] ?? '') === (string)$d ? 'selected' : '' ?>><?= $d ?></option>
                <?php endfor; ?>
              </select>
              <select name="birthMonth" required>
                <option value="" disabled <?= ($loginFormData['birthMonth'] ?? '') === '' ? 'selected' : '' ?>>เดือน</option>
                <?php foreach ($months as $m => $name): ?>
                  <option value="<?= $m ?>" <?= (string)($loginFormData['birthMonth'] ?? '') === (string)$m ? 'selected' : '' ?>><?= $name ?></option>
                <?php endforeach; ?>
              </select>
              <select name="birthYear" required>
                <option value="" disabled <?= ($loginFormData['birthYear'] ?? '') === '' ? 'selected' : '' ?>>ปี พ.ศ.</option>
                <?php for ($y = $currentYearBE - 100; $y <= $currentYearBE; $y++): ?>
                  <option value="<?= $y ?>" <?= (string)($loginFormData['birthYear'] ?? '') === (string)$y ? 'selected' : '' ?>><?= $y ?></option>
                <?php endfor; ?>
              </select>
            </div>
          </div>

          <button type="submit" class="auth-submit"><i class="bi bi-box-arrow-in-right"></i> เข้าสู่ระบบ</button>
        </form>
      </div>
    </section>

    <section class="auth-panel auth-panel-register" aria-labelledby="registerTitle">
      <div class="auth-form-card auth-register-card auth-fade-in">
        <div class="auth-mobile-tabs" role="tablist" aria-label="เลือกการเข้าใช้งาน">
          <a href="/services/book/login<?= $next !== '' ? '?next=' . rawurlencode($next) : '' ?>" class="<?= !$isRegister ? 'is-active' : '' ?>">เข้าสู่ระบบ</a>
          <a href="/services/book/register<?= $next !== '' ? '?next=' . rawurlencode($next) : '' ?>" class="<?= $isRegister ? 'is-active' : '' ?>">สมัครสมาชิก</a>
        </div>
        <p class="auth-kicker">NEW FARMER</p>
        <h1 id="registerTitle">สมัครสมาชิก</h1>
        <p class="auth-copy">ลงทะเบียนครั้งเดียวเพื่อจองคิวรถวิเคราะห์ดินเคลื่อนที่และติดตามผลรายแปลง</p>

        <?php if ($isRegister && $errorMessage): ?>
          <div class="auth-alert auth-alert-error ag-shake"><i class="bi bi-exclamation-triangle-fill"></i><?= $h($errorMessage) ?></div>
        <?php endif; ?>

        <form action="/services/book/register" method="post" id="registerForm" class="auth-form">
          <input type="hidden" name="next" value="<?= $h($next) ?>">
          <div class="auth-grid">
            <label class="auth-field">
              <span>ชื่อจริง <b>*</b></span>
              <input type="text" name="firstName" required placeholder="กรอกชื่อจริง" value="<?= $h($formData['firstName'] ?? '') ?>">
            </label>
            <label class="auth-field">
              <span>นามสกุล <b>*</b></span>
              <input type="text" name="lastName" required placeholder="กรอกนามสกุล" value="<?= $h($formData['lastName'] ?? '') ?>">
            </label>
          </div>

          <div class="auth-grid">
            <label class="auth-field">
              <span>เบอร์โทรศัพท์ <b>*</b></span>
              <div class="auth-input-icon">
                <i class="bi bi-telephone-fill"></i>
                <input type="text" id="registerPhone" name="phone" maxlength="12" inputmode="numeric" required placeholder="0XX-XXX-XXXX" value="<?= $h($formData['phone'] ?? '') ?>">
              </div>
            </label>
            <div class="auth-field">
              <span>วันเดือนปีเกิด <b>*</b></span>
              <div class="auth-date-grid">
                <select name="birthDay" required>
                  <option value="" disabled <?= ($formData['birthDay'] ?? '') === '' ? 'selected' : '' ?>>วัน</option>
                  <?php for ($d = 1; $d <= 31; $d++): ?>
                    <option value="<?= $d ?>" <?= (string)($formData['birthDay'] ?? '') === (string)$d ? 'selected' : '' ?>><?= $d ?></option>
                  <?php endfor; ?>
                </select>
                <select name="birthMonth" required>
                  <option value="" disabled <?= ($formData['birthMonth'] ?? '') === '' ? 'selected' : '' ?>>เดือน</option>
                  <?php foreach ($months as $m => $name): ?>
                    <option value="<?= $m ?>" <?= (string)($formData['birthMonth'] ?? '') === (string)$m ? 'selected' : '' ?>><?= $name ?></option>
                  <?php endforeach; ?>
                </select>
                <select name="birthYear" required>
                  <option value="" disabled <?= ($formData['birthYear'] ?? '') === '' ? 'selected' : '' ?>>ปี พ.ศ.</option>
                  <?php for ($y = $currentYearBE - 100; $y <= $currentYearBE; $y++): ?>
                    <option value="<?= $y ?>" <?= (string)($formData['birthYear'] ?? '') === (string)$y ? 'selected' : '' ?>><?= $y ?></option>
                  <?php endfor; ?>
                </select>
              </div>
            </div>
          </div>

          <div class="auth-grid">
            <label class="auth-field">
              <span>เลขบัตรประชาชน</span>
              <input type="text" id="registerThaiNationalId" name="thaiNationalId" maxlength="17" inputmode="numeric" placeholder="X-XXXX-XXXXX-XX-X" value="<?= $h($formData['thaiNationalId'] ?? '') ?>">
            </label>
            <label class="auth-field">
              <span>รหัสเกษตรกร</span>
              <input type="text" name="thaiFarmerId" placeholder="กรอกรหัสเกษตรกร" value="<?= $h($formData['thaiFarmerId'] ?? '') ?>">
            </label>
          </div>

          <div class="auth-grid">
            <label class="auth-field">
              <span>โรงงาน <b>*</b></span>
              <select name="factoryId" id="factorySelect" required>
                <option value="" disabled <?= ($formData['factoryId'] ?? '') === '' ? 'selected' : '' ?>>เลือกโรงงาน</option>
                <?php foreach ($factories as $factory): ?>
                  <option value="<?= $h($factory['factoryId'] ?? '') ?>" <?= (string)($formData['factoryId'] ?? '') === (string)($factory['factoryId'] ?? '') ? 'selected' : '' ?>>
                    <?= $h($factory['name'] ?? '') ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </label>
            <label class="auth-field">
              <span>เขตส่งเสริม <b>*</b></span>
              <select name="serviceAreaId" id="serviceAreaSelect" required <?= empty($serviceAreasForSelectedFactory) ? 'disabled' : '' ?>>
                <option value="" disabled <?= ($formData['serviceAreaId'] ?? '') === '' ? 'selected' : '' ?>>
                  <?= ($formData['factoryId'] ?? '') === '' ? 'เลือกโรงงานก่อน' : 'เลือกเขตส่งเสริม' ?>
                </option>
                <?php foreach ($serviceAreasForSelectedFactory as $area): ?>
                  <option value="<?= $h($area['serviceAreaId'] ?? '') ?>" <?= (string)($formData['serviceAreaId'] ?? '') === (string)($area['serviceAreaId'] ?? '') ? 'selected' : '' ?>>
                    <?= $h($area['name'] ?? '') ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </label>
          </div>

          <label class="auth-field">
            <span>Line User ID <small>(ไม่บังคับ)</small></span>
            <input type="text" name="lineUserId" placeholder="กรอก Line User ID ถ้ามี" value="<?= $h($formData['lineUserId'] ?? '') ?>">
          </label>

          <button type="submit" class="auth-submit"><i class="bi bi-person-check-fill"></i> ยืนยันการสมัคร</button>
        </form>
      </div>
    </section>

    <aside class="auth-brand-panel" aria-label="MITR PHOL-SOIL">
      <div class="auth-brand-glow auth-brand-glow-a"></div>
      <div class="auth-brand-glow auth-brand-glow-b"></div>
      <div class="auth-brand-content">
        <img src="/assets/img/logo-mitr-phol-white.png" alt="MITR PHOL" class="auth-logo">
        <p class="auth-brand-kicker">MITR PHOL-SOIL / SOIL ANALYSIS PLATFORM</p>
        <h2>วิเคราะห์ดินแม่นยำ<br>เพื่อผลผลิตอ้อยที่ยั่งยืน</h2>
        <p>จองคิวรถวิเคราะห์ดินเคลื่อนที่ ดูผลวิเคราะห์ และรับคำแนะนำปุ๋ยรายแปลงในบัญชีเดียว</p>
        <ul>
          <li><i class="bi bi-check-circle-fill"></i> จองคิววิเคราะห์ดินผ่านระบบออนไลน์</li>
          <li><i class="bi bi-check-circle-fill"></i> ติดตามสถานะแปลงและผลวิเคราะห์</li>
          <li><i class="bi bi-check-circle-fill"></i> เริ่มต้นด้วยข้อมูลเกษตรกรที่ใช้อยู่จริง</li>
        </ul>
        <a class="auth-switch-link auth-switch-register" href="/services/book/register<?= $next !== '' ? '?next=' . rawurlencode($next) : '' ?>">ยังไม่มีบัญชี? สมัครสมาชิก</a>
        <a class="auth-switch-link auth-switch-login" href="/services/book/login<?= $next !== '' ? '?next=' . rawurlencode($next) : '' ?>">มีบัญชีแล้ว? เข้าสู่ระบบ</a>
      </div>
    </aside>
  </main>

  <script src="/assets/js/public-formatters.js"></script>
  <script>
  (function () {
    var shell = document.querySelector('[data-auth-shell]');
    var switchLinks = document.querySelectorAll('.auth-switch-link, .auth-mobile-tabs a');
    switchLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (window.innerWidth < 992 || !shell) return;
        event.preventDefault();
        var toRegister = link.href.indexOf('/register') !== -1;
        if (shell.classList.contains('register-active') !== toRegister) {
          shell.classList.remove('brand-replay');
          void shell.offsetWidth; /* restart brand stagger animation */
          shell.classList.add('brand-replay');
        }
        shell.classList.toggle('register-active', toRegister);
        history.replaceState(null, '', link.href);
      });
    });

    function bindFormat(input, formatter) {
      if (!input || !window.PublicFormatters || !PublicFormatters[formatter]) return;
      input.value = PublicFormatters[formatter](input.value);
      input.addEventListener('input', function (event) {
        event.target.value = PublicFormatters[formatter](event.target.value);
      });
    }
    bindFormat(document.getElementById('phone_input'), 'formatPhoneNumber');
    bindFormat(document.getElementById('registerPhone'), 'formatPhoneNumber');
    bindFormat(document.getElementById('registerThaiNationalId'), 'formatIDCard');

    document.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function () {
        form.querySelectorAll('input[name="phone"], input[name="thaiNationalId"]').forEach(function (input) {
          input.value = input.value.replace(/\D/g, '');
        });
      });
    });

    var factorySelect = document.getElementById('factorySelect');
    var serviceAreaSelect = document.getElementById('serviceAreaSelect');
    if (!factorySelect || !serviceAreaSelect) return;
    factorySelect.addEventListener('change', async function () {
      var factoryId = this.value;
      serviceAreaSelect.innerHTML = '<option value="" disabled selected>กำลังโหลด...</option>';
      serviceAreaSelect.disabled = true;
      if (!factoryId) return;
      try {
        var response = await fetch('/api/service-areas/by-factory/' + encodeURIComponent(factoryId));
        if (!response.ok) throw new Error('Failed to load service areas');
        var areas = await response.json();
        serviceAreaSelect.innerHTML = '<option value="" disabled selected>เลือกเขตส่งเสริม</option>';
        areas.forEach(function (area) {
          serviceAreaSelect.add(new Option(area.name, area.serviceAreaId));
        });
        serviceAreaSelect.disabled = areas.length === 0;
      } catch (error) {
        serviceAreaSelect.innerHTML = '<option value="" disabled selected>โหลดเขตส่งเสริมล้มเหลว</option>';
      }
    });
  }());
  </script>
</body>
</html>
