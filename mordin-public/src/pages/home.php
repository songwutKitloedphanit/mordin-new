<?php
$cPAGE['name']  = "ความเป็นมา";
$cPAGE['alias'] = "home";
$cPAGE['link']  = "home.php";
$cPAGE['desc']  = "การให้บริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

require_once SERVICES_PATH . 'ServiceCalendarAPI.php';
include_once UTILS_PATH . 'date.php';

$homeCalendars = ServiceCalendarAPI::getPublicUpComingCalendar();
$homeMapData = [];
if (!empty($homeCalendars) && !isset($homeCalendars['error'])) {
    foreach ($homeCalendars as $cal) {
        $lat = floatval($cal['latitude'] ?? 0);
        $lng = floatval($cal['longitude'] ?? 0);
        if ($lat == 0 && $lng == 0) continue;
        $subdistrict = $cal['subdistrictName'] ?? $cal['subdistrict']['nameTh'] ?? '';
        $district    = $cal['districtName']    ?? $cal['district']['nameTh'] ?? $cal['subdistrict']['district']['nameTh'] ?? '';
        $province    = $cal['provinceName']    ?? $cal['province']['nameTh'] ?? $cal['subdistrict']['district']['province']['nameTh'] ?? '';
        $village     = $cal['village'] ?? '';
        $homeMapData[] = [
            'lat'     => $lat,
            'lng'     => $lng,
            'date'    => $cal['date'] ?? '',
            'address' => "{$village} ต.{$subdistrict} อ.{$district} จ.{$province}",
        ];
    }
}

include_once COMPONENT_PATH . 'lib_header.php';
?>

<link rel="stylesheet" href="/assets/css/leaflet.css">

<!-- ═══════════════════════════════════════════════════════
     ANTIGRAVITY HOME
     ag-scroll-wrap → two snap sections (hero / content)
═══════════════════════════════════════════════════════ -->
<div class="ag-scroll-wrap" id="ag-scroll-wrap">

  <!-- ──── SNAP 1 : HERO 100vh ──── -->
  <section class="ag-snap ag-hero-wrap" id="ag-hero">
    <canvas id="ag-hero-canvas" aria-hidden="true"></canvas>
    <div class="ag-dot-grid" aria-hidden="true"></div>

    <!-- glow blobs -->
    <div class="ag-glow ag-glow-1" aria-hidden="true"></div>
    <div class="ag-glow ag-glow-2" aria-hidden="true"></div>
    <div class="ag-glow ag-glow-3" aria-hidden="true"></div>

    <!-- radar rings -->
    <div class="ag-radar ag-radar-1" aria-hidden="true"></div>
    <div class="ag-radar ag-radar-2" aria-hidden="true"></div>
    <div class="ag-radar ag-radar-3" aria-hidden="true"></div>

    <div class="ag-hero-inner container-xl">
      <div class="ag-hero-badge scroll-reveal">
        <i class="bi bi-stars"></i>
        <span>MITR PHOL SOIL SERVICE</span>
      </div>

      <h1 class="ag-hero-title scroll-reveal sr-delay-1">
        วิเคราะห์คุณภาพดินอัจฉริยะ<br><span class="ag-grad">กับแพลตฟอร์มหมอดินโมบาย</span>
      </h1>

      <p class="ag-hero-lead scroll-reveal sr-delay-2">
        บริการตรวจวิเคราะห์ดินใกล้พื้นที่เกษตรกร ลดระยะเวลารอผลจากหลายสัปดาห์เหลือภายในวันเดียว
        พร้อมข้อมูลสำหรับวางแผนจัดการดินและปุ๋ยรายแปลงอย่างเหมาะสม
      </p>

      <div class="ag-hero-actions scroll-reveal sr-delay-3">
        <a class="btn-hero-white"
           href="<?= $isPublicLoggedIn ? '/services/book/farmer' : '/services/book/login' ?>"
           <?= $isPublicLoggedIn ? '' : 'data-require-login="true"' ?>>
          <i class="bi bi-calendar-check-fill me-2"></i>จองคิววิเคราะห์ดิน ฟรี
        </a>
        <a class="btn-hero-glass" href="/services/price">
          <i class="bi bi-card-list me-2"></i>ดูบริการและราคา
        </a>
      </div>

      <div class="ag-hero-trust scroll-reveal sr-delay-4">
        <span><i class="bi bi-check-circle-fill text-success me-1"></i>ฟรี (ปีที่ 1)</span>
        <span><i class="bi bi-clock-fill text-warning me-1"></i>ผลใน 6 ชั่วโมง</span>
        <span><i class="bi bi-geo-alt-fill me-1"></i>ใกล้พื้นที่คุณ</span>
      </div>
    </div>

    <!-- scroll-down hint -->
    <div class="ag-scroll-hint" aria-hidden="true">
      <i class="bi bi-chevron-double-down"></i>
    </div>

    <!-- fade overlay on scroll transition -->
    <div id="ag-hero-fade" class="ag-hero-fade" aria-hidden="true"></div>
  </section>

  <!-- ──── SNAP 2 : CONTENT BLOCK ──── -->
  <section class="ag-snap ag-content-block" id="ag-content">

    <!-- MAP + FEATURES ─────────────────────────────────── -->
    <div class="ag-sub-section">
      <div class="container-xl">
        <div class="row gy-4 align-items-start">

          <!-- Map card -->
          <div class="col-lg-7 sr-card stagger-1">
            <div class="ag-card" style="overflow:hidden;">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="ag-kicker" style="margin:0;">
                  <i class="bi bi-geo-alt-fill me-1" style="color:var(--ag-blue)"></i>
                  จุดให้บริการที่กำลังจะมาถึง
                </span>
                <?php if (!empty($homeMapData)): ?>
                  <span class="badge rounded-pill" style="background:var(--ag-blue);font-size:.78rem;">
                    <?= count($homeMapData) ?> จุด
                  </span>
                <?php endif; ?>
              </div>
              <?php if (!empty($homeMapData)): ?>
                <div id="home-map" style="height:300px;border-radius:10px;overflow:hidden;"></div>
                <div class="mt-3 text-center">
                  <a href="/calendar" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-calendar3 me-1"></i>ดูปฏิทินให้บริการทั้งหมด
                    <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              <?php else: ?>
                <div class="text-center py-5 text-secondary">
                  <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
                  ยังไม่มีรอบบริการในขณะนี้<br>
                  <a href="/calendar" class="text-primary">ติดตามประกาศได้ที่นี่</a>
                </div>
              <?php endif; ?>
            </div>
          </div>

          <!-- Service locations copy -->
          <div class="col-lg-5">
            <div class="ag-kicker sr-text">SERVICE LOCATIONS</div>
            <div class="ag-section-title sr-text stagger-1">
              <h2>จุดให้บริการใกล้พื้นที่เกษตรกร</h2>
            </div>
            <p class="sr-text stagger-2" style="color:var(--ag-text);line-height:1.85;">
              รถวิเคราะห์ดินเคลื่อนที่ออกให้บริการตามปฏิทินในเขตส่งเสริมอ้อยฯ
              เกษตรกรสามารถเลือกแปลงและจองคิวจากพื้นที่จริง ลดการเดินทางและลดเวลารอผล
            </p>
            <div class="ag-stat-pair sr-children">
              <div class="ag-stat-line">
                <strong>6 Hours</strong>
                <span>รับผลวิเคราะห์ภายในวันเดียวเมื่อเข้ารับบริการ</span>
              </div>
              <div class="ag-stat-line">
                <strong>ISO 17025</strong>
                <span>มาตรฐานกระบวนการวิเคราะห์และควบคุมคุณภาพข้อมูล</span>
              </div>
            </div>
            <div class="mt-3 sr-text stagger-3">
              <a class="btn btn-primary w-100"
                 href="<?= $isPublicLoggedIn ? '/services/book/farmer' : '/services/book/login' ?>"
                 <?= $isPublicLoggedIn ? '' : 'data-require-login="true"' ?>>
                <i class="bi bi-calendar-check-fill me-2"></i>จองคิววิเคราะห์ดิน
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- CORE CAPABILITIES ─────────────────────────────── -->
    <div class="ag-sub-section ag-sub-section-light">
      <div class="container-xl">
        <div class="text-center mb-4 sr-text">
          <div class="ag-kicker d-inline-block">CORE CAPABILITIES</div>
          <div class="ag-section-title"><h2>ความสามารถหลักของบริการ</h2></div>
        </div>
        <div class="ag-feature-grid">
          <div class="ag-feature-card sr-card stagger-1">
            <div class="ag-feature-icon" style="background:rgba(15,142,69,.12);color:var(--ag-green);">
              <i class="bi bi-currency-exchange"></i>
            </div>
            <h3>ฟรีในปีแรก</h3>
            <p>ลดต้นทุนเริ่มต้นในการวิเคราะห์ดินสำหรับเกษตรกรในเขตบริการ</p>
          </div>
          <div class="ag-feature-card sr-card stagger-2">
            <div class="ag-feature-icon" style="background:rgba(234,179,8,.12);color:var(--ag-yellow);">
              <i class="bi bi-clock-history"></i>
            </div>
            <h3>ผลเร็วภายใน 6 ชั่วโมง</h3>
            <p>เปลี่ยนงานรอผลหลายสัปดาห์เป็นข้อมูลที่พร้อมใช้วางแผนในวันเดียว</p>
          </div>
          <div class="ag-feature-card sr-card stagger-3">
            <div class="ag-feature-icon" style="background:rgba(0,91,172,.12);color:var(--ag-blue);">
              <i class="bi bi-geo-alt"></i>
            </div>
            <h3>ใกล้พื้นที่จริง</h3>
            <p>บริการเคลื่อนที่ตามจุดนัดหมายในปฏิทิน ลดภาระขนส่งตัวอย่างดิน</p>
          </div>
          <div class="ag-feature-card sr-card stagger-4">
            <div class="ag-feature-icon" style="background:rgba(32,201,151,.12);color:var(--ag-green-light);">
              <i class="bi bi-bar-chart-line"></i>
            </div>
            <h3>ข้อมูลธาตุอาหารครบ</h3>
            <p>วิเคราะห์ข้อมูลสำคัญสำหรับการจัดการดินและสูตรปุ๋ยอ้อยรายแปลง</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ABOUT ─────────────────────────────────────────── -->
    <div class="ag-sub-section" style="background:var(--ag-bg);">
      <div class="container-xl">
        <div class="row gy-4 align-items-center">

          <div class="col-lg-5">
            <div class="sr-img">
              <img src="/assets/img/soil-car.jpg" class="img-fluid" alt="รถวิเคราะห์ดินเคลื่อนที่">
            </div>
          </div>

          <div class="col-lg-7">
            <div class="ag-kicker sr-text">ABOUT PRECISION</div>
            <div class="ag-section-title sr-text stagger-1">
              <h2>การให้บริการบนรถวิเคราะห์ดินเคลื่อนที่</h2>
            </div>
            <p class="sr-text stagger-2" style="color:var(--ag-text);line-height:1.85;">
              ในปัจจุบันที่ราคาปุ๋ยเคมีปรับตัวสูงขึ้น การใส่ปุ๋ยตามค่าวิเคราะห์ดินจึงมีความสำคัญมากขึ้น
              แต่สถานที่บริการมักอยู่ไกล ใช้เวลานาน 2–3 สัปดาห์กว่าจะได้ผล และมีค่าบริการสูง
            </p>
            <p class="sr-text stagger-3" style="color:var(--ag-text);line-height:1.85;">
              กลุ่มมิตรผลจึงจัดทำ<strong>รถบริการวิเคราะห์ดินเคลื่อนที่</strong>
              เพื่อออกให้บริการในพื้นที่เขตส่งเสริมอ้อยฯ
              เกษตรกรจะได้รับผลวิเคราะห์ดินภายใน 1 วัน พร้อมคำแนะนำการจัดการดินและปุ๋ยที่เหมาะสมกับพื้นที่
            </p>
            <ul class="ag-checklist mt-3 sr-children">
              <li><i class="bi bi-check-circle-fill"></i><span>ช่วยเพิ่มผลผลิตและคุณภาพอ้อย</span></li>
              <li><i class="bi bi-check-circle-fill"></i><span>ลดต้นทุน เพิ่มรายได้และกำไร</span></li>
              <li><i class="bi bi-check-circle-fill"></i><span>ปรับปรุงคุณภาพดินระยะยาว</span></li>
              <li><i class="bi bi-check-circle-fill"></i><span>เพิ่มความยั่งยืนในการทำการเกษตร</span></li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- COMPARISON TABLE ───────────────────────────────── -->
    <div class="ag-sub-section">
      <div class="container-xl">
        <div class="text-center mb-4 sr-text">
          <div class="ag-kicker d-inline-block">COMPARISON MATRIX</div>
          <div class="ag-section-title"><h2>เปรียบเทียบบริการ</h2></div>
        </div>
        <div class="ag-table-card scroll-reveal">
          <table class="ag-table">
            <thead>
              <tr>
                <th></th>
                <th>ชุดทดสอบ Test kit</th>
                <th>ห้องปฏิบัติการทั่วไป</th>
                <th class="ag-table-highlight">
                  รถวิเคราะห์ดินเคลื่อนที่
                  <span class="ag-recommend-chip">แนะนำ</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>ค่าวิเคราะห์ดิน</th>
                <td>70 บาท/ตัวอย่าง</td>
                <td>2,000 บาท/ตัวอย่าง</td>
                <td class="ag-table-highlight"><strong style="color:var(--ag-green);">ฟรี (ปีที่ 1)</strong></td>
              </tr>
              <tr>
                <th>ระยะเวลาผล</th>
                <td>30 นาที</td>
                <td>2–3 สัปดาห์</td>
                <td class="ag-table-highlight"><strong>6 ชั่วโมง</strong></td>
              </tr>
              <tr>
                <th>ธาตุอาหารที่วิเคราะห์</th>
                <td>เฉพาะ NPK</td>
                <td>ทุกธาตุอาหาร</td>
                <td class="ag-table-highlight">ธาตุอาหารที่จำเป็นครบถ้วน</td>
              </tr>
              <tr>
                <th>คำแนะนำและสูตรปุ๋ยอ้อย</th>
                <td>ไม่มีคำแนะนำเฉพาะแปลง</td>
                <td>ขึ้นกับการแปลผลเอง</td>
                <td class="ag-table-highlight"><strong style="color:var(--ag-blue);">มีคำแนะนำรายแปลง</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </section><!-- /.ag-content-block -->
</div><!-- /.ag-scroll-wrap -->

<?php include_once COMPONENT_PATH . '/lib_footer.php' ?>

<!-- ═══ HERO: scroll choreography + chemistry mesh ═══ -->
<script>
(function () {
  var header = document.getElementById('header');
  var snapWrap = document.getElementById('ag-scroll-wrap');
  var hero = document.getElementById('ag-hero');
  var heroInner = hero ? hero.querySelector('.ag-hero-inner') : null;
  var glows = hero ? hero.querySelectorAll('.ag-glow') : [];
  var reduceMotion = false;

  var heroFade = document.getElementById('ag-hero-fade');

  function syncHeroScroll() {
    if (!header || !hero) return;
    var isDesktop = window.innerWidth > 992;
    var snapStyle = snapWrap ? window.getComputedStyle(snapWrap) : null;
    var useSnapScroll = isDesktop && snapWrap && snapStyle && snapStyle.overflowY !== 'visible' && snapWrap.scrollHeight > snapWrap.clientHeight + 1;
    var scrollTop = useSnapScroll ? snapWrap.scrollTop : window.scrollY;
    var heroHeight = Math.max(1, hero.offsetHeight);
    var progress = Math.min(1, Math.max(0, scrollTop / heroHeight));
    header.classList.toggle('scrolled', scrollTop > 40);

    if (!reduceMotion) {
      /* Flipboard fold: hero stays pinned (sticky) and tips back gently while the white sheet slides over it */
      hero.style.transform = progress > 0
        ? 'perspective(1600px) rotateX(' + (7 * progress).toFixed(2) + 'deg) scale(' + (1 - 0.03 * progress).toFixed(3) + ')'
        : '';
      hero.style.filter = progress > 0 ? 'brightness(' + (1 - 0.12 * progress).toFixed(3) + ')' : '';
      if (heroInner) {
        heroInner.style.opacity = String(Math.max(0, 1 - progress * 1.35));
        heroInner.style.transform = 'translateY(' + (-44 * progress).toFixed(1) + 'px)';
      }
      glows.forEach(function (glow) {
        glow.style.opacity = String(Math.max(0, 0.2 - progress * 0.2));
      });
    }

    if (heroFade) {
      var fadeOpacity = Math.max(0, Math.min(1, (progress - 0.45) / 0.5)) * 0.18;
      heroFade.style.opacity = String(fadeOpacity);
    }

    if (snapWrap && useSnapScroll && scrollTop >= heroHeight - 12) {
      snapWrap.style.scrollSnapType = 'none';
    }
  }

  var syncQueued = false;
  function requestSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(function () {
      syncQueued = false;
      syncHeroScroll();
    });
  }

  if (snapWrap) snapWrap.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
  syncHeroScroll();

  /* Page-swipe commit: a gesture that ends inside the hero zone glides to a
     full page in the swiped direction — down commits to the white page, up
     back to the hero — so the flip never rests half-open. */
  (function () {
    if (!hero) return;
    var commitTarget = null;
    var commitTimer = null;
    var lastY = window.scrollY;
    var lastDir = 0;
    var touching = false;

    function settleHero() {
      if (touching) return;
      var heroHeight = Math.max(1, hero.offsetHeight);
      var yNow = window.scrollY;
      if (yNow <= 1 || yNow >= heroHeight - 1) { commitTarget = null; return; }
      /* Never rest half-folded: always glide to a full page. Continue in the
         direction of travel, falling back to the nearer page when idle. */
      var progress = yNow / heroHeight;
      var goDown = lastDir !== 0 ? lastDir > 0 : progress >= 0.5;
      commitTarget = goDown ? heroHeight : 0;
      window.scrollTo({ top: commitTarget, behavior: 'smooth' });
    }

    window.addEventListener('scroll', function () {
      var yNow = window.scrollY;
      if (yNow !== lastY) lastDir = yNow > lastY ? 1 : -1;
      lastY = yNow;
      if (commitTarget !== null && Math.abs(yNow - commitTarget) < 2) commitTarget = null;
      if (commitTarget !== null) return; /* our own glide is in flight */
      clearTimeout(commitTimer);
      commitTimer = setTimeout(settleHero, 90);
    }, { passive: true });

    /* a new user gesture always takes back control from an in-flight glide */
    window.addEventListener('wheel', function () { commitTarget = null; }, { passive: true });
    window.addEventListener('touchstart', function () { touching = true; commitTarget = null; }, { passive: true });
    window.addEventListener('touchend', function () {
      touching = false;
      clearTimeout(commitTimer);
      commitTimer = setTimeout(settleHero, 60);
    }, { passive: true });
  }());

  if (hero && !reduceMotion) {
    hero.addEventListener('pointermove', function (event) {
      if (window.innerWidth < 992) return;
      var rect = hero.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width - 0.5) * 40;
      var y = ((event.clientY - rect.top) / rect.height - 0.5) * 40;
      glows.forEach(function (glow, index) {
        var factor = index + 1;
        glow.style.transform = 'translate(' + (x / factor).toFixed(1) + 'px,' + (y / factor).toFixed(1) + 'px)';
      });
    });
    hero.addEventListener('pointerleave', function () {
      glows.forEach(function (glow) { glow.style.transform = ''; });
    });
  }

  var canvas = document.getElementById('ag-hero-canvas');
  if (!canvas || !hero) return;
  var ctx = canvas.getContext('2d');
  var width = 0;
  var height = 0;
  var animId = null;
  var particles = [];
  var shockwaves = [];
  var textRect = { x: 0, y: 0, width: 0, height: 0 };
  var mouse = { x: null, y: null, radius: 90, isDown: false };
  var particleCount = window.innerWidth < 768 ? 45 : 80;
  var connectionDistance = 55;
  var elementsList = {
    SOIL: [
      { name: 'Si', color: 'rgba(186, 230, 253, 0.92)', size: 8 },
      { name: 'OM', color: 'rgba(217, 119, 6, 0.92)', size: 11 },
      { name: 'O',  color: 'rgba(220, 240, 255, 0.88)', size: 6 }
    ],
    WATER: [
      { name: 'O', color: 'rgba(200, 230, 255, 0.88)', size: 6 },
      { name: 'H', color: 'rgba(147, 197, 253, 0.92)', size: 5 }
    ],
    FERTILIZER: [
      { name: 'N', color: 'rgba(52, 211, 153, 0.92)', size: 9 },
      { name: 'P', color: 'rgba(248, 113, 113, 0.92)', size: 10 },
      { name: 'K', color: 'rgba(251, 191, 36, 0.92)', size: 9 }
    ]
  };

  function updateTextRect() {
    if (!heroInner) return;
    var rect = heroInner.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();
    textRect.x = rect.left - canvasRect.left;
    textRect.y = rect.top - canvasRect.top;
    textRect.width = rect.width;
    textRect.height = rect.height;
  }

  function resizeCanvas() {
    var rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(canvas.offsetWidth || rect.width));
    height = Math.max(1, Math.round(canvas.offsetHeight || rect.height));
    canvas.width = width;
    canvas.height = height;
    updateTextRect();
  }

  function chooseFamilyElement(family) {
    var familyElements = elementsList[family];
    return familyElements[Math.floor(Math.random() * familyElements.length)];
  }

  function Particle() {
    var families = ['SOIL', 'WATER', 'FERTILIZER'];
    this.family = families[Math.floor(Math.random() * families.length)];
    this.element = chooseFamilyElement(this.family);
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.radius = this.element.size;
    this.explosionCooldown = 0;
    this.bondedRatio = 0;
  }

  Particle.prototype.update = function () {
    if (this.explosionCooldown > 0) this.explosionCooldown--;

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.975;
    this.vy *= 0.975;

    if (this.x < 0) { this.x = 0; this.vx *= -1; }
    if (this.x > width) { this.x = width; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; }
    if (this.y > height) { this.y = height; this.vy *= -1; }

    this.vx += (Math.random() - 0.5) * 0.12;
    this.vy += (Math.random() - 0.5) * 0.12;

    if (mouse.x !== null && mouse.y !== null) {
      var mx = mouse.x - this.x;
      var my = mouse.y - this.y;
      var md = Math.sqrt(mx * mx + my * my) || 1;
      if (md < mouse.radius) {
        var mouseForce = (mouse.radius - md) / mouse.radius;
        var pushStrength = mouse.isDown ? 0.35 : 0.08;
        this.vx -= (mx / md) * mouseForce * pushStrength;
        this.vy -= (my / md) * mouseForce * pushStrength;
      }
    }

    if (textRect.width > 0 && textRect.height > 0) {
      var paddingX = 40;
      var paddingY = 25;
      var minX = textRect.x - paddingX;
      var maxX = textRect.x + textRect.width + paddingX;
      var minY = textRect.y - paddingY;
      var maxY = textRect.y + textRect.height + paddingY;

      if (this.x > minX && this.x < maxX && this.y > minY && this.y < maxY) {
        var leftDist = this.x - minX;
        var rightDist = maxX - this.x;
        var topDist = this.y - minY;
        var bottomDist = maxY - this.y;
        var minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
        var pushForce = 0.06;
        if (minDist === leftDist) this.vx -= pushForce;
        else if (minDist === rightDist) this.vx += pushForce;
        else if (minDist === topDist) this.vy -= pushForce;
        else if (minDist === bottomDist) this.vy += pushForce;
      }
    }
  };

  Particle.prototype.getColor = function () {
    var alpha = 0.72 + this.bondedRatio * 0.23;
    return this.element.color.replace(/[\d.]+\)$/, alpha.toFixed(3) + ')');
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.getColor();
    ctx.shadowBlur = this.bondedRatio > 0.4 ? 14 : 6;
    ctx.shadowColor = this.element.color;
    ctx.fill();
    ctx.shadowBlur = 0;

  };

  function createParticles() {
    particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function setMouseFromEvent(event) {
    var point = event.touches && event.touches.length > 0 ? event.touches[0] : event;
    var rect = canvas.getBoundingClientRect();
    mouse.x = point.clientX - rect.left;
    mouse.y = point.clientY - rect.top;
  }

  hero.addEventListener('mousemove', setMouseFromEvent);
  hero.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
    mouse.isDown = false;
  });
  hero.addEventListener('mousedown', function () { mouse.isDown = true; });
  hero.addEventListener('mouseup', function () { mouse.isDown = false; });
  hero.addEventListener('touchstart', function (event) {
    mouse.isDown = true;
    setMouseFromEvent(event);
  }, { passive: true });
  hero.addEventListener('touchmove', setMouseFromEvent, { passive: true });
  hero.addEventListener('touchend', function () {
    mouse.x = null;
    mouse.y = null;
    mouse.isDown = false;
  });

  function updateScene() {
    particles.forEach(function (p) { p.update(); });

    particles.forEach(function (p1) {
      var connections = 0;
      particles.forEach(function (p2) {
        if (p1 === p2 || p1.family !== p2.family) return;
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        if ((dx * dx + dy * dy) < connectionDistance * connectionDistance) connections++;
      });
      p1.bondedRatio += ((connections >= 2 ? 1 : 0) - p1.bondedRatio) * 0.08;
    });

    for (var i = 0; i < particles.length; i++) {
      var p1 = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        if (p1.family !== p2.family) continue;
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 45) {
          if (dist > 12) {
            var attract = ((45 - dist) / 45) * 0.008;
            p1.vx += (dx / dist) * attract;
            p1.vy += (dy / dist) * attract;
            p2.vx -= (dx / dist) * attract;
            p2.vy -= (dy / dist) * attract;
          } else {
            var repel = ((12 - dist) / 12) * 0.08;
            p1.vx -= (dx / dist) * repel;
            p1.vy -= (dy / dist) * repel;
            p2.vx += (dx / dist) * repel;
            p2.vy += (dy / dist) * repel;
          }
        }
      }
    }

    particles.forEach(function (p) {
      if (p.explosionCooldown > 0) return;
      var neighbors = 0;
      particles.forEach(function (other) {
        if (p === other || p.family !== other.family) return;
        var dx = other.x - p.x;
        var dy = other.y - p.y;
        if ((dx * dx + dy * dy) < 18 * 18) neighbors++;
      });

      if (neighbors >= 5) {
        var waveColor = 'rgba(52, 211, 153, 0.7)';
        if (p.family === 'SOIL') waveColor = 'rgba(217, 119, 6, 0.7)';
        if (p.family === 'WATER') waveColor = 'rgba(147, 197, 253, 0.7)';

        particles.forEach(function (other) {
          var dx = other.x - p.x;
          var dy = other.y - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 50) {
            var force = (50 - dist) / 50;
            var speed = 3.5 + Math.random() * 2.5;
            other.vx += (dx / dist) * force * speed;
            other.vy += (dy / dist) * force * speed;
            other.explosionCooldown = 120;
          }
        });

        shockwaves.push({
          x: p.x,
          y: p.y,
          radius: 5,
          maxRadius: 50,
          alpha: 0.65,
          color: waveColor
        });
      }
    });
  }

  function drawScene() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var p1 = particles[i];
        var p2 = particles[j];
        if (p1.family !== p2.family) continue;
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          var alpha = (1 - dist / connectionDistance) * 0.16;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          if (p1.bondedRatio > 0.4 && p2.bondedRatio > 0.4) {
            var grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.getColor());
            grad.addColorStop(1, p2.getColor());
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.25;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.85;
          }
          ctx.stroke();
        }
      }
    }

    for (var s = shockwaves.length - 1; s >= 0; s--) {
      var wave = shockwaves[s];
      wave.radius += 4;
      wave.alpha = Math.max(0, 0.65 * (1 - wave.radius / wave.maxRadius));
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.strokeStyle = wave.color.replace(/[\d.]+\)$/, wave.alpha.toFixed(3) + ')');
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (wave.radius >= wave.maxRadius) shockwaves.splice(s, 1);
    }

    particles.forEach(function (p) { p.draw(); });
  }

  function animateCanvas() {
    updateScene();
    drawScene();
    animId = requestAnimationFrame(animateCanvas);
  }

  function initCanvas() {
    resizeCanvas();
    createParticles();
    drawScene();
    if (!reduceMotion) {
      if (animId) cancelAnimationFrame(animId);
      animateCanvas();
    }
  }

  window.addEventListener('resize', function () {
    resizeCanvas();
    createParticles();
    drawScene();
  });

  if (document.readyState === 'complete') {
    initCanvas();
  } else {
    window.addEventListener('load', initCanvas);
  }
  window.addEventListener('pagehide', function () { if (animId) cancelAnimationFrame(animId); });
}());
</script>

<!-- ═══ Leaflet map ═══ -->
<script src="/assets/js/leaflet.js"></script>
<script>
(function () {
  var mapData = <?= json_encode($homeMapData, JSON_UNESCAPED_UNICODE) ?>;
  var mapEl   = document.getElementById('home-map');
  if (!mapEl) return;

  var map = L.map('home-map', { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  if (mapData.length === 0) { map.setView([15.87, 100.99], 6); return; }

  var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  function thaiShort(d) {
    if (!d) return ''; var dt = new Date(d);
    return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + (dt.getFullYear() + 543);
  }
  var markers = mapData.map(function (item) {
    var m = L.marker([item.lat, item.lng]).addTo(map);
    m.bindPopup('<strong>' + thaiShort(item.date) + '</strong><br><span style="font-size:.85rem">' + item.address + '</span>');
    return m;
  });
  if (markers.length === 1) {
    map.setView([mapData[0].lat, mapData[0].lng], 10);
  } else {
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
  }
  setTimeout(function () { map.invalidateSize(); }, 350);
}());
</script>
