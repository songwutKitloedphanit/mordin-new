</main>

<footer id="footer" class="footer position-relative light-background">

  <div class="container footer-top">
    <div class="row gy-4">
      <div class="col-lg-5 col-md-8 footer-about">
        <a href="index.html" class="logo d-flex align-items-center">
          <span class="sitename">MITR PHOL</span>
        </a>
        <div class="footer-contact pt-3">
          <p>มิตรผลวิจัยพัฒนาอ้อยและน้ำตาล</p>
          <p>399 หมู่ที่ 1 ถนนชุมแพ-ภูเขียว ตำบลโคกสะอาด อำเภอภูเขียว จังหวัดชัยภูมิ 36110</p>
        </div>
      </div>

      <div class="col-lg-3 col-md-4 footer-links ms-auto">
        <h4>ลิงค์ที่เกี่ยวข้อง</h4>
        <ul>
          <li><a href="https://www.mitrphol.com/home">กลุ่มบริษัทมิตรผล</a></li>
          <li><a href="https://www.mitrphol.com/research.php">ศูนย์นวัตกรรมและการวิจัย</a></li>
        </ul>
      </div>

    </div>
  </div>

  <div class="container copyright text-center mt-4">
    <p>© <span>Copyright</span> <strong class="px-1 sitename">MITR PHOL</strong> <span>All Rights Reserved</span></p>
    <div class="credits">
      Last update <a href="https://bootstrapmade.com/">30-12-2025</a>
    </div>
  </div>

</footer>

<!-- Scroll Top -->
<a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center"><i
    class="bi bi-arrow-up-short"></i></a>

<!-- Preloader -->
<div id="preloader"></div>

<script src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="/assets/vendor/php-email-form/validate.js"></script>
<script src="/assets/vendor/aos/aos.js"></script>
<script src="/assets/vendor/glightbox/js/glightbox.min.js"></script>
<script src="/assets/vendor/swiper/swiper-bundle.min.js"></script>
<script src="/assets/vendor/purecounter/purecounter_vanilla.js"></script>

<script src="/assets/js/main.js"></script>


<div class="modal fade" id="globalAlertModal" tabindex="-1" aria-labelledby="globalAlertModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="globalAlertModalLabel">
          <i id="globalAlertModalIcon" class=""></i>
          <span id="globalAlertModalTitle">แจ้งเตือน</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="globalAlertModalBody">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">ปิด</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="globalConfirmModal" tabindex="-1" aria-labelledby="globalConfirmModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="globalConfirmModalLabel">
          <i class="bi bi-question-circle-fill text-warning me-2"></i>
          ยืนยันการดำเนินการ
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="globalConfirmModalBody">
        คุณต้องการยืนยันการดำเนินการนี้ใช่หรือไม่?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
        <button type="button" class="btn btn-primary" id="globalConfirmBtn">ยืนยัน</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="requireLoginModal" tabindex="-1" aria-labelledby="requireLoginModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content overflow-hidden">
      <div class="public-login-card-header">
        <div class="public-login-card-icon">
          <i class="bi bi-person-lock"></i>
        </div>
        <h5 class="mb-1" id="requireLoginModalLabel">เข้าสู่ระบบ</h5>
        <p class="mb-0" style="color:rgba(255,255,255,0.8);font-size:0.88rem">จองและดูผลวิเคราะห์ดินของท่าน</p>
        <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3"
          data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body public-login-card-body">
        <div id="inlineLoginError" class="alert alert-danger d-none mb-3" role="alert"></div>
        <form id="inlineLoginForm" action="services/book/login" method="post">
          <div class="public-login-type-toggle mb-4">
            <label class="public-login-type-option">
              <input type="radio" name="loginType" value="farmer_id" id="inline_type_farmer" checked
                onchange="document.getElementById('inline_identifier').placeholder='กรอกหมายเลขเกษตรกร';document.getElementById('inline_id_label').textContent='หมายเลขเกษตรกร'">
              <span><i class="bi bi-person-badge"></i> รหัสเกษตรกร</span>
            </label>
            <label class="public-login-type-option">
              <input type="radio" name="loginType" value="thai_id" id="inline_type_thai"
                onchange="document.getElementById('inline_identifier').placeholder='กรอกหมายเลขบัตรประชาชน';document.getElementById('inline_id_label').textContent='หมายเลขบัตรประชาชน'">
              <span><i class="bi bi-card-text"></i> บัตรประชาชน</span>
            </label>
          </div>
          <div class="mb-3">
            <label for="inline_identifier" class="form-label" id="inline_id_label">หมายเลขเกษตรกร</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
              <input type="text" class="form-control" id="inline_identifier" name="identifier"
                placeholder="กรอกหมายเลขเกษตรกร" maxlength="17" required>
            </div>
          </div>
          <div class="mb-4">
            <label for="inline_phone" class="form-label">หมายเลขโทรศัพท์</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
              <input type="text" class="form-control" id="inline_phone" name="phone"
                placeholder="กรอกหมายเลขโทรศัพท์" maxlength="12" required>
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-100 text-white">
            <i class="bi bi-box-arrow-in-right"></i> เข้าสู่ระบบ
          </button>
        </form>
        <div class="public-login-divider"><span>ยังไม่ได้ลงทะเบียน?</span></div>
        <a href="services/book/register" class="public-login-register-link">
          <i class="bi bi-person-plus"></i> ยังไม่มีบัญชี? สมัครที่นี่
        </a>
      </div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {

    // --- Logic for MODAL 1: Alert (Success/Error) ---
    const jsBookingError = <?php echo json_encode($bookingError ?? '', JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;
    const jsBookingSuccess = <?php echo json_encode($bookingSuccess ?? '', JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;

    const modalTitleEl = document.getElementById('globalAlertModalTitle');
    const modalBodyEl = document.getElementById('globalAlertModalBody');
    const modalIconEl = document.getElementById('globalAlertModalIcon');

    let messageToShow = '';
    let isSuccess = false;

    if (jsBookingSuccess) {
      messageToShow = jsBookingSuccess;
      isSuccess = true;
    } else if (jsBookingError) {
      messageToShow = jsBookingError;
      isSuccess = false;
    }

    if (messageToShow) {
      if (isSuccess) {
        modalTitleEl.innerText = 'สำเร็จ!';
        modalIconEl.className = 'bi bi-check-circle-fill text-success me-2';
      } else {
        modalTitleEl.innerText = 'เกิดข้อผิดพลาด!';
        modalIconEl.className = 'bi bi-exclamation-triangle-fill text-danger me-2';
      }

      modalBodyEl.innerText = messageToShow;

      const alertModal = new bootstrap.Modal(document.getElementById('globalAlertModal'));
      alertModal.show();
    }

    // --- [!!] EDITED Logic for MODAL 2: Confirmation ---
    const confirmBtn = document.getElementById('globalConfirmBtn');
    const confirmModalEl = document.getElementById('globalConfirmModal');

    if (confirmBtn && confirmModalEl) {
        const confirmModal = new bootstrap.Modal(confirmModalEl);

        // 1. เมื่อกดปุ่ม "ยืนยัน" ใน Modal
        confirmBtn.addEventListener('click', function() {
            // [!!]
            // ตรวจสอบว่าปุ่มยืนยันมี
            // ID
            // ของฟอร์มเป้าหมายเก็บไว้หรือไม่
            const formIdToSubmit = this.dataset.formId;
            let formToSubmit;

            if (formIdToSubmit) {
                //
                // ถ้ามี
                // (เช่น
                // "cancelForm-105")
                // ให้ค้นหาตาม
                // ID
                // นั้น
                formToSubmit = document.getElementById(formIdToSubmit);
            } else {
                //
                // ถ้าไม่มี
                // (ค่า
                // default)
                // ให้ค้นหา
                // "formToConfirm"
                // (สำหรับหน้า
                // create/update
                // booking)
                formToSubmit = document.getElementById('formToConfirm');
            }

            if (formToSubmit) {
                formToSubmit.submit();
            } else {
                console.error('Confirm Modal: Target form not found.');
            }
            confirmModal.hide();
        });

        // 2. เมื่อ Modal กำลังจะเปิด
        confirmModalEl.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;

            const message = button.getAttribute('data-bs-message');
            const title = button.getAttribute('data-bs-title');
            const formId = button.getAttribute('data-bs-form-id'); //
                                                                   // [!!]
                                                                   // ดึง
                                                                   // ID
                                                                   // ฟอร์มเป้าหมาย

            const modalBody = confirmModalEl.querySelector('.modal-body');
            const modalTitle = confirmModalEl.querySelector('.modal-title');

            //
            // [!!]
            // เก็บ
            // ID
            // ฟอร์มเป้าหมายไว้ที่ปุ่มยืนยัน
            if (formId) {
                confirmBtn.dataset.formId = formId;
            } else {
                delete confirmBtn.dataset.formId; //
                                                  // ลบออก
                                                  // (เพื่อให้ใช้ค่า
                                                  // default
                                                  // "formToConfirm")
            }

            if (message) {
                modalBody.innerText = message;
            } else {
                modalBody.innerText = 'คุณต้องการยืนยันการดำเนินการนี้ใช่หรือไม่?';
            }

            if (title) {
                modalTitle.innerHTML = `<i class="bi bi-question-circle-fill text-warning me-2"></i> ${title}`;
            } else {
                modalTitle.innerHTML = `<i class="bi bi-question-circle-fill text-warning me-2"></i> ยืนยันการดำเนินการ`;
            }
        });
    }

  });
</script>

<script>
(function () {
  var isLoggedIn = <?= json_encode($isPublicLoggedIn ?? false) ?>;
  if (isLoggedIn) return;

  var modalEl = document.getElementById('requireLoginModal');
  if (!modalEl) return;

  var loginModal = new bootstrap.Modal(modalEl);

  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-require-login]');
    if (!target) return;
    e.preventDefault();
    loginModal.show();
  });
}());
</script>

<script src="assets/js/public-formatters.js"></script>
<script>
(function () {
  var identifierInput = document.getElementById('inline_identifier');
  var phoneInput = document.getElementById('inline_phone');
  var loginTypeRadios = document.querySelectorAll('#inlineLoginForm input[name="loginType"]');
  var idLabel = document.getElementById('inline_id_label');
  var form = document.getElementById('inlineLoginForm');

  var typeConfig = {
    farmer_id: { label: 'หมายเลขเกษตรกร', placeholder: 'กรอกหมายเลขเกษตรกร', maxlength: '17' },
    thai_id:   { label: 'หมายเลขบัตรประชาชน', placeholder: 'กรอกหมายเลขบัตรประชาชน', maxlength: '17' }
  };

  loginTypeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      var cfg = typeConfig[this.value] || typeConfig.farmer_id;
      if (idLabel) idLabel.textContent = cfg.label;
      if (identifierInput) {
        identifierInput.placeholder = cfg.placeholder;
        identifierInput.maxLength = cfg.maxlength;
        identifierInput.value = '';
        identifierInput.focus();
      }
    });
  });

  if (identifierInput) {
    identifierInput.addEventListener('input', function (e) {
      var type = document.querySelector('#inlineLoginForm input[name="loginType"]:checked');
      if (type && type.value === 'thai_id') {
        e.target.value = PublicFormatters.formatIDCard(e.target.value);
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      e.target.value = PublicFormatters.formatPhoneNumber(e.target.value);
    });
  }

  if (form) {
    form.addEventListener('submit', function () {
      if (identifierInput) identifierInput.value = identifierInput.value.replace(/-/g, '');
      if (phoneInput) phoneInput.value = phoneInput.value.replace(/-/g, '');
    });
  }
}());
</script>

</body>
</html>
