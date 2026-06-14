<?php
session_start();

$cPAGE['name'] = "จองวิเคราะห์ดิน";//"หน้าหลัก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/login";
$cPAGE['desc'] = "จองเพื่อรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

// ตรวจสอบว่า login หรือยัง ถ้ายัง ให้กลับไปหน้า login
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

require_once(__DIR__ . '/../../../services/FarmerAPI.php');


$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

$landData = FarmerAPI::getLandsByFarmerId($farmerId);
$lands = [];
if ($landData['httpCode'] === 200) {
  $lands = $landData['data'];
} else {
  // จัดการกรณี API error
  echo "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน";
  // สามารถแสดงหน้า error ที่สวยงามกว่านี้ได้
  exit;
}

$bookingError = $_SESSION['booking_error'] ?? null;
$bookingSuccess = $_SESSION['booking_success'] ?? null;
unset($_SESSION['booking_error']); // เคลียร์ค่าทิ้งหลังจากอ่าน
unset($_SESSION['booking_success']); // เคลียร์ค่าทิ้งหลังจากอ่าน

// สร้างที่อยู่แบบเต็ม
$fullAddress = ($farmerProfile['address'] ?? '') . ' ' .
  'หมู่ที่ ' . ($farmerProfile['villageNo'] ?? '-') . ' ' .
  'ต.' . ($farmerProfile['subdistrictName'] ?? '') . ' ' .
  'อ.' . ($farmerProfile['districtName'] ?? '') . ' ' .
  'จ.' . ($farmerProfile['provinceName'] ?? '');

function getStatusTag($status)
{
  switch ($status) {
    case 'ไม่ตรวจ':
      return ['class' => 'text-danger', 'text' => 'ปรับปรุงด่วน'];
    case 'จอง':
      return ['class' => 'text-warning', 'text' => 'ควรปรับปรุง'];
    case 'ตรวจ':
      return ['class' => 'text-success', 'text' => 'ปกติ'];
    default:
      return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
  }
}

function getStatusInfo($result)
{
  // [!! FIX !!] เพิ่มการตรวจสอบค่า null หรือ ไม่ใช่ตัวเลข
  if (is_null($result) || !is_numeric($result)) {
    return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
  }

  if ($result > 7.7) {
    return ['class' => 'text-primary', 'text' => 'ดีเยี่ยม'];
  } elseif ($result > 3.3 && $result <= 7.7) {
    return ['class' => 'text-success', 'text' => 'ปกติ'];
  } elseif ($result <= 3.3) {
    return ['class' => 'text-danger', 'text' => 'ปรับปรุงด่วน'];
  }

  // เพิ่ม Fallback กรณีไม่เข้าเงื่อนไขใดเลย
  return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
}

$initialLat = 13.7563;   
$initialLng = 100.5018;

foreach ($lands as $land) {
  if (!empty($land['latitude']) && !empty($land['longitude'])) {
    $initialLat = (float)$land['latitude'];
    $initialLng = (float)$land['longitude'];
    break;
  }
}


include_once(COMPONENT_PATH . 'lib_header.php')
  ?>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Contact Section -->
<!--section id="contact" class="contact section"-->
<!--section id="about-us" class="section about-us"-->
<section id="pricing" class="pricing section">

  <div class="container">

    <?php if ($bookingError): ?>
      <div class="alert alert-danger" role="alert">
        <strong>ล้มเหลว!</strong> <?= htmlspecialchars($bookingError) ?>
      </div>
    <?php endif; ?>
    <?php if ($bookingSuccess): ?>
      <div class="alert alert-success" role="alert">
        <strong>สำเร็จ!</strong> <?= htmlspecialchars($bookingSuccess) ?>
      </div>
    <?php endif; ?>

    <div class="row gy-4" style="text-align: center;">

      <div class="col-lg-4 order-1 order-lg-2 mt-2 mb-2" style="text-align: center; align-content: center;"
        data-aos="fade-up" data-aos-delay="100">
        <div id="land-map" style="height:300px;width:100%;border-radius:10px;border:1px solid #ddd;">
        </div>
      </div>

      <div class="col-lg-4 order-2 order-lg-3 mt-2" style="text-align: center; align-content: center;"
        data-aos="fade-up" data-aos-delay="100">
        <h3>ข้อมูลสมาชิก</h3>

        <table class="table" style="text-align: left; align-content: center;">
          <tbody>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <td><?= htmlspecialchars($farmerProfile['firstName'] . ' ' . $farmerProfile['lastName']) ?></td>
            </tr>
            <tr>
              <th>หมายเลขเกษตรกร</th>
              <td><?= htmlspecialchars($farmerProfile['thaiFarmerId'] ?? '-') ?></td>
            </tr>
            <tr>
              <th>หมายเลขบัตรประชาชน</th>
              <td><?= htmlspecialchars($farmerProfile['thaiNationalIdMasked'] ?? '-') ?></td>
            </tr>
            <tr>
              <th>หมายเลขโทรศัพท์</th>
              <td><?= htmlspecialchars($farmerProfile['phone']) ?></td>
            </tr>
            <tr>
              <th>ที่อยู่</th>
              <td><?= htmlspecialchars(trim($fullAddress)) ?></td>
            </tr>
          </tbody>
        </table>

        <div class="row mt-2">
          <div class="col-md-12" style="left: 25%;">
            <!--a href="/services/book/farmer" class="btn btn-success btn-lg btn-block text-white" style="width: 300px;">ยืนยันการแก้ไขข้อมูล</a-->
            <div class="btn-group mr-2" role="group" aria-label="First group">
              <button onclick="location.href='/services/book/farmer/edit'" type="button"
                class="btn btn-warning text-white" style="width: 150px;">
                <i class="bi bi-brush-fill"></i> แก้ไขข้อมูล</button>
              <button onclick="location.href='/services/book/land/add'" type="button"
                class="btn btn-success" style="width: 150px;">
                <i class="bi bi-pin-map-fill"></i> เพิ่มแปลงปลูก</button>
            </div>
          </div>
        </div>

      </div>

      <div class="col-lg-12 order-3 order-lg-4 mt-2 mb-2" style="text-align: center; align-content: center;"
        data-aos="fade-up" data-aos-delay="100">
        <div class="row mt-2 mb-2">
          <hr>

          <?php if (empty($lands)): ?>
            <p class="text-center">ไม่พบข้อมูลผลการวิเคราะห์ดิน</p>
          <?php else: ?>
            <?php foreach ($lands as $land): ?>
              <?php
              $landStatusTag = getStatusTag($land['landStatus']['status'] ?? 'ไม่มีข้อมูล');
              $landStatusInfo = getStatusInfo($land['landStatus']['resultValue']);
              ?>

              <div class="col-xl-4 col-lg-4 mt-4" data-aos="fade-up" data-aos-delay="400">
                <div class="pricing-item">
                  <h3>
                    <form action="/services/book/land/edit" method="POST" style="display: inline;">
                      <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                      <button type="submit" class="btn btn-warning rounded-circle text-white p-1"
                        style='font-size:10px; width: 25px;'>
                        <i class="bi bi-pin-map-fill"></i>
                      </button>
                    </form>
                    <!-- <form action="/services/book/land/delete" method="POST" style="display: inline;"
                      id="deleteForm-<?= $land['landId'] ?>">
                      
                      <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                      
                      <button type="button" class="btn btn-danger rounded-circle text-white p-1" style='font-size:10px; width: 25px;'
                        data-bs-toggle="modal"
                        data-bs-target="#globalConfirmModal"
                        data-bs-title="ยืนยันการลบแปลง"
                        data-bs-message="คุณต้องการลบแปลง '<?= htmlspecialchars($land['name']) ?>' ใช่หรือไม่? (การจองที่เกี่ยวข้องจะถูกลบไปด้วย)"
                        data-bs-form-id="deleteForm-<?= $land['landId'] ?>">
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </form> -->
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <?= htmlspecialchars($land['name']) ?>
                  </h3>
                  <span
                    class="advanced <?= str_replace('text-', 'bg-', $landStatusTag['class']) ?>"><?= htmlspecialchars($land['landStatus']['status']) ?>

                    <?php
                    // [!! FIX !!] เพิ่ม Logic เช็ค daysRemaining สำหรับสถานะ "จอง"
                    // ถ้ามี daysPassed (สำหรับสถานะ 'ตรวจ')
                    if (!empty($land['landStatus']['daysPassed'])) {
                      echo " + " . htmlspecialchars($land['landStatus']['daysPassed']);
                    }
                    // หรือถ้ามี daysRemaining (สำหรับสถานะ 'จอง')
                    elseif (!empty($land['landStatus']['daysRemaining'])) {
                      echo " + " . htmlspecialchars($land['landStatus']['daysRemaining']);
                    }
                    ?>
                  </span>
                  <p>พื้นที่แปลง <?= htmlspecialchars($land['areaSize'] ?? '-') ?> ไร่</p>
                  <p>พิกัด <?= htmlspecialchars($land['latitude'] ?? '-') ?>,
                    <?= htmlspecialchars($land['longitude'] ?? '-') ?>
                  </p>
                  <p>ขอบเขตแปลง ..............</p>

                  <?php
                  // [!! FIX !!] 
                  // เปลี่ยนเงื่อนไขเป็น: "ถ้ามีข้อมูลวันที่ตรวจล่าสุด (analysisDate) เท่านั้น"
                  // 'empty()' จะเช็คทั้ง null และ string ว่าง
                  if (!empty($land['landStatus']['analysisDate'])):
                    ?>
                    <p>ตรวจล่าสุด <?= htmlspecialchars($land['landStatus']['analysisDate']) ?>
                      (<?= htmlspecialchars($land['landStatus']['daysPassed'] ?? '-') ?> วัน) </p>
                    <h6 class="<?= $landStatusInfo['class'] ?>">ผลตรวจล่าสุด
                      <?= htmlspecialchars($landStatusInfo['text'] ?? '-') ?>
                    </h6>
                  <?php endif; ?>

                  <div class="d-flex justify-content-center">
                    <?php if ($land['landStatus']['status'] == 'ไม่ตรวจ'): ?>

                      <!-- ยังไม่ตรวจ = มีปุ่มจอง -->
                      <!-- <a href="/services/book/create-booking?landId=<?= $land['landId'] ?>"
                        class="btn btn-primary text-white" style="font-size:15px; width:200px;">
                        <i class="bi bi-cart-plus-fill"></i> จองเลย
                      </a> -->
                      <form action="/services/book/create-booking" method="POST">
                        <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                        <button type="submit" class="btn btn-primary text-white" style="font-size:15px; width:200px;">
                          <i class="bi bi-cart-plus-fill"></i> จองเลย
                        </button>
                      </form>


                    <?php elseif ($land['landStatus']['status'] == 'จอง'): ?>

                      <!-- สถานะ: จอง -->
                      <div class="d-flex gap-2">
                        <!-- <button
                          onclick="location.href='/services/book/update-booking?bookId=<?= $land['landStatus']['bookId'] ?>&landId=<?= $land['landId'] ?>'"
                          type="button" class="btn btn-warning text-white" style="width:120px;">
                          <i class="bi bi-cart-x-fill"></i> เปลี่ยน
                        </button>

                        <button type="button" class="btn btn-secondary text-white" style="min-width:160px;">
                          จอง <?= htmlspecialchars($land['landStatus']['bookedDate'] ?? '-') ?>
                        </button>

                        <button
                          onclick="if(confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) { location.href='/services/book/cancel-booking?bookId=<?= $land['landStatus']['bookId'] ?>' }"
                          type="button" class="btn btn-danger text-white" style="width:120px;">
                          <i class="bi bi-cart-dash-fill"></i> ยกเลิก
                        </button> -->

                        <form action="/services/book/update-booking" method="POST">
                          <input type="hidden" name="bookId" value="<?= $land['landStatus']['bookId'] ?>">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-warning text-white" style="width:120px;">
                            <i class="bi bi-cart-x-fill"></i> เปลี่ยน
                          </button>
                        </form>

                        <button type="button" class="btn btn-secondary text-white" style="min-width:160px;">
                          จอง <?= htmlspecialchars($land['landStatus']['bookedDate'] ?? '-') ?>
                        </button>

                        <form action="/services/book/cancel-booking" method="POST"
                          id="cancelForm-<?= $land['landStatus']['bookId'] ?>">

                          <input type="hidden" name="bookId" value="<?= $land['landStatus']['bookId'] ?>">

                          <button type="button" class="btn btn-danger text-white" style="width:120px;" data-bs-toggle="modal"
                            data-bs-target="#globalConfirmModal" data-bs-title="ยืนยันการยกเลิก"
                            data-bs-message="คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?"
                            data-bs-form-id="cancelForm-<?= $land['landStatus']['bookId'] ?>">
                            <i class="bi bi-cart-dash-fill"></i> ยกเลิก
                          </button>
                        </form>
                      </div>


                    <?php elseif ($land['landStatus']['status'] == 'ตรวจ'): ?>

                      <!-- สถานะ: ตรวจแล้ว = ปุ่มซ้อนบนล่าง -->
                      <div class="d-flex flex-column align-items-center" style="width:180px;">
                        <!-- <a href="/services/book/create-booking?landId=<?= $land['landId'] ?>"
                          class="btn btn-primary text-white mb-2 w-100" style="font-size:15px;">
                          <i class="bi bi-cart-plus-fill"></i> จองเลย
                        </a> -->
                        <form action="/services/book/create-booking" method="POST" class="w-100 mb-2">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-primary text-white w-100" style="font-size:15px;">
                            <i class="bi bi-cart-plus-fill"></i> จองเลย
                          </button>
                        </form>

                        <form action="services/report/summary" method="POST" class="w-100">
                          <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                          <button type="submit" class="btn btn-success text-white w-100" style="font-size:15px;">
                            <i class="bi bi-bar-chart-line-fill"></i> ผลวิเคราะห์
                          </button>
                        </form>
                      </div>

                    <?php endif; ?>
                  </div>

                </div>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>

        </div>
      </div>

      <?php include_once(COMPONENT_PATH . 'service.php') ?>


    </div>

  </div>


</section><!-- /Contact Section -->


<?php include_once(COMPONENT_PATH . "lib_footer.php") ?>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {

  const initialLat = <?= json_encode($initialLat) ?>;
  const initialLng = <?= json_encode($initialLng) ?>;

  const map = L.map('land-map').setView([initialLat, initialLng], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const lands = <?= json_encode($lands, JSON_UNESCAPED_UNICODE) ?>;
  const markers = [];

  lands.forEach(land => {
    if (land.latitude && land.longitude) {

      const lat = parseFloat(land.latitude);
      const lng = parseFloat(land.longitude);

      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <b>${land.name}</b><br>
          พื้นที่: ${land.areaSize ?? '-'} ไร่<br>
          สถานะ: ${land.landStatus?.status ?? '-'}
        `);

      markers.push(marker);
    }
  });

  // zoom ครอบทุกหมุด
  if (markers.length > 1) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  }
});
</script>
