<?php
session_start();

if (!isset($_SESSION['farmer_profile'])) {
        header('Location: /services/report/login');
        exit;
}

require_once __DIR__ . '/../../../services/FarmerAPI.php';

$config = require_once __DIR__ . '/../../../config/config.php';

$farmerProfile = $_SESSION['farmer_profile'];
$landId = filter_var($_POST['landId'] ?? null, FILTER_VALIDATE_INT);

if (!$landId || $landId <= 0) {
        header('Location: /services/report/land');
        exit;
}

// ตรวจสอบความเป็นเจ้าของแปลงก่อนดึงรายงาน (กัน IDOR)
$ownerCheck = FarmerAPI::getLandById($landId);
if (!($ownerCheck['success'] ?? false) || ($ownerCheck['data']['farmerId'] ?? null) != ($farmerProfile['farmerId'] ?? null)) {
        header('Location: /services/report/land');
        exit;
}

$fullAddress = trim(
        ($farmerProfile['address'] ?? '') . ' ' .
                'หมู่ที่ ' . ($farmerProfile['villageNo'] ?? '-') . ' ' .
                'ต.' . ($farmerProfile['subdistrictName'] ?? '') . ' ' .
                'อ.' . ($farmerProfile['districtName'] ?? '') . ' ' .
                'จ.' . ($farmerProfile['provinceName'] ?? '')
);

$response = FarmerAPI::getSummaryReportByLand($landId);
$summaryData = [];

if (($response['httpCode'] ?? 500) === 200 && !empty($response['data'][0])) {
        $summaryData = $response['data'][0];
} else {
        echo "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน";
        exit;
}

$reports = $summaryData['reports'] ?? [];
$approvedReports = array_values(array_filter(
        $reports,
        function ($report) {
                return ($report['status'] ?? null) === 'approved';
        }
));

function getReportAgeText($timestamp)
{
        if (!$timestamp) {
                return '-';
        }

        $collectDate = new DateTime('@' . ($timestamp / 1000));
        $now = new DateTime();
        $interval = $now->diff($collectDate);

        if ($interval->y > 0) {
                return $interval->y . ' ปี ' . $interval->m . ' เดือน';
        }

        if ($interval->m > 0) {
                return $interval->m . ' เดือน';
        }

        return $interval->d . ' วัน';
}

function getStatusInfo($status)
{
        switch ($status) {
                case 'approved':
                        return ['class' => 'text-success', 'text' => 'อนุมัติแล้ว'];
                case 'analyzed':
                        return ['class' => 'text-info', 'text' => 'วิเคราะห์ครบแล้ว'];
                case 'analyzing':
                        return ['class' => 'text-primary', 'text' => 'กำลังวิเคราะห์'];
                case 'received':
                        return ['class' => 'text-primary', 'text' => 'รับตัวอย่างแล้ว'];
                case 'collected':
                        return ['class' => 'text-warning', 'text' => 'เก็บตัวอย่างแล้ว'];
                case 'distributed':
                        return ['class' => 'text-secondary', 'text' => 'จ่ายชุดเก็บตัวอย่าง'];
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

function getDisplayStatusInfo($report, $fallbackStatus = null)
{
        if (!empty($report['statusText'])) {
                return getStatusInfo($report['statusText']);
        }

        return getStatusInfo($report['status'] ?? $fallbackStatus);
}

$latestApprovedReport = $approvedReports[0] ?? null;
$latestReport = $reports[0] ?? null;
$landStatusInfo = getDisplayStatusInfo(
        $latestApprovedReport ?? $latestReport ?? [],
        $summaryData['overallStatus'] ?? null
);
$latestReportTimestamp = $latestApprovedReport['collectSampleAt'] ?? $latestReport['collectSampleAt'] ?? null;

$approvedReportsLength = count($approvedReports);
$latestDate = $approvedReportsLength > 0 && !empty($approvedReports[0]['collectSampleAt'])
        ? date('d-m-Y', $approvedReports[0]['collectSampleAt'] / 1000)
        : '-';
$earliestDate = $approvedReportsLength > 0 && !empty($approvedReports[$approvedReportsLength - 1]['collectSampleAt'])
        ? date('d-m-Y', $approvedReports[$approvedReportsLength - 1]['collectSampleAt'] / 1000)
        : '-';

$cPAGE['name'] = "รายงานการวิเคราะห์ดิน";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "service-report.php";
$cPAGE['desc'] = "ผลการวิเคราะห์ดินจากการรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";
$cPAGE['hide_page_title'] = true;

include_once COMPONENT_PATH . 'lib_header.php';
?>
<div class="public-farmer-toolbar">
  <div class="public-segment-tabs" role="navigation" aria-label="เมนูจองและผลวิเคราะห์ดิน">
    <a href="services/book/farmer" class="public-segment-tab">จองวิเคราะห์ดิน</a>
    <a href="services/report/land" class="public-segment-tab is-active">ผลวิเคราะห์ดิน</a>
  </div>
</div>

<section class="section public-report-page public-report-summary-page">
  <div class="container">

    <!-- Header -->
    <div class="mp-report-header mb-4">
      <div>
        <button type="button" class="public-back-button mb-2" onclick="history.back()">
          <i class="bi bi-arrow-left" aria-hidden="true"></i> ย้อนกลับ
        </button>
        <h2 class="mp-report-title"><?= htmlspecialchars($summaryData['land']['name'] ?? '-') ?></h2>
        <p class="mp-report-sub">
          พื้นที่ <strong><?= htmlspecialchars($summaryData['land']['areaSize'] ?? '-') ?> ไร่</strong>
          &nbsp;·&nbsp; รหัสโควต้าอ้อย <strong><?= htmlspecialchars($summaryData['land']['quotaCode'] ?? '-') ?></strong>
        </p>
      </div>
    </div>

    <!-- Report history mini-table -->
    <?php if (!empty($approvedReports)): ?>
    <div class="mp-table-card mb-4">
      <div class="table-responsive">
        <table class="table mp-report-tbl">
          <thead>
            <tr>
              <th>รหัสตัวอย่าง</th>
              <th>วันที่ส่งตรวจ</th>
              <th>สถานะ</th>
              <th class="text-end">เอกสาร</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($approvedReports as $report):
              $st = $report['statusText'] ?? ($report['status'] ?? '-');
              switch ($st) {
                case 'ปรับปรุงด่วน': $pill = '<span class="mp-status-pill mp-status-urgent"><span class="mp-status-dot"></span>ปรับปรุงด่วน</span>'; break;
                case 'ควรปรับปรุง':  $pill = '<span class="mp-status-pill mp-status-warn"><span class="mp-status-dot"></span>ควรปรับปรุง</span>';  break;
                case 'ปกติ':         $pill = '<span class="mp-status-pill mp-status-done"><span class="mp-status-dot"></span>ปกติ</span>';          break;
                default:             $pill = '<span class="mp-status-pill mp-status-neutral"><span class="mp-status-dot"></span>' . htmlspecialchars($st) . '</span>';
              }
            ?>
            <tr class="mp-report-row">
              <td class="mp-sample-code"><?= htmlspecialchars($report['sampleCode'] ?? '-') ?></td>
              <td class="text-muted"><?= !empty($report['collectSampleAt']) ? date('d/m/Y', $report['collectSampleAt'] / 1000) : '-' ?></td>
              <td><?= $pill ?></td>
              <td class="text-end">
                <a href="services/report/pdf?sampleCode=<?= urlencode($report['sampleCode'] ?? '') ?>"
                   target="_blank" class="mp-pdf-link">
                  <i class="bi bi-file-earmark-pdf-fill text-danger"></i> ดูรายงาน
                </a>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
    <?php endif; ?>

    <!-- Summary PDF iframe -->
    <div class="public-pdf-card">
      <div class="public-pdf-header">
        <h4>รายงานสรุป &nbsp;<?= htmlspecialchars($summaryData['land']['name'] ?? '-') ?></h4>
        <p><?= htmlspecialchars($latestDate) ?> ถึง <?= htmlspecialchars($earliestDate) ?></p>
      </div>
      <iframe
        title="รายงานสรุปผลวิเคราะห์ดิน"
        class="public-report-frame"
        src="/services/report/pdf?landId=<?= urlencode($summaryData['land']['landId'] ?? '') ?>"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>

  </div>
</section>

<?php include_once COMPONENT_PATH . 'lib_footer.php' ?>