<?php
session_start();

// ตรวจสอบว่า login หรือยัง ถ้ายัง ให้กลับไปหน้า login
if (!isset($_SESSION['farmer_profile'])) {
        header('Location: /services/report/login');
        exit;
}

require_once(__DIR__ . '/../../../services/FarmerAPI.php');

$config = require(__DIR__ . '/../../../config/config.php');

$farmerProfile = $_SESSION['farmer_profile'];
$farmerId = $farmerProfile['farmerId'];
$landId = $_POST['landId'] ?? $_GET['landId'] ?? $_SESSION['selected_report_land_id'] ?? null;

if (!$landId || !filter_var($landId, FILTER_VALIDATE_INT)) {
        header('Location: /services/report/land');
        exit;
}

$_SESSION['selected_report_land_id'] = (int)$landId;

$fullAddress = ($farmerProfile['address'] ?? '') . ' ' .
        'หมู่ที่ ' . ($farmerProfile['villageNo'] ?? '-') . ' ' .
        'ต.' . ($farmerProfile['subdistrictName'] ?? '') . ' ' .
        'อ.' . ($farmerProfile['districtName'] ?? '') . ' ' .
        'จ.' . ($farmerProfile['provinceName'] ?? '');

$response = FarmerAPI::getSummaryReportByLand($landId);
$summaryData = [];
if ($response['httpCode'] === 200) {
        $summaryData = $response['data'][0];
} else {
        // จัดการกรณี API error
        echo "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน";
        // สามารถแสดงหน้า error ที่สวยงามกว่านี้ได้
        exit;
}


// กรองเอาเฉพาะ report ที่มี status เป็น 'approved'
$approvedReports = array_values(array_filter(
        $summaryData['reports'],
        function ($report) {
                return isset($report['status']) && $report['status'] === 'approved';
        }
));

$cPAGE['name']  = "รายงานการวิเคราะห์ดิน"; //"หน้าหลัก";
$cPAGE['alias'] = "service";
$cPAGE['link']  = "service-report.php";
$cPAGE['desc']  = "ผลการวิเคราะห์ดินจาการรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

// ฟังก์ชันสำหรับคำนวณอายุของผลตรวจ (เป็นข้อความ)
function getReportAgeText($timestamp)
{
        if (!$timestamp) return "-";
        $collectDate = new DateTime("@" . ($timestamp / 1000));
        $now = new DateTime();
        $interval = $now->diff($collectDate);

        if ($interval->y > 0) return $interval->y . " ปี " . $interval->m . " เดือน";
        if ($interval->m > 0) return $interval->m . " เดือน";
        return $interval->d . " วัน";
}

// ฟังก์ชันสำหรับกำหนดสีและข้อความของสถานะ
function getStatusInfo($status)
{
        switch ($status) {
                case 'ปรับปรุงด่วน':
                        return ['class' => 'text-danger', 'text' => 'ปรับปรุงด่วน'];
                case 'ควรปรับปรุง':
                        return ['class' => 'text-warning', 'text' => 'ควรปรับปรุง'];
                case 'ปกติ':
                        return ['class' => 'text-success', 'text' => 'ปกติ'];
                default:
                        return ['class' => 'text-secondary', 'text' => 'ไม่มีข้อมูล'];
        }
}

include_once(COMPONENT_PATH . 'lib_header.php')
?>


<!-- Contact Section -->
<!--section id="contact" class="contact section"-->
<!--section id="about-us" class="section about-us"-->
<section id="pricing" class="pricing section">

        <div class="container">

                <div class="row gy-4" style="text-align: center;">

                        <div class="col-lg-4 order-2 order-lg-3 mt-2 mb-2" style="text-align: center; align-content: center;" data-aos="fade-up" data-aos-delay="100">

                                <div class="pricing-item">
                                        <h3><?= htmlspecialchars($summaryData['land']['name'] ?? '-') ?></h3>

                                        <?php
                                        // สมมติว่า API ส่งสถานะโดยรวมของแปลงมา, ถ้าไม่มีให้ใช้สถานะของรายงานล่าสุด
                                        $landStatusInfo = getStatusInfo($summaryData['overallStatus'] ?? $summaryData['reports'][0]['statusText'] ?? 'ไม่มีข้อมูล');
                                        $latestReportTimestamp = $summaryData['reports'][0]['collectSampleAt'] ?? null;
                                        ?>

                                        <span class="advanced <?= str_replace('text-', 'bg-', $landStatusInfo['class']) ?>">
                                                <?= getReportAgeText($latestReportTimestamp) ?>
                                        </span>
                                        <p><?= htmlspecialchars('พื้นที่แปลง ' . $summaryData['land']['areaSize'] . ' ไร่' ?? '-') ?></p>
                                        <p>พิกัด <?= htmlspecialchars($summaryData['land']['latitude'] ?? '-') ?>, <?= htmlspecialchars($summaryData['land']['longitude'] ?? '-') ?></p>
                                        <p>ขอบเขตแปลง ..............</p>
                                        <p>รหัสโคต้าอ้อย <?= htmlspecialchars($summaryData['land']['quotaCode'] ?? '-') ?></p>


                                        <a href="services/report/summary?landId=<?= urlencode((string)$summaryData['land']['landId']) ?>" class="btn btn-primary me-md-2 text-white" style='font-size:15px; width: 200px;'><i class="bi bi-bar-chart-line-fill"></i> รายงานสรุป</a>

                                        <?php if (empty($summaryData['reports'])) : ?>
                                                <p><em>ไม่มีรายงานสำหรับแปลงนี้</em></p>
                                        <?php else : ?>
                                                <table class="table" style="text-align: left;">
                                                        <tbody>
                                                                <?php if (empty($approvedReports)): ?>
                                                                        <tr>
                                                                                <td colspan="3" class="text-center"><em>ไม่มีรายงานที่อนุมัติ</em></td>
                                                                        </tr>
                                                                <?php else: ?>
                                                                        <?php foreach ($approvedReports as $report) : ?>
                                                                                <?php $reportStatusInfo = getStatusInfo($report['statusText'] ?? 'ไม่มีข้อมูล'); ?>
                                                                                <tr>
                                                                                        <th><span class="<?= $reportStatusInfo['class'] ?>"><?= $reportStatusInfo['text'] ?></span></th>
                                                                                        <td>
                                                                                                <?= $report['collectSampleAt'] ? date('d-m-Y', $report['collectSampleAt'] / 1000) : '-' ?>
                                                                                        </td>
                                                                                        <td>
                                                                                                <a href="services/report/pdf?sampleCode=<?= urlencode($report['sampleCode']) ?>"
                                                                                                        class="btn btn-primary rounded-circle text-white p-1"
                                                                                                        style='font-size:10px; width: 25px;'
                                                                                                        target="_blank">
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

                        <div class="col-lg-4 order-1 order-lg-2 mt-2" style="text-align: center; align-content: center;" data-aos="fade-up" data-aos-delay="100">
                                <h3>ข้อมูลสมาชิก</h3>

                                <table class="table" style="text-align: left; align-content: center;">
                                        <tbody>
                                                <tr>
                                                        <th> ชื่อ-นามสกุล</th>
                                                        <td><?= htmlspecialchars($farmerProfile['firstName'] . ' ' . $farmerProfile['lastName']) ?></td>
                                                </tr>
                                                <tr>
                                                        <th> หมายเลขเกษตรกร</th>
                                                        <td><?= htmlspecialchars($farmerProfile['thaiFarmerId'] ?? '-') ?></td>
                                                </tr>

                                                <tr>
                                                        <th> หมายเลขบัตรประชาชน</th>
                                                        <td><?= htmlspecialchars($farmerProfile['thaiNationalIdMasked'] ?? '-') ?></td>
                                                </tr>
                                                <tr>
                                                        <th> หมายเลขโทรศัพท์</th>
                                                        <td><?= htmlspecialchars($farmerProfile['phone']) ?></td>
                                                </tr>
                                                <tr>
                                                        <th> ที่อยู่</th>
                                                        <td><?= htmlspecialchars(trim($fullAddress)) ?></td>
                                                </tr>
                                        </tbody>
                                </table>

                                <div class="row mt-2">
                                        <div class="col-md-12" style="left: 25%;">
                                                <a href="services/report/land" class="btn btn-success btn-lg btn-block text-white" style="width: 300px;">ดูรายงานผลทุกแปลง</a>
                                                <!--div class="btn-group mr-2" role="group" aria-label="First group">
				<button onclick="location.href='/services/book/farmer/edit'"  type="button" 
					class="btn btn-warning text-white" style="width: 150px;" >
					 <i class="bi bi-brush-fill"></i> แก้ไขข้อมูล</button>
				<button onclick="location.href='/services/book/land/add'" type="button" 
					class="btn btn-success" style="width: 150px;">
					<i class="bi bi-pin-map-fill"></i> เพิ่มแปลงปลูก</button>
  			</div-->
                                        </div>
                                </div>

                        </div>

                        <div class="col-lg-12 order-3 order-lg-4 mt-2 mb-2" style="text-align: center; align-content: center;" data-aos="fade-up" data-aos-delay="100">
                                <div class="row mt-2 mb-2">
                                        <hr>
                                        <?php
                                        // หาเวลาของ Report แรกสุด กับ Report ล่าสุด
                                        $approvedReportsLength = count($approvedReports);
                                        $latestDate = '-';
                                        $earliestDate = '-';
                                        if ($approvedReportsLength > 0) {
                                                $latestCollectSampleAt = $approvedReports[0]['collectSampleAt'] ?? null;
                                                $earliestCollectSampleAt = $approvedReports[$approvedReportsLength - 1]['collectSampleAt'] ?? null;
                                                $latestDate = $latestCollectSampleAt ? date('d-m-Y', $latestCollectSampleAt / 1000) : '-';
                                                $earliestDate = $earliestCollectSampleAt ? date('d-m-Y', $earliestCollectSampleAt / 1000) : '-';
                                        }
                                        ?>

                                        <h4> รายงานสรุป&nbsp;<?= htmlspecialchars($summaryData['land']['name']) ?> <?= htmlspecialchars($latestDate) ?>&nbsp;ถึง&nbsp;<?= htmlspecialchars($earliestDate) ?> </h4>

                                        <div class="col-xl-12 col-lg-12 mt-4" data-aos="fade-up" data-aos-delay="400">
                                                <iframe style="border:0; width: 100%; height: 1000px;" src="<?= $config['api_base_url'] . 'farmers/land-summary-report/' . $summaryData['land']['landId'] . '/pdf' ?>"
                                                        frameborder="0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>


                                        </div>

                                </div>
                        </div>


                        <?php include_once(COMPONENT_PATH . 'service.php') ?>


                </div>

        </div>

</section><!-- /Contact Section -->

<?php include_once(COMPONENT_PATH . 'lib_footer.php') ?>
