<?php
class BookingAPI
{
    private static function getBaseUrl()
    {
        $config = require(__DIR__ . '/../config/config.php');
        return $config['api_base_url'];
    }

    // ฟังก์ชันจองคิว (Public Booking)
    public static function createBooking($data)
    {
        // ยิงไปที่ Endpoint: /books/booking ตามที่ Controller กำหนด
        $url = self::getBaseUrl() . 'books/booking';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            return ['success' => false, 'message' => curl_error($ch)];
        }
        curl_close($ch);

        $result = json_decode($response, true);

        // เช็ค Status Code (201 Created หรือ 200 OK)
        if ($httpCode >= 200 && $httpCode < 300) {
            return ['success' => true, 'data' => $result];
        } else {
            return [
                'success' => false,
                'message' => $result['message'] ?? 'เกิดข้อผิดพลาดในการจอง (Status: ' . $httpCode . ')'
            ];
        }
    }

    public static function updateBooking($bookId, $data)
    {
        // $data = ['receivedServiceCalendarId' => 123,
        // 'farmerId' => 456]
        $url = self::getBaseUrl() . 'books/booking/' . $bookId;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            return ['success' => true, 'data' => $result];
        } else {
            return [
                'success' => false,
                'message' => $result['message'] ?? 'เกิดข้อผิดพลาด (Status: ' . $httpCode . ')'
            ];
        }
    }

    // [!!] FUNCTION 2: สำหรับ "ยกเลิก"
    public static function cancelBooking($bookId, $farmerId)
    {
        $url = self::getBaseUrl() . "books/booking/{$bookId}/farmer/{$farmerId}";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return ['success' => true];
        } else {
            $result = json_decode($response, true);
            return [
                'success' => false,
                'message' => $result['message'] ?? 'เกิดข้อผิดพลาด (Status: ' . $httpCode . ')'
            ];
        }
    }
}