<?php
session_start();

// ล้างข้อมูล Session ทั้งหมด
session_unset();
session_destroy();

// ส่งกลับไปหน้า Login
header('Location: /services/book/login');
exit;
?>
