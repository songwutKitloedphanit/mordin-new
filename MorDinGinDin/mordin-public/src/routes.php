<?php
require_once(__DIR__.'/services/ServiceCalendarAPI.php');
require_once(__DIR__.'/services/qr-code/QRCodeAPI.php');

Flight::route('GET /', function() {
         Flight::render('home.php');

});

Flight::route('GET /calendar', function() {
    $data = ServiceCalendarAPI::getUpComingCalendar();
    Flight::render('calendar.php', ['upComingData' => $data]);
});

Flight::route('GET /contact', function() {
     Flight::render('contact.php');
});

Flight::route('GET /shops', function() {
     Flight::render('shops.php');
});

Flight::route('GET /soil-improvement', function() {
     Flight::render('soil-improvement.php');
});

Flight::route('GET|POST /services/book/login', function() {
     Flight::render('services/service-books/login.php');
});

Flight::route('GET /services/book/logout', function () {
    Flight::render('services/service-books/logout.php');
});

Flight::route('GET|POST /services/book/register', function() {
     Flight::render('services/service-books/register.php');
});

Flight::route('GET|POST /services/book/farmer/edit', function() {
     Flight::render('services/service-books/farmer-edit.php');
});

Flight::route('GET /services/book/farmer', function() {
     Flight::render('services/service-books/farmer.php');
});

Flight::route('GET|POST /services/book/land/add', function() {
     Flight::render('services/service-books/land-add.php');
});

Flight::route('GET /services/book/land/edit', function() {
     Flight::render('services/service-books/land-edit.php');
});

Flight::route('GET /services/mitr', function() {
     Flight::render('services/service-mitr/service-mitr.php');
});

Flight::route('GET /services/price', function() {
     Flight::render('services/service-price/service-price.php');
});

// Flight::route('GET /services/report/farmer', function() {
//      Flight::render('services/service-reports/farmer.php');
// });

Flight::route('GET /services/report/land', function() {
     Flight::render('services/service-reports/report-land.php');
});

Flight::route('GET|POST /services/report/summary', function() {
     Flight::render('services/service-reports/report-summary.php');
});

// หน้าเข้าสู่ระบบรายงาน
Flight::route('GET|POST /services/report/login', function() {
     Flight::render('services/service-reports/login.php');
});

// ยืนยันตัวตน (mock) แล้ว redirect ไปดูรายงาน
Flight::route('POST /services/report/login', function() {
  // ตัวอย่างรับค่าจากฟอร์ม
  $identifier = $_POST['identifier'] ?? null;
  $phone      = $_POST['phone'] ?? null;
  $loginType  = $_POST['login_type'] ?? 'farmer_no';

  // TODO: ที่จริงควรตรวจสอบกับฐานข้อมูล/ API
  if ($identifier && $phone) {
    $_SESSION['report_auth'] = [
      'login_type' => $loginType,
      'identifier' => $identifier,
      'phone'      => $phone,
      'login_time' => date('Y-m-d H:i:s')
    ];
    // เข้าสู่หน้า report หลังล็อกอิน
    Flight::redirect('/services/report');
  } else {
    // กลับไปหน้า login ถ้าข้อมูลไม่ครบ
    Flight::redirect('/services/report/login');
  }
});

// ป้องกันเข้าหน้ารายงานโดยยังไม่ล็อกอิน
Flight::route('GET /services/report', function() {
  if (!isset($_SESSION['report_auth'])) {
    Flight::redirect('/services/report/login');
    return;
  }
  Flight::render('services/service-reports/report.php');
});


Flight::route('GET /services/soil', function() {
     Flight::render('services/service-soil/service-soil.php');
});

Flight::route('GET|POST /collect-sample/@code', function($code) {
    $isValidCode = QRCodeAPI::checkEncryptQrCode($code);
    $qrCode = QRCodeAPI::getQrCodeByEncryptCode($code);
    Flight::render('collect-sample.php', [
        'qrCode' => $qrCode,
        'isValidCode' => $isValidCode,
        'code' => $code
    ]);
});

Flight::route('GET /services/report/pdf', function() {
     Flight::render('services/service-reports/pdf.php');
});


Flight::route('GET|POST /booking', function() {
     Flight::render('booking.php');
});

Flight::route('/services/book/create-booking', function () {
     Flight::render('services/service-books/create-booking.php');
});

Flight::route('/services/book/update-booking', function () {
     Flight::render('services/service-books/update-booking.php');
});

Flight::route('/services/book/cancel-booking', function () {
     Flight::render('services/service-books/cancel-booking.php');
});

Flight::route('/api/districts/by-province/@provinceCode', function($provinceCode){
    require_once(SERVICES_PATH . 'AddressAPI.php');
    $res = AddressAPI::getDistrictsByProvince($provinceCode);
    if ($res['success']) {
        Flight::json($res['data']);
    } else {
        Flight::halt($res['httpCode'] ?: 500, $res['message']);
    }
});

Flight::route('/api/subdistricts/by-district/@districtCode', function($districtCode){
    require_once(SERVICES_PATH . 'AddressAPI.php');
    $res = AddressAPI::getSubdistrictsByDistrict($districtCode);
    if ($res['success']) {
        Flight::json($res['data']);
    } else {
        Flight::halt($res['httpCode'] ?: 500, $res['message']);
    }
});

Flight::route('/services/book/land/delete', function () {
    Flight::render('services/service-books/land-delete.php');
});

Flight::route('GET|POST /services/book/land/edit', function () {
    Flight::render('services/service-books/land-edit.php');
});

Flight::route('/api/service-areas/by-factory/@factoryId', function($factoryId){
    require_once(SERVICES_PATH . 'ServiceAreaAPI.php');
    $data = serviceAreaAPI::getServiceAreasByFactory($factoryId);
    Flight::json($data['data'] ?? []); 
});
