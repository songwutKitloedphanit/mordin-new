<?php
class ServiceTypeAPI {
    private static function getBaseUrl() {
        static $baseUrl = null;
        if ($baseUrl === null) {
            $config = require __DIR__ . '/../config/config.php';
            $baseUrl = $config['api_base_url'];
        }
        return $baseUrl;
    }

    public static function getAllServiceTypes() {
        $url = self::getBaseUrl() . 'service-types';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        }

        curl_close($ch);
        return json_decode($response, true);
    }
}
