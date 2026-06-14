<?php
class ServiceAreaAPI {
    private static function getBaseUrl() {
        $config = require(__DIR__ . '/../../config/config.php');
        return $config['api_base_url'];
    }

    public static function getAllServiceAreas() {
        $url = self::getBaseUrl() . 'service-areas';

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
