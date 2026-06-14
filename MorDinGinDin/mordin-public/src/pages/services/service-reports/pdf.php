<?php
session_start();
require_once __DIR__ . '/../../../services/ReportAPI.php';

if (isset($_GET['sampleCode'])) {
    $sampleCode = $_GET['sampleCode'];
    $zipContent = ReportAPI::getReportPdf($sampleCode);

    if ($zipContent) {
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
    echo "Sample code not provided.";
}
?>