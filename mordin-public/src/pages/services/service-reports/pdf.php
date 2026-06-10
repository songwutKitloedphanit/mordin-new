<?php
session_start();
require_once __DIR__ . '/../../../services/ReportAPI.php';
require_once __DIR__ . '/../../../services/FarmerAPI.php';

// ต้อง login ก่อน (กันเข้าถึง PDF ของเกษตรกรคนอื่น)
if (!isset($_SESSION['farmer_profile']['farmerId'])) {
    http_response_code(401);
    echo "Unauthorized";
    exit;
}
$farmerId = $_SESSION['farmer_profile']['farmerId'];

if (isset($_GET['sampleCode']) || isset($_GET['landId'])) {
    $sampleCode = $_GET['sampleCode'] ?? null;
    $landId = $_GET['landId'] ?? null;

    // ตรวจสอบความเป็นเจ้าของก่อนเสิร์ฟไฟล์ (กัน IDOR)
    if ($sampleCode !== null) {
        $reportsData = FarmerAPI::getReportsByLand($farmerId);
        $ownedSampleCodes = [];
        if (($reportsData['httpCode'] ?? 500) === 200 && is_array($reportsData['data'] ?? null)) {
            foreach ($reportsData['data'] as $item) {
                foreach (($item['reports'] ?? []) as $report) {
                    if (isset($report['sampleCode'])) {
                        $ownedSampleCodes[] = (string) $report['sampleCode'];
                    }
                }
            }
        }
        if (!in_array((string) $sampleCode, $ownedSampleCodes, true)) {
            http_response_code(403);
            echo "Forbidden";
            exit;
        }
    } else {
        $ownerCheck = FarmerAPI::getLandById($landId);
        if (!($ownerCheck['success'] ?? false) || ($ownerCheck['data']['farmerId'] ?? null) != $farmerId) {
            http_response_code(403);
            echo "Forbidden";
            exit;
        }
    }

    $zipContent = $sampleCode !== null
        ? ReportAPI::getReportPdf($sampleCode)
        : ReportAPI::getSummaryReportPdfByLand($landId);

    if ($zipContent && !is_array($zipContent)) {
        // สร้างไฟล์ zip ชั่วคราว
        $zipFile = tempnam(sys_get_temp_dir(), 'report_') . '.zip';
        file_put_contents($zipFile, $zipContent);

        // เปิดไฟล์ zip
        $zip = new ZipArchive;
        if ($zip->open($zipFile) === TRUE) {
            // ค้นหาไฟล์ PDF ใน zip (สมมติว่ามีไฟล์ .pdf แค่ไฟล์เดียว)
            $pdfFileName = null;
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) == 'pdf') {
                    $pdfFileName = $filename;
                    break;
                }
            }

            if ($pdfFileName) {
                // ดึงเนื้อหาไฟล์ PDF ออกมา
                $pdfContent = $zip->getFromName($pdfFileName);
                $zip->close();

                // ส่ง Header ของ PDF
                header('Content-Type: application/pdf');
                header('Content-Disposition: inline; filename="' . basename($pdfFileName) . '"');
                header('Content-Length: ' . strlen($pdfContent));

                // ส่งเนื้อหา PDF
                echo $pdfContent;
            } else {
                $zip->close();
                echo "PDF file not found in the archive.";
            }
        } else {
            echo "Failed to open the zip archive.";
        }
        // ลบไฟล์ zip ชั่วคราว
        unlink($zipFile);

    } else {
        echo "Failed to generate report.";
    }
} else {
    echo "Sample code or land id not provided.";
}
?>
