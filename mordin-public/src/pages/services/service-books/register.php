<?php
session_start();

$cPAGE['name'] = "สมัครสมาชิก";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/register";
$cPAGE['desc'] = "สมัครสมาชิกเพื่อใช้บริการจองคิววิเคราะห์ดิน";

require_once __DIR__ . '/../../../services/FarmerAPI.php';
require_once __DIR__ . '/../../../services/FactoryAPI.php';
require_once __DIR__ . '/../../../services/ServiceAreaAPI.php';

function public_register_set_sessions(array $profile, string $phone): void
{
  $_SESSION['farmer_profile'] = $profile;
  $_SESSION['report_auth'] = [
    'login_type' => 'phone_dob',
    'identifier' => $phone,
    'phone' => $phone,
    'login_time' => date('Y-m-d H:i:s'),
  ];
}

$authPanel = 'register';
$next = trim((string) ($_POST['next'] ?? $_GET['next'] ?? ''));
$errorMessage = '';
$noticeMessage = '';
$formData = [
  'firstName' => '',
  'lastName' => '',
  'phone' => '',
  'thaiNationalId' => '',
  'factoryId' => '',
  'serviceAreaId' => '',
  'thaiFarmerId' => '',
  'lineUserId' => '',
  'birthDay' => '',
  'birthMonth' => '',
  'birthYear' => '',
];
$loginFormData = [
  'phone' => '',
  'birthDay' => '',
  'birthMonth' => '',
  'birthYear' => '',
];
$serviceAreasForSelectedFactory = [];
$factories = factoryAPI::getAllFactories()['data'] ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $phone = preg_replace('/\D+/', '', $_POST['phone'] ?? '');
  $thaiNationalId = preg_replace('/\D+/', '', $_POST['thaiNationalId'] ?? '');
  $thaiFarmerId = trim($_POST['thaiFarmerId'] ?? '');
  $lineUserId = trim($_POST['lineUserId'] ?? '');
  $factoryId = filter_var($_POST['factoryId'] ?? null, FILTER_VALIDATE_INT);
  $serviceAreaId = filter_var($_POST['serviceAreaId'] ?? null, FILTER_VALIDATE_INT);
  $birthDay = $_POST['birthDay'] ?? '';
  $birthMonth = $_POST['birthMonth'] ?? '';
  $birthYear = $_POST['birthYear'] ?? '';

  $formData = [
    'firstName' => trim($_POST['firstName'] ?? ''),
    'lastName' => trim($_POST['lastName'] ?? ''),
    'phone' => $phone,
    'thaiNationalId' => $thaiNationalId,
    'factoryId' => $factoryId ?: '',
    'serviceAreaId' => $serviceAreaId ?: '',
    'thaiFarmerId' => $thaiFarmerId,
    'lineUserId' => $lineUserId,
    'birthDay' => $birthDay,
    'birthMonth' => $birthMonth,
    'birthYear' => $birthYear,
  ];
  $loginFormData = [
    'phone' => $phone,
    'birthDay' => $birthDay,
    'birthMonth' => $birthMonth,
    'birthYear' => $birthYear,
  ];

  if ($factoryId) {
    $serviceAreasForSelectedFactory = serviceAreaAPI::getServiceAreasByFactory($factoryId)['data'] ?? [];
  }

  $birthDate = null;
  if ($birthDay && $birthMonth && $birthYear) {
    $birthDate = sprintf('%04d-%02d-%02d', ((int) $birthYear) - 543, (int) $birthMonth, (int) $birthDay);
  }

  $validationErrors = [];
  if ($formData['firstName'] === '') $validationErrors[] = 'กรุณากรอกชื่อจริง';
  if ($formData['lastName'] === '') $validationErrors[] = 'กรุณากรอกนามสกุล';
  if (!preg_match('/^[0-9]{10}$/', $phone)) $validationErrors[] = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
  if ($thaiNationalId !== '' && !preg_match('/^[0-9]{13}$/', $thaiNationalId)) $validationErrors[] = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
  if (!$birthDate) $validationErrors[] = 'กรุณากรอกวันเดือนปีเกิด';
  if (!$factoryId || $factoryId <= 0) $validationErrors[] = 'กรุณาเลือกโรงงาน';
  if (!$serviceAreaId || $serviceAreaId <= 0) $validationErrors[] = 'กรุณาเลือกเขตส่งเสริม';

  if ($validationErrors) {
    $errorMessage = implode(' / ', $validationErrors);
  } else {
    $data = [
      'firstName' => $formData['firstName'],
      'lastName' => $formData['lastName'],
      'phone' => $phone,
      'thaiNationalId' => $thaiNationalId !== '' ? $thaiNationalId : null,
      'thaiFarmerId' => $thaiFarmerId !== '' ? $thaiFarmerId : null,
      'lineUserId' => $lineUserId !== '' ? $lineUserId : null,
      'factoryId' => (int) $factoryId,
      'serviceAreaId' => (int) $serviceAreaId,
      'birthDate' => $birthDate,
    ];

    $result = FarmerAPI::registerFarmer($data);
    if ($result['success']) {
      $loginResult = FarmerAPI::publicLogin($phone, $birthDate);
      if (isset($loginResult['httpCode']) && in_array((int) $loginResult['httpCode'], [200, 201], true)) {
        session_regenerate_id(true);
        public_register_set_sessions(is_array($loginResult['data'] ?? null) ? $loginResult['data'] : [], $phone);
        header('Location: /services/book/land/add?welcome=1');
        exit;
      }

      $authPanel = 'login';
      $noticeMessage = 'สมัครสำเร็จ กรุณาเข้าสู่ระบบ';
    } else {
      $errorMessage = 'สมัครล้มเหลว: ' . ($result['message'] ?? 'ไม่ทราบสาเหตุ');
    }
  }
}

include __DIR__ . '/auth.php';
