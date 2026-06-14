<?php
function thaiDate($dateStr) {
    $days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    $months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    $timestamp = strtotime($dateStr);
    if (!$timestamp) return "-"; // ตรวจสอบว่าแปลง timestamp ได้หรือไม่

    $dayName = $days[date('w', $timestamp)];
    $day = date('j', $timestamp); // ไม่เอาเลข 0 นำหน้า
    $month = $months[(int)date('n', $timestamp) - 1];
    $year = date('Y', $timestamp) + 543;

    return  $day . " " . $month . " " . $year;

}
?>
