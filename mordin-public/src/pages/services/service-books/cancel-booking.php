<?php
session_start();

// 1. ตรวจสอบ Login
if (!isset($_SESSION['farmer_profile'])) {
  header('Location: /services/book/login');
  exit;
}

// 2. Include service
require_once __DIR__ . '/../../../services/Booking.php';

// 3. รับค่า
$bookId = $_POST['bookId'] ?? null;
$farmerId = $_SESSION['farmer_profile']['farmerId'] ?? null;

// 4. ตรวจสอบและดำเนินการ
if ($bookId && $farmerId) {
  $res = BookingAPI::cancelBooking($bookId, $farmerId);

  if (!$res['success']) {
    //
    // หากล้มเหลว
    // เราควรเก็บ error
    // ไว้ใน session
    // เพื่อไปแสดงผลที่หน้า
    // farmer.php
    $_SESSION['booking_error'] = $res['message'] ?? 'การยกเลิกล้มเหลว';
  } else {
    $_SESSION['booking_success'] = 'ยกเลิกการจองเรียบร้อยแล้ว';
  }
}

// 5. Redirect
// กลับไปหน้าเดิม
header('Location: /services/book/farmer');
exit;
?>
