<?php
class FarmerAPI
{
    private static function getBaseUrl()
    {
        // ดึง URL ของ Backend API จากไฟล์ config
        $config = require(__DIR__ . '/../config/config.php');
        return $config['api_base_url'];
    }

    /**
     * ส่งข้อมูลเพื่อเข้าสู่ระบบสำหรับเกษตรกร
     * @param string $loginType ประเภทการล็อกอิน ('thai_id' หรือ 'farmer_id')
     * @param string $identifier หมายเลขบัตรประชาชน หรือ หมายเลขเกษตรกร
     * @param string $phone หมายเลขโทรศัพท์
     * @return array ผลลัพธ์จาก API
     */
    public static function publicLogin($loginType, $identifier, $phone)
    {
        $url = self::getBaseUrl() . 'farmers/public-login';
        $data = [
            'loginType' => $loginType,
            'identifier' => $identifier,
            'phone' => $phone
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'httpCode' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    /**
     * ดึงข้อมูลรายงานของเกษตรกรตาม ID โดยจัดกลุ่มตามแปลง
     * @param int $farmerId ไอดีของเกษตรกร
     * @return array ผลลัพธ์จาก API
     */
    public static function getReportsByLand($farmerId)
    {
        $url = self::getBaseUrl() . 'farmers/' . $farmerId . '/reports-by-land';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'httpCode' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    public static function getSummaryReportByLand($landId)
    {
        $url = self::getBaseUrl() . 'farmers/' . 'summary/' . $landId . '/reports-by-land';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'httpCode' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    public static function getLandsByFarmerId($farmerId)
    {
        $url = self::getBaseUrl() . 'lands/farmer/' . $farmerId;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'httpCode' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    public static function createLand($data)
    {
        // $data
        // ควรมมีหน้าตาตรงกับ
        // CreateLandDto
        //
        $url = self::getBaseUrl() . 'lands/by-farmer';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
            //
            // หาก Endpoint
            // นี้มีการใช้
            // AuthGuard
            // คุณต้องส่ง
            // Token
            // ไปด้วย
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            return ['success' => false, 'message' => curl_error($ch), 'httpCode' => $httpCode];
        }
        curl_close($ch);

        $result = json_decode($response, true);

        $errorMessage = $result['message'] ?? ('เกิดข้อผิดพลาด (Status: ' . $httpCode . ')');
        if (is_array($errorMessage)) {
            $errorMessage = implode(', ', $errorMessage);
        }

        // 201 Created
        if ($httpCode === 201) {
            return ['success' => true, 'data' => $result, 'httpCode' => $httpCode];
        } else {
            return [
                'success' => false,
                'message' => $errorMessage,
                'httpCode' => $httpCode
            ];
        }
    }

    public static function deleteLand($landId, $farmerId)
    {
        $url = self::getBaseUrl() . "lands/{$landId}/farmer/{$farmerId}";

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

    public static function getLandById($landId)
    {
        $url = self::getBaseUrl() . 'lands/' . $landId;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        if ($httpCode === 200) {
            return ['success' => true, 'data' => $result];
        } else {
            return ['success' => false, 'message' => $result['message'] ?? 'Not Found'];
        }
    }

    public static function updateLand($landId, $data)
    {
        // $data
        // จะต้องตรงกับ
        // UpdateLandByFarmerDto
        $url = self::getBaseUrl() . 'lands/by-farmer/' . $landId;

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

        $errorMessage = $result['message'] ?? ('เกิดข้อผิดพลาด (Status: ' . $httpCode . ')');
        if (is_array($errorMessage)) {
            $errorMessage = implode(', ', $errorMessage);
        }

        if ($httpCode === 200) {
            return ['success' => true, 'data' => $result];
        } else {
            return [
                'success' => false,
                'message' => $errorMessage
            ];
        }
    }

    public static function registerFarmer($data)
    {
        //
        // Endpoint
        // นี้จะตรงกับ
        // CreateFarmerDto
        // ของ
        // Backend
        //
        $url = self::getBaseUrl() . 'farmers/by-farmer';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        // 201 Created
        if ($httpCode === 201) {
            return ['success' => true, 'data' => $result];
        } else {
            $errorMessage = $result['message'] ?? 'เกิดข้อผิดพลาด';
            if (is_array($errorMessage)) {
                $errorMessage = implode(', ', $errorMessage);
            }
            return [
                'success' => false,
                'message' => $errorMessage
            ];
        }
    }   

    public static function getFarmerById($farmerId)
    {
        $url = self::getBaseUrl() . 'farmers/' . $farmerId;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        //
        // (ถ้า
        // Endpoint
        // นี้มี
        // AuthGuard
        // ต้องส่ง
        // Token
        // ด้วย)
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        if ($httpCode === 200) {
            return ['success' => true, 'data' => $result];
        } else {
            return ['success' => false, 'message' => $result['message'] ?? 'Not Found'];
        }
    }

    /**
     *
     * อัปเดตข้อมูล
     * Farmer
     * (สำหรับหน้า
     * Edit)
     */
    public static function updateFarmer($farmerId, $data)
    {
        //
        // Endpoint
        // นี้จะตรงกับ
        // UpdateFarmerDto
        //
        $url = self::getBaseUrl() . 'farmers/by-farmer/' . $farmerId;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
            //
            // (ถ้า
            // Endpoint
            // นี้มี
            // AuthGuard
            // ต้องส่ง
            // Token
            // ด้วย)
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        if ($httpCode === 200) {
            return ['success' => true, 'data' => $result];
        } else {
            $errorMessage = $result['message'] ?? 'เกิดข้อผิดพลาด';
            if (is_array($errorMessage)) {
                $errorMessage = implode(', ', $errorMessage);
            }
            return [
                'success' => false,
                'message' => $errorMessage
            ];
        }
    }
}
