<?php
class AddressAPI {
    private static function getBaseUrl() {
        static $baseUrl = null;
        if ($baseUrl === null) {
            $config = require __DIR__ . '/../config/config.php';
            $baseUrl = $config['api_base_url'];
        }
        return $baseUrl;
    }

    private static function fetchApi($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['success' => false, 'message' => "CURL Error: $curlError", 'httpCode' => $httpCode];
        }

        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            return ['success' => true, 'data' => $data, 'httpCode' => $httpCode];
        } else {
            return [
                'success' => false,
                'message' => $data['message'] ?? "API responded with status code $httpCode",
                'httpCode' => $httpCode,
                'data' => $data
            ];
        }
    }

    public static function getProvinces() {
        $url = self::getBaseUrl() . 'provinces';
        return self::fetchApi($url);
    }

    public static function getDistrictsByProvince($provinceCode) {
        $url = self::getBaseUrl() . 'districts/by-province/' . $provinceCode;
        return self::fetchApi($url);
    }

    public static function getSubdistrictsByDistrict($districtCode) {
        $url = self::getBaseUrl() . 'subdistricts/by-district/' . $districtCode;
        return self::fetchApi($url);
    }
}
