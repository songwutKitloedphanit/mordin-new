<?php
class serviceAreaAPI
{
    private static function getBaseUrl()
    {
        $config = require(__DIR__ . '/../config/config.php');
        return $config['api_base_url'];
    }

    private static function fetchApi($url)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            curl_close($ch);
            return ['success' => false, 'message' => curl_error($ch), 'httpCode' => $httpCode];
        }

        curl_close($ch);
        $result = json_decode($response, true);

        if ($httpCode === 200) {
            return ['success' => true, 'data' => $result, 'httpCode' => $httpCode];
        } else {
            return [
                'success' => false,
                'message' => $result['message'] ?? 'เกิดข้อผิดพลาด',
                'httpCode' => $httpCode
            ];
        }
    }

    /**
     * ดึงข้อมูลเขตส่งเสริมทั้งหมด
     * (เรียก GET /service-areas)
     */
    public static function getAllServiceAreas()
    {
        $url = self::getBaseUrl() . 'service-areas';
        return self::fetchApi($url);
    }

    public static function getServiceAreasByFactory($factoryId)
    {
        $url = self::getBaseUrl() . 'service-areas/by-factory/' . $factoryId;
        return self::fetchApi($url);
    }
}