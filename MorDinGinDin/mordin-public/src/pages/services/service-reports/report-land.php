<?php
// หมายเหตุ: หาก index.php มีการ session_start() อยู่แล้ว 
// บรรทัดนี้อาจทำให้เกิด Error "headers already sent" สามารถลบออกได้หากแก้ไขที่ index.php แล้ว
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ตรวจสอบว่า login หรือยัง
if (!isset($_SESSION['farmer_profile'])) {
    header('Location: /services/report/login');
    exit;
}

require_once(__DIR__ . '/../../../services/FarmerAPI.php');
require_once(__DIR__ . '/../../../components/map_marker.php'); 

$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];

// ดึงข้อมูลรายงานตามแปลง
$reportsData = FarmerAPI::getReportsByLand($farmerId);
$landsWithReports = [];
if ($reportsData['httpCode'] === 200) {
    $landsWithReports = $reportsData['data'];
} else {
    echo "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน";
    exit;
}

// สร้างที่อยู่แบบเต็ม
$fullAddress = ($farmerProfile['address'] ?? '') . ' ' .
    'หมู่ที่ ' . ($farmerProfile['villageNo'] ?? '-') . ' ' .
    'ต.' . ($farmerProfile['subdistrictName'] ?? '') . ' ' .
    'อ.' . ($farmerProfile['districtName'] ?? '') . ' ' .
    'จ.' . ($farmerProfile['provinceName'] ?? '');


$cPAGE['name']  = "รายงานการวิเคราะห์ดิน";
$cPAGE['alias'] = "service";
$cPAGE['desc']  = "ผลการวิเคราะห์ดินของ " . htmlspecialchars($farmerProfile['firstName']);

// ฟังก์ชันสำหรับคำนวณอายุของผลตรวจ
function getReportAgeText($timestamp) {
    if (!$timestamp) return "-";
    $collectDate = new DateTime("@" . ($timestamp / 1000));
    $now = new DateTime();
    $interval = $now->diff($collectDate);
    if ($interval->y > 0) return $interval->y . " ปี " . $interval->m . " เดือน";
    if ($interval->m > 0) return $interval->m . " เดือน";
    return $interval->d . " วัน";
}

// ฟังก์ชันสถานะ
function getStatusInfo($status) {
    switch ($status) {
        case 'ปรับปรุงด่วน': return ['class' => 'text-danger', 'text' => 'ปรับปรุงด่วน'];
        case 'ควรปรับปรุง': return ['class' => 'text-warning', 'text' => 'ควรปรับปรุง'];
        case 'ปกติ': return ['class' => 'text-success', 'text' => 'ปกติ'];
        default: return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
    }
}

$initialLat = 16.3765;
$initialLng = 102.1234;

foreach ($landsWithReports as $land) {
    if (!empty($land['land']['latitude']) && !empty($land['land']['longitude'])) {
        $initialLat = (float)$land['land']['latitude'];
        $initialLng = (float)$land['land']['longitude'];
        break;
    }
}


include_once(COMPONENT_PATH . 'lib_header.php');
?>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<section id="pricing" class="pricing section">
    <div class="container">
        <div class="row gy-4" style="text-align: center;">
            <div class="col-lg-4 order-1 order-lg-2 mt-2 mb-2" data-aos="fade-up" data-aos-delay="100">
                <div id="land-map" style="height:350px;width:100%;border-radius:10px;border:1px solid #ddd;"></div>
            </div>

            <div class="col-lg-4 order-2 order-lg-3 mt-2" data-aos="fade-up" data-aos-delay="100">
                <h3>ข้อมูลสมาชิก</h3>
                <table class="table" style="text-align: left;">
                    <tbody>
                        <tr><th>ชื่อ-นามสกุล</th><td><?= htmlspecialchars($farmerProfile['firstName'] . ' ' . $farmerProfile['lastName']) ?></td></tr>
                        <tr><th>หมายเลขเกษตรกร</th><td><?= htmlspecialchars($farmerProfile['thaiFarmerId'] ?? '-') ?></td></tr>
                        <tr><th>หมายเลขบัตรประชาชน</th><td><?= htmlspecialchars($farmerProfile['thaiNationalIdMasked'] ?? '-') ?></td></tr>
                        <tr><th>หมายเลขโทรศัพท์</th><td><?= htmlspecialchars($farmerProfile['phone']) ?></td></tr>
                        <tr><th>ที่อยู่</th><td><?= htmlspecialchars(trim($fullAddress)) ?></td></tr>
                    </tbody>
                </table>
                <div class="row mt-2">
                    <div class="col-md-12 text-center">
                        <a href="services/book/farmer" class="btn btn-success btn-lg btn-block text-white" style="width: 300px;">แก้ไขข้อมูลและจัดการแปลง</a>
                    </div>
                </div>
            </div>

            <div class="col-lg-12 order-3 order-lg-4 mt-2 mb-2" data-aos="fade-up" data-aos-delay="100">
                <hr class="my-4">
                <div class="row gy-4">
                    <h3 class="text-center">รายการผลวิเคราะห์ดิน</h3>
                    <?php if (empty($landsWithReports)) : ?>
                        <p class="text-center">ไม่พบข้อมูลผลการวิเคราะห์ดิน</p>
                    <?php else : ?>
                        <?php foreach ($landsWithReports as $land) : ?>
                            <div class="col-xl-4 col-lg-6 mt-4">
                                <div class="pricing-item">
                                    <h3><?= htmlspecialchars($land['land']['name']) ?></h3>
                                    <?php
                                    $landStatusInfo = getStatusInfo($land['overallStatus'] ?? $land['reports'][0]['statusText'] ?? 'ไม่มีข้อมูล');
                                    $latestReportTimestamp = $land['reports'][0]['collectSampleAt'] ?? null;
                                    ?>
                                    <span class="advanced <?= str_replace('text-', 'bg-', $landStatusInfo['class']) ?>">
                                        <?= getReportAgeText($latestReportTimestamp) ?>
                                    </span>

                                    <p>พื้นที่แปลง <?= htmlspecialchars($land['land']['areaSize'] ?? '-') ?> ไร่</p>
                                    <p>พิกัด <?= htmlspecialchars($land['land']['latitude'] ?? '-') ?>, <?= htmlspecialchars($land['land']['longitude'] ?? '-') ?></p>
                                    <p>รหัสโคต้าอ้อย <?= htmlspecialchars($land['land']['quotaCode'] ?? '-') ?></p>

                                    <form action="services/report/summary" method="POST">
                                        <input type="hidden" name="landId" value="<?= $land['landId'] ?>">
                                        <button type="submit" class="btn btn-primary me-md-2 text-white mb-3" style="font-size:15px; width:200px;">
                                            <i class="bi bi-bar-chart-line-fill"></i> รายงานสรุป
                                        </button>
                                    </form>

                                    <?php if (empty($land['reports'])) : ?>
                                        <p><em>ไม่มีรายงานสำหรับแปลงนี้</em></p>
                                    <?php else : ?>
                                        <table class="table" style="text-align: left;">
                                            <tbody>
                                                <?php
                                                $approvedReports = array_filter($land['reports'], function ($report) {
                                                    return isset($report['status']) && $report['status'] === 'approved';
                                                });
                                                ?>
                                                <?php if (empty($approvedReports)): ?>
                                                    <tr><td colspan="3" class="text-center"><em>ไม่มีรายงานที่อนุมัติ</em></td></tr>
                                                <?php else: ?>
                                                    <?php foreach ($approvedReports as $report) : ?>
                                                        <?php $reportStatusInfo = getStatusInfo($report['statusText'] ?? 'ไม่มีข้อมูล'); ?>
                                                        <tr>
                                                            <th><span class="<?= $reportStatusInfo['class'] ?>"><?= $reportStatusInfo['text'] ?></span></th>
                                                            <td><?= $report['collectSampleAt'] ? date('d-m-Y', $report['collectSampleAt'] / 1000) : '-' ?></td>
                                                            <td>
                                                                <a href="services/report/pdf?sampleCode=<?= urlencode($report['sampleCode']) ?>" class="btn btn-primary rounded-circle text-white p-1" style='font-size:10px; width: 25px;' target="_blank">
                                                                    <i class="bi bi-clipboard-data"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    <?php endforeach; ?>
                                                <?php endif; ?>
                                            </tbody>
                                        </table>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
            <?php include_once(COMPONENT_PATH . 'service.php') ?>
        </div>
    </div>
</section>

<?php include_once(COMPONENT_PATH . 'lib_footer.php') ?>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {

    const initialLat = <?= json_encode($initialLat) ?>;
    const initialLng = <?= json_encode($initialLng) ?>;

    const map = L.map('land-map').setView([initialLat, initialLng], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const lands = <?= json_encode($landsWithReports, JSON_UNESCAPED_UNICODE) ?>;

    const markers = [];

    lands.forEach(item => {
        const land = item.land;

        if (land.latitude && land.longitude) {
            const lat = parseFloat(land.latitude);
            const lng = parseFloat(land.longitude);

            const marker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <b>${land.name}</b><br>
                    พื้นที่: ${land.areaSize ?? '-'} ไร่<br>
                    โควต้า: ${land.quotaCode ?? '-'}
                `);

            markers.push(marker);
        }
    });

    if (markers.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.3));
    }
});
</script>
