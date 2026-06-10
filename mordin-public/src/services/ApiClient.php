<?php

class ApiClient
{
    private static function getBaseUrl()
    {
        if (defined('API_BASE_URL')) {
            return API_BASE_URL;
        }

        static $baseUrl = null;
        if ($baseUrl === null) {
            $config = require __DIR__ . '/../config/config.php';
            $baseUrl = $config['api_base_url'];
        }
        return $baseUrl;
    }

    private static function buildUrl($path)
    {
        if (preg_match('/^https?:\/\//', $path)) {
            return $path;
        }

        return rtrim(self::getBaseUrl(), '/') . '/' . ltrim($path, '/');
    }

    public static function getJson($path)
    {
        $response = self::request('GET', $path);

        if (!$response['success']) {
            return ['error' => $response['message']];
        }

        return $response['data'];
    }

    public static function getJsonResponse($path)
    {
        $response = self::request('GET', $path);

        if ($response['success']) {
            return [
                'success' => true,
                'data' => $response['data'],
                'httpCode' => $response['httpCode']
            ];
        }

        return [
            'success' => false,
            'message' => $response['message'],
            'httpCode' => $response['httpCode']
        ];
    }

    private static function request($method, $path)
    {
        $ch = curl_init(self::buildUrl($path));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        }

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $message = curl_error($ch);
            curl_close($ch);

            return [
                'success' => false,
                'message' => $message,
                'httpCode' => $httpCode,
                'data' => null
            ];
        }

        curl_close($ch);
        $data = json_decode($body, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'message' => null,
                'httpCode' => $httpCode,
                'data' => $data
            ];
        }

        return [
            'success' => false,
            'message' => $data['message'] ?? 'API request failed',
            'httpCode' => $httpCode,
            'data' => $data
        ];
    }
}
