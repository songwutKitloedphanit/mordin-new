<?php
session_start();

$cPAGE['name'] = "เข้าสู่ระบบ";
$cPAGE['alias'] = "service";
$cPAGE['link'] = "/services/book/login";
$cPAGE['desc'] = "เข้าสู่ระบบเพื่อจองคิวและดูผลวิเคราะห์ดิน";

require_once __DIR__ . '/../../../services/FarmerAPI.php';

function public_auth_next_value(): string
{
  return trim((string) ($_POST['next'] ?? $_GET['next'] ?? ''));
}

function public_auth_safe_redirect(string $next, int $landCount): string
{
  if ($landCount === 0) {
    return '/services/book/land/add?welcome=1';
  }

  if ($next === 'report' || $next === '/services/report/land') {
    return '/services/report/land';
  }

  if ($next !== '') {
    $path = parse_url($next, PHP_URL_PATH);
    if (is_string($path) && strpos($path, '/') === 0 && strpos($path, '//') !== 0) {
      $blocked = ['/services/book/login', '/services/book/register', '/services/report/login'];
      if (!in_array($path, $blocked, true)) {
        $query = parse_url($next, PHP_URL_QUERY);
        return $path . ($query ? '?' . $query : '');
      }
    }
  }

  return '/services/book/farmer';
}

function public_auth_set_sessions(array $profile, string $phone): void
{
  $_SESSION['farmer_profile'] = $profile;
  $_SESSION['report_auth'] = [
    'login_type' => 'phone_dob',
    'identifier' => $phone,
    'phone' => $phone,
    'login_time' => date('Y-m-d H:i:s'),
  ];
}

$authPanel = 'login';
$next = public_auth_next_value();
$errorMessage = '';
$noticeMessage = '';
$loginFormData = [
  'phone' => '',
  'birthDay' => '',
  'birthMonth' => '',
  'birthYear' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $phone = preg_replace('/\D/', '', $_POST['phone'] ?? '');
  $birthDay = $_POST['birthDay'] ?? '';
  $birthMonth = $_POST['birthMonth'] ?? '';
  $birthYear = $_POST['birthYear'] ?? '';

  $loginFormData = [
    'phone' => $phone,
    'birthDay' => $birthDay,
    'birthMonth' => $birthMonth,
    'birthYear' => $birthYear,
  ];

  if ($phone === '' || !$birthDay || !$birthMonth || !$birthYear) {
    $errorMessage = 'กรุณากรอกเบอร์โทรศัพท์และวันเดือนปีเกิดให้ครบถ้วน';
  } else {
    $birthDate = sprintf('%04d-%02d-%02d', ((int) $birthYear) - 543, (int) $birthMonth, (int) $birthDay);
    $result = FarmerAPI::publicLogin($phone, $birthDate);

    if (isset($result['error'])) {
      $errorMessage = $result['error'];
    } elseif (isset($result['httpCode']) && in_array((int) $result['httpCode'], [200, 201], true)) {
      session_regenerate_id(true);
      $profile = is_array($result['data'] ?? null) ? $result['data'] : [];
      public_auth_set_sessions($profile, $phone);
      $landCount = (int) ($profile['landCount'] ?? 0);
      header('Location: ' . public_auth_safe_redirect($next, $landCount));
      exit;
    } else {
      $errorMessage = $result['data']['message'] ?? 'ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      if (is_array($errorMessage)) {
        $errorMessage = implode(', ', $errorMessage);
      }
    }
  }
}

include __DIR__ . '/auth.php';
