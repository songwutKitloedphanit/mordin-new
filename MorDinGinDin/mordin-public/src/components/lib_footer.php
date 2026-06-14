</main>

<footer id="footer" class="footer position-relative light-background">

  <div class="container footer-top">
    <div class="row gy-4">
      <!--div class="col-lg-4 col-md-6 footer-about"-->
      <div class="col-lg-5 col-md-8 footer-about">
        <a href="index.html" class="logo d-flex align-items-center">
          <span class="sitename">MITR PHOL</span>
        </a>
        <div class="footer-contact pt-3">
          <p>มิตรผลวิจัยพัฒนาอ้อยและน้ำตาล</p>
          <p>399 หมู่ที่ 1 ถนนชุมแพ-ภูเขียว ตำบลโคกสะอาด อำเภอภูเขียว จังหวัดชัยภูมิ 36110</p>
          <!-- <p class="mt-3"><strong>Phone:</strong> <span>: 094-523-0000 (ณัฐวุฒิ) &nbsp;&nbsp; 095-563-0000 (อัฏฐารส)</span></p> -->
          <!--p class="mt-3"><strong>Phone:</strong> <span>: 094-523-5145 (ณัฐวุฒิ) &nbsp;&nbsp; 095-563-6495 (อัฏฐารส)</span></p-->
          <!--p><strong>Email:</strong> <span>info@example.com</span></p-->
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
      <!-- All the links in the footer should remain intact. -->
      <!-- You can delete the links only if you've purchased the pro version. -->
      <!-- Licensing information: https://bootstrapmade.com/license/ -->
      <!-- Purchase the pro version with working PHP/AJAX contact form: [buy-url] -->
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
          <span id="globalAlertModalTitle"></span>
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


<script>
  document.addEventListener('DOMContentLoaded', function() {
    
    // --- Logic for MODAL 1: Alert (Success/Error) ---
    const jsBookingError = "<?php echo $bookingError ?? ''; ?>";
    const jsBookingSuccess = "<?php echo $bookingSuccess ?? ''; ?>";
    
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

</body>
</html>