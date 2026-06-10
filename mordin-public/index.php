<?php
// ตั้งค่า timezone เป็น Bangkok (สำคัญสำหรับการแสดงเวลาที่ถูกต้อง)
date_default_timezone_set('Asia/Bangkok');

// ตั้ง locale ภาษาไทย (ถ้าเซิร์ฟเวอร์รองรับ)
setlocale(LC_TIME, 'th_TH.UTF-8');

// โหลด Class Env
require_once __DIR__ . '/src/utils/Env.php';

// โหลด .env
Env::load(__DIR__ . '/.env');

// โหลด Flight.php (class Flight)
require_once __DIR__ . '/src/flight/Flight.php';

// กำหนด path สำหรับ components
define('COMPONENT_PATH', __DIR__ . '/src/components/');

define('UTILS_PATH', __DIR__ . '/src/utils/');

define('SERVICES_PATH', __DIR__ . '/src/services/');

define('TYPES_PATH', __DIR__ . '/src/types/');

define('API_BASE_URL', Env::get('API_BASE_URL', 'http://localhost:3000/'));

// ตั้งค่า path สำหรับ views ของ FlightPHP (โฟลเดอร์ pages)
Flight::set('flight.views.path', __DIR__ . '/src/pages');

// โหลด routes
require_once __DIR__ . '/src/routes.php';

// เริ่ม Flight
Flight::start();
