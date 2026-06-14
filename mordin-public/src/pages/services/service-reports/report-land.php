<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['farmer_profile'])) {
    header('Location: /services/book/login?next=report');
    exit;
}

require_once __DIR__ . '/../../../services/FarmerAPI.php';

$farmerProfile  = $_SESSION['farmer_profile'];
$farmerId       = $farmerProfile['farmerId'];
$quotaCode      = htmlspecialchars($farmerProfile['thaiFarmerId'] ?? '-');
$farmerName     = htmlspecialchars(trim(
    ($farmerProfile['firstName'] ?? '') . ' ' . ($farmerProfile['lastName'] ?? '')
));

$reportsData     = FarmerAPI::getReportsByLand($farmerId);
$landsWithReports = [];
if (($reportsData['httpCode'] ?? 500) === 200) {
    $landsWithReports = $reportsData['data'];
}

// Flatten: รวม report ทุกรายการ (approved เท่านั้น) พร้อม land info
$allRows = [];
foreach ($landsWithReports as $landItem) {
    $land      = $landItem['land'] ?? [];
    $landName  = $land['name']     ?? '-';
    $areaSize  = $land['areaSize'] ?? '-';
    $reports   = $landItem['reports'] ?? [];

    foreach ($reports as $report) {
        if (($report['status'] ?? '') !== 'approved') {
            continue;
        }
        $allRows[] = [
            'sampleCode'      => $report['sampleCode']      ?? '-',
            'landName'        => $landName,
            'areaSize'        => $areaSize,
            'collectSampleAt' => $report['collectSampleAt'] ?? null,
            'statusText'      => $report['statusText']      ?? ($report['status'] ?? '-'),
        ];
    }
}

// เรียงตามวันที่ล่าสุดก่อน
usort($allRows, fn($a, $b) => ($b['collectSampleAt'] ?? 0) <=> ($a['collectSampleAt'] ?? 0));

function statusPill(string $status): string
{
    switch ($status) {
        case 'ปรับปรุงด่วน':
            return '<span class="mp-status-pill mp-status-urgent">'
                 . '<span class="mp-status-dot"></span>ปรับปรุงด่วน</span>';
        case 'ควรปรับปรุง':
            return '<span class="mp-status-pill mp-status-warn">'
                 . '<span class="mp-status-dot"></span>ควรปรับปรุง</span>';
        case 'ปกติ':
            return '<span class="mp-status-pill mp-status-done">'
                 . '<span class="mp-status-dot"></span>ปกติ</span>';
        default:
            return '<span class="mp-status-pill mp-status-neutral">'
                 . '<span class="mp-status-dot"></span>'
                 . htmlspecialchars($status) . '</span>';
    }
}

function thaiMonth(int $m): string
{
    $months = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
               'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return $months[$m] ?? '';
}

function formatThaiDate(?int $ts): string
{
    if (!$ts) return '-';
    $d = (int) date('j',  $ts / 1000);
    $m = (int) date('n',  $ts / 1000);
    $y = (int) date('Y',  $ts / 1000) + 543;
    return $d . ' ' . thaiMonth($m) . ' ' . $y;
}

$cPAGE['name']           = "รายงานการวิเคราะห์ดิน";
$cPAGE['alias']          = "service";
$cPAGE['hide_page_title'] = true;

include_once COMPONENT_PATH . 'lib_header.php';
?>

<section class="section public-report-page">
  <div class="container">

    <div class="public-farmer-toolbar">
      <div class="public-segment-tabs" role="navigation" aria-label="เมนูจองและผลวิเคราะห์ดิน">
        <a href="/services/book/farmer" class="public-segment-tab">จองวิเคราะห์ดิน</a>
        <a href="/services/report/land" class="public-segment-tab is-active">ผลวิเคราะห์ดิน</a>
      </div>
    </div>

    <div class="mp-report-header scroll-reveal">
      <div>
        <h2 class="mp-report-title">รายงานผลการวิเคราะห์</h2>
        <p class="mp-report-sub">
          โควต้า <strong><?= $quotaCode ?></strong>
          <?php if ($farmerName): ?>(<?= $farmerName ?>)<?php endif; ?>
        </p>
        <button type="button" class="public-back-button" onclick="history.back()">
          <i class="bi bi-arrow-left" aria-hidden="true"></i> ย้อนกลับ
        </button>
      </div>
      <div class="mp-report-search-wrap">
        <i class="bi bi-search mp-report-search-icon"></i>
        <input
          type="text"
          id="reportSearch"
          placeholder="ค้นหารหัสตัวอย่าง หรือ ชื่อแปลง..."
          class="mp-report-search"
          autocomplete="off"
        >
      </div>
    </div>

    <div class="mp-table-card scroll-reveal stagger-1">
      <?php if (empty($allRows)): ?>
        <div class="mp-empty-state">
          <i class="bi bi-clipboard-data mp-empty-icon"></i>
          <p>ไม่พบข้อมูลผลการวิเคราะห์ดิน</p>
          <small class="text-muted">ผลวิเคราะห์จะแสดงเมื่อรายงานได้รับการอนุมัติแล้ว</small>
        </div>
      <?php else: ?>
        <div class="table-responsive">
          <table class="table mp-report-tbl" id="reportTable">
            <thead>
              <tr>
                <th>รหัสตัวอย่าง</th>
                <th class="d-none d-sm-table-cell">แปลงพื้นที่</th>
                <th>วันที่ส่งตรวจ</th>
                <th>สถานะ</th>
                <th class="text-end">เอกสาร</th>
              </tr>
            </thead>
            <tbody id="reportTbody">
              <?php foreach ($allRows as $row): ?>
              <tr class="mp-report-row">
                <td class="mp-sample-code"><?= htmlspecialchars($row['sampleCode']) ?></td>
                <td class="d-none d-sm-table-cell text-muted">
                  <?= htmlspecialchars($row['landName']) ?>
                  <?php if ($row['areaSize'] !== '-'): ?>
                    <small class="ms-1">(<?= htmlspecialchars($row['areaSize']) ?> ไร่)</small>
                  <?php endif; ?>
                </td>
                <td class="text-muted"><?= formatThaiDate($row['collectSampleAt']) ?></td>
                <td><?= statusPill($row['statusText']) ?></td>
                <td class="text-end">
                  <a href="/services/report/pdf?sampleCode=<?= urlencode($row['sampleCode']) ?>"
                     target="_blank"
                     class="mp-pdf-link">
                    <i class="bi bi-file-earmark-pdf-fill text-danger"></i> ดูรายงาน
                  </a>
                </td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

  </div>
</section>

<script>
(function () {
  const input = document.getElementById('reportSearch');
  const tbody = document.getElementById('reportTbody');
  if (!input || !tbody) return;

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    tbody.querySelectorAll('tr.mp-report-row').forEach(function (row) {
      row.style.display = !q || row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
})();
</script>

<?php include_once COMPONENT_PATH . 'lib_footer.php' ?>
