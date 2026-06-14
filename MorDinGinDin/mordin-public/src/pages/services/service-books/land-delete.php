<?php
session_start();

// 1. ตรวจสอบ Login
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

// 2. Include service
require_once(__DIR__ . '/../../../services/FarmerAPI.php');

// 3. รับค่า
$landId = $_POST['landId'] ?? null;
$farmerId = $_SESSION['farmer_profile']['farmerId'] ?? null;

// 4. ตรวจสอบและดำเนินการ
if ($landId && $farmerId) {
  $res = FarmerAPI::deleteLand($landId, $farmerId);
  
  if (!$res['success']) {
    $_SESSION['booking_error'] = 'การลบแปลงล้มเหลว: ' . ($res['message'] ?? 'ไม่ทราบสาเหตุ');
  } else {
    $_SESSION['booking_success'] = 'ลบแปลงปลูกเรียบร้อยแล้ว';
  }
} else {
  $_SESSION['booking_error'] = 'ข้อมูลไม่ถูกต้อง';
}

// 5. Redirect
// กลับไปหน้าเดิม
header('Location: /services/book/farmer');
exit;
?>
