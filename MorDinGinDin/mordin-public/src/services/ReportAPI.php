<?php
class ReportAPI {
    private static function getBaseUrl() {
        $config = require(__DIR__ . '/../config/config.php');
        return $config['api_base_url'];
    }

    /**
     * ขอไฟล์ PDF ของรายงานจาก Backend
     * @param string $sampleCode รหัสตัวอย่างดิน
     * @return mixed Raw PDF data or error array
     */
    public static function getReportPdf($sampleCode) {
        $url = self::getBaseUrl() . 'books/reports/pdf';
        $data = [
            'sampleCodes' => [$sampleCode]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/pdf' // บอกให้ API รู้ว่าเราต้องการ PDF
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch) || $httpCode !== 201) {
            curl_close($ch);
            return ['error' => 'Failed to fetch PDF', 'httpCode' => $httpCode, 'response' => $response];
        }

        curl_close($ch);
        return $response; // คืนค่าเป็นข้อมูลดิบของ PDF
    }
}
?>