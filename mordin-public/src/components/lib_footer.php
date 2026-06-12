  </main>

  <!-- ═══ FOOTER ═══ -->
  <footer class="ag-footer">
    <div class="container-xl">
      <div class="ag-footer-grid">
        <div>
          <img src="/assets/img/logo-mitr-phol-white.png" alt="MITR PHOL" style="height:36px;margin-bottom:14px;opacity:.9;">
          <b>มิตรผลวิจัยพัฒนาอ้อยและน้ำตาล</b>
          <p style="font-size:.92rem;line-height:1.7;margin:0;">
            399 หมู่ที่ 1 ถนนชุมแพ-ภูเขียว<br>
            ต.โคกสะอาด อ.ภูเขียว จ.ชัยภูมิ 36110
          </p>
        </div>
        <div>
          <b>เมนูลัด</b>
          <ul>
            <li><a href="/services/price">บริการ&amp;ราคา</a></li>
            <li><a href="/calendar">ปฏิทินให้บริการ</a></li>
            <li><a href="/shops">ร้านค้าแนะนำ</a></li>
            <li><a href="/soil-improvement">ความรู้เรื่องดิน</a></li>
            <li><a href="/contact">ติดต่อเรา</a></li>
          </ul>
        </div>
        <div>
          <b>ลิงก์ที่เกี่ยวข้อง</b>
          <ul>
            <li><a href="https://www.mitrphol.com/home" target="_blank" rel="noopener">กลุ่มบริษัทมิตรผล</a></li>
            <li><a href="https://www.mitrphol.com/research.php" target="_blank" rel="noopener">ศูนย์นวัตกรรมและการวิจัย</a></li>
          </ul>
        </div>
      </div>
      <div class="ag-footer-copy">
        © 2026 MITR PHOL Cane and Sugar Research Center — All Rights Reserved
      </div>
    </div>
  </footer>

  <!-- Scroll Top -->
  <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center">
    <i class="bi bi-arrow-up-short"></i>
  </a>

  <!-- Vendor JS -->
  <script src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="/assets/vendor/php-email-form/validate.js"></script>
  <script src="/assets/vendor/aos/aos.js"></script>
  <script src="/assets/vendor/glightbox/js/glightbox.min.js"></script>
  <script src="/assets/vendor/swiper/swiper-bundle.min.js"></script>
  <script src="/assets/vendor/purecounter/purecounter_vanilla.js"></script>
  <script src="/assets/js/main.js"></script>

  <!-- ═══ MODAL: Global Alert ═══ -->
  <div class="modal fade ag-popup" id="globalAlertModal" tabindex="-1" aria-labelledby="globalAlertModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered ag-popup-dialog">
      <div class="modal-content">
        <div class="ag-popup-header">
          <button type="button" class="ag-popup-close" data-bs-dismiss="modal" aria-label="Close"><i class="bi bi-x-lg"></i></button>
          <div class="ag-popup-icon"><i id="globalAlertModalIcon" class="bi bi-info-circle-fill"></i></div>
          <h5 class="ag-popup-title" id="globalAlertModalLabel"><span id="globalAlertModalTitle">แจ้งเตือน</span></h5>
        </div>
        <div class="modal-body" id="globalAlertModalBody"></div>
        <div class="modal-footer">
          <button type="button" class="btn-ag-popup-primary" data-bs-dismiss="modal">ปิด</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ MODAL: Global Confirm ═══ -->
  <div class="modal fade ag-popup" id="globalConfirmModal" tabindex="-1" aria-labelledby="globalConfirmModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered ag-popup-dialog">
      <div class="modal-content">
        <div class="ag-popup-header">
          <button type="button" class="ag-popup-close" data-bs-dismiss="modal" aria-label="Close"><i class="bi bi-x-lg"></i></button>
          <div class="ag-popup-icon"><i class="bi bi-question-circle-fill"></i></div>
          <h5 class="ag-popup-title" id="globalConfirmModalLabel">ยืนยันการดำเนินการ</h5>
        </div>
        <div class="modal-body" id="globalConfirmModalBody">
          คุณต้องการยืนยันการดำเนินการนี้ใช่หรือไม่?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-ag-popup-secondary" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="button" class="btn-ag-popup-primary" id="globalConfirmBtn">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ Inline JS: Global modals + require-login ═══ -->
  <script>
  document.addEventListener('DOMContentLoaded', function() {
    /* Alert modal */
    var jsBookingError   = <?php echo json_encode($bookingError   ?? '', JSON_HEX_TAG|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_HEX_AMP); ?>;
    var jsBookingSuccess = <?php echo json_encode($bookingSuccess ?? '', JSON_HEX_TAG|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_HEX_AMP); ?>;
    var modalTitleEl = document.getElementById('globalAlertModalTitle');
    var modalBodyEl  = document.getElementById('globalAlertModalBody');
    var modalIconEl  = document.getElementById('globalAlertModalIcon');
    var msg = jsBookingSuccess || jsBookingError;
    if (msg && modalTitleEl && modalBodyEl) {
      var alertModalEl = document.getElementById('globalAlertModal');
      alertModalEl.classList.remove('ag-popup-success', 'ag-popup-error');
      if (jsBookingSuccess) {
        modalTitleEl.innerText  = 'สำเร็จ!';
        modalIconEl.className   = 'bi bi-check-circle-fill';
        alertModalEl.classList.add('ag-popup-success');
      } else {
        modalTitleEl.innerText  = 'เกิดข้อผิดพลาด!';
        modalIconEl.className   = 'bi bi-exclamation-triangle-fill';
        alertModalEl.classList.add('ag-popup-error');
      }
      modalBodyEl.innerText = msg;
      new bootstrap.Modal(alertModalEl).show();
    }

    /* Confirm modal */
    var confirmBtn     = document.getElementById('globalConfirmBtn');
    var confirmModalEl = document.getElementById('globalConfirmModal');
    if (confirmBtn && confirmModalEl) {
      var confirmModal = new bootstrap.Modal(confirmModalEl);
      confirmBtn.addEventListener('click', function() {
        var formId = this.dataset.formId;
        var form   = formId ? document.getElementById(formId) : document.getElementById('formToConfirm');
        if (form) form.submit();
        confirmModal.hide();
      });
      confirmModalEl.addEventListener('show.bs.modal', function(event) {
        var btn    = event.relatedTarget;
        if (!btn) return;
        var msg    = btn.getAttribute('data-bs-message');
        var title  = btn.getAttribute('data-bs-title');
        var formId = btn.getAttribute('data-bs-form-id');
        if (formId) confirmBtn.dataset.formId = formId; else delete confirmBtn.dataset.formId;
        var body  = confirmModalEl.querySelector('.modal-body');
        var ttl   = confirmModalEl.querySelector('.ag-popup-title');
        if (body)  body.innerText = msg  || 'คุณต้องการยืนยันการดำเนินการนี้ใช่หรือไม่?';
        if (ttl)   ttl.innerText  = title || 'ยืนยันการดำเนินการ';
      });
    }
  });
  </script>

  <!-- Require-login intercept -->
  <script>
  (function() {
    var isLoggedIn = <?= json_encode($isPublicLoggedIn ?? false) ?>;
    if (isLoggedIn) return;
    document.addEventListener('click', function(e) {
      var t = e.target.closest('[data-require-login]');
      if (!t) return;
      e.preventDefault();
      var href = t.getAttribute('href') || '/services/book/farmer';
      var url;
      try {
        url = new URL(href, window.location.origin);
      } catch (error) {
        url = new URL('/services/book/farmer', window.location.origin);
      }
      var next = url.origin === window.location.origin ? url.pathname + url.search : '/services/book/farmer';
      window.location.href = '/services/book/login?next=' + encodeURIComponent(next);
    });
  }());
  </script>

  <!-- Scroll-reveal observer (all pages) -->
  <script>
  (function() {
    var els = document.querySelectorAll('.scroll-reveal, .sr-text, .sr-children, .sr-card, .sr-img');
    if (!els.length) return;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(en) { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
        return;
      }
      io.observe(el);
    });
  }());
  </script>

</body>
</html>
