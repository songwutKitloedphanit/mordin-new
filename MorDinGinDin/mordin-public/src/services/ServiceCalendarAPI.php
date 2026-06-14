<?php
class ServiceCalendarAPI {
    private static function getBaseUrl() {
        $config = require(__DIR__ . '/../config/config.php');
        return $config['api_base_url'];
    }

    public static function getUpComingCalendar() {
        $url = self::getBaseUrl() . 'service-calendars/upcoming';
        return self::fetchApi($url);
    }

    public static function getPublicUpComingCalendar() {
        $url = self::getBaseUrl() . 'service-calendars/public/upcoming';
        return self::fetchApi($url);
    }

    public static function getCalendarById($id) {
        $url = self::getBaseUrl() . 'service-calendars/' . $id;
        return self::fetchApi($url);
    }

    private static function fetchApi($url) {
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