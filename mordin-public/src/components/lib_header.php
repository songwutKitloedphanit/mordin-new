<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$pageAlias = $cPAGE['alias'] ?? '';
$pageName = $cPAGE['name'] ?? 'MITR PHOL-SOIL';
$pageDesc = $cPAGE['desc'] ?? '';
$requestPath = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
$safeAlias = preg_replace('/[^a-z0-9-]+/i', '-', $pageAlias ?: 'public');
$mainCssPath = __DIR__ . '/../../assets/css/main.css';
$mainCssVersion = file_exists($mainCssPath) ? filemtime($mainCssPath) : time();
$farmerProfile = $_SESSION['farmer_profile'] ?? null;
$isPublicLoggedIn = is_array($farmerProfile) && !empty($farmerProfile);
$publicDisplayName = 'ผู้ใช้งาน';
$publicProfileRoute = 'services/book/farmer';
$publicLogoutRoute = 'services/book/logout';

if ($isPublicLoggedIn) {
  $firstName = trim((string) ($farmerProfile['firstName'] ?? $farmerProfile['first_name'] ?? ''));
  $lastName = trim((string) ($farmerProfile['lastName'] ?? $farmerProfile['last_name'] ?? ''));
  $fullName = trim($firstName . ' ' . $lastName);
  $farmerName = trim((string) ($farmerProfile['farmerName'] ?? $farmerProfile['farmer_name'] ?? ''));
  $name = trim((string) ($farmerProfile['name'] ?? ''));
  $username = trim((string) ($farmerProfile['username'] ?? ''));
  $phone = trim((string) ($farmerProfile['phone'] ?? ''));

  if ($fullName !== '') {
    $publicDisplayName = $fullName;
  } elseif ($farmerName !== '') {
    $publicDisplayName = $farmerName;
  } elseif ($name !== '') {
    $publicDisplayName = $name;
  } elseif ($username !== '') {
    $publicDisplayName = $username;
  } elseif ($phone !== '') {
    $publicDisplayName = $phone;
  }
}

$publicInitial = preg_match('/./u', $publicDisplayName, $publicInitialMatch) ? $publicInitialMatch[0] : 'U';
$safePublicDisplayName = htmlspecialchars($publicDisplayName, ENT_QUOTES, 'UTF-8');
$safePublicInitial = htmlspecialchars($publicInitial, ENT_QUOTES, 'UTF-8');
$isActive = function ($aliases, $paths = []) use ($pageAlias, $requestPath) {
  $aliases = is_array($aliases) ? $aliases : [$aliases];
  $paths = is_array($paths) ? $paths : [$paths];

  foreach ($aliases as $alias) {
    if ($alias !== '' && $pageAlias === $alias) {
      return 'active';
    }
  }

  foreach ($paths as $path) {
    $path = trim($path, '/');
    if ($path !== '' && ($requestPath === $path || strpos($requestPath, $path . '/') === 0)) {
      return 'active';
    }
  }

  return '';
};
?>
<!DOCTYPE html>
<html lang="th">

<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>MITR PHOL-SOIL</title>
  <meta name="description" content="">
  <meta name="keywords" content="">

  <base href="/">

  <link href="assets/img/mitr.jpg" rel="icon">
  <link href="assets/img/mitr.jpg" rel="apple-touch-icon">

  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="assets/vendor/aos/aos.css" rel="stylesheet">
  <link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet">
  <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">
  <link href="assets/vendor/fontawesome/css/all.min.css" rel="stylesheet">

  <link href="assets/css/main.css?v=<?= $mainCssVersion ?>" rel="stylesheet">

  <link href="assets/vendor/sweetalert2/sweetalert2.min.css" rel="stylesheet">
</head>

<body class="public-site page-<?= htmlspecialchars($safeAlias, ENT_QUOTES, 'UTF-8') ?>">

  <header id="header" class="header public-header d-flex align-items-center sticky-top">
    <div class="container-fluid container-xl position-relative d-flex align-items-center gap-3">
      <a href="" class="logo d-flex align-items-center me-auto" aria-label="MITR PHOL-SOIL">
        <img src="/assets/img/logo-mitr-phol.png" alt="MITR PHOL">
      </a>

      <nav id="navmenu" class="navmenu">
        <ul>
          <li><a href="" class="<?= $isActive('home', '') ?>">หน้าหลัก</a></li>
          <li class="dropdown">
            <a href="#" class="<?= $isActive([], ['services/price', 'services/book', 'services/report', 'services/mitr']) ?>">
              <span>บริการ</span>
              <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <li><a href="services/price" class="<?= $isActive('price', 'services/price') ?>">บริการ&amp;ราคา</a></li>
              <li><a href="<?= $isPublicLoggedIn ? 'services/book/farmer' : 'services/book/login' ?>" class="<?= $isActive([], 'services/book') ?>"<?= $isPublicLoggedIn ? '' : ' data-require-login="true"' ?>>จองคิววิเคราะห์ดิน</a></li>
<li><a href="<?= $isPublicLoggedIn ? 'services/report/land' : 'services/report/login' ?>" class="<?= $isActive([], 'services/report') ?>"<?= $isPublicLoggedIn ? '' : ' data-require-login="true"' ?>>ผลวิเคราะห์ดิน</a></li>
              <li><a href="services/mitr" class="<?= $isActive([], 'services/mitr') ?>">สถานะการบริการ</a></li>
            </ul>
          </li>
          <li class="dropdown">
            <a href="#" class="<?= $isActive([], ['calendar', 'shops']) ?>">
              <span>รอบบริการ&amp;ร้านค้า</span>
              <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <li><a href="calendar" class="<?= $isActive('calendar', 'calendar') ?>">ปฏิทินให้บริการ</a></li>
              <li><a href="shops" class="<?= $isActive('shops', 'shops') ?>">ร้านค้าแนะนำ</a></li>
            </ul>
          </li>
          <li><a href="soil-improvement" class="<?= $isActive('soil-improvement', 'soil-improvement') ?>">ความรู้</a></li>
          <li><a href="contact" class="<?= $isActive('contact', 'contact') ?>">ติดต่อเรา</a></li>
          <li class="d-xl-none mobile-nav-divider">
            <?php if ($isPublicLoggedIn): ?>
              <a href="<?= $publicProfileRoute ?>" class="mobile-nav-profile-link">
                <span class="public-profile-avatar"><?= $safePublicInitial ?></span>
                <span><?= $safePublicDisplayName ?></span>
              </a>
              <div class="mobile-nav-user-actions">
                <a href="<?= $publicLogoutRoute ?>" class="mobile-nav-login">ออกจากระบบ</a>
              </div>
            <?php else: ?>
              <div class="mobile-nav-user-actions">
                <a href="services/book/login" class="mobile-nav-login">เข้าสู่ระบบ</a>
                <a href="services/book/login" class="mobile-nav-cta" data-require-login="true">จองคิววิเคราะห์ดิน</a>
              </div>
            <?php endif; ?>
          </li>
        </ul>
        <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      <div class="public-header-actions d-none d-xl-flex align-items-center">
        <?php if ($isPublicLoggedIn): ?>
          <div class="public-profile-dropdown">
            <button class="public-profile-toggle" type="button" aria-haspopup="true" aria-expanded="false">
              <span class="public-profile-avatar"><?= $safePublicInitial ?></span>
              <span class="public-profile-name"><?= $safePublicDisplayName ?></span>
              <i class="bi bi-chevron-down" aria-hidden="true"></i>
            </button>
            <div class="public-profile-menu" role="menu" aria-label="เมนูผู้ใช้งาน">
              <a href="<?= $publicProfileRoute ?>" role="menuitem">โปรไฟล์</a>
              <a href="<?= $publicLogoutRoute ?>" role="menuitem">ออกจากระบบ</a>
            </div>
          </div>
        <?php else: ?>
          <a class="public-action-link" href="services/book/login">เข้าสู่ระบบ</a>
        <?php endif; ?>
        <a class="public-cta" href="<?= $isPublicLoggedIn ? 'services/book/farmer' : 'services/book/login' ?>"<?= $isPublicLoggedIn ? '' : ' data-require-login="true"' ?>>จองคิววิเคราะห์ดิน</a>
      </div>
    </div>
  </header>

  <main class="main public-main">

    <?php if ($pageAlias !== 'home' && $pageName !== '' && empty($cPAGE['hide_page_title'])): ?>
      <div class="public-page-kicker" data-aos="fade">
        <span class="public-kicker"><?= htmlspecialchars($pageName, ENT_QUOTES, 'UTF-8') ?></span>
      </div>
    <?php endif; ?>

