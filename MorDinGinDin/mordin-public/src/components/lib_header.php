<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>MITR PHOL-SOIL</title>
  <meta name="description" content="">
  <meta name="keywords" content="">

  <base href="/">

  <!-- Favicons -->
  <link href="assets/img/mitr.jpg" rel="icon">
  <!--link href="assets/img/favicon.png" rel="icon"-->
  <link href="assets/img/mitr.jpg" rel="apple-touch-icon">
  <!--link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon"-->

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
    rel="stylesheet">


  <!-- Vendor CSS Files -->
  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="assets/vendor/aos/aos.css" rel="stylesheet">
  <link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet">

  <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">
  <link href="assets/vendor/fontawesome/css/all.min.css" rel="stylesheet">
  <link href="assets/vendor/fontawesome/js/all.min.js" rel="stylesheet">

  <!-- Main CSS File -->
  <link href="assets/css/main.css" rel="stylesheet">

  <!-- SweetAlert2 -->
  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">


  <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" rel="stylesheet"> -->

  <!--link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script-->
  <!-- =======================================================
  * Template Name: Mentor
  * Template URL: https://bootstrapmade.com/mentor-free-education-bootstrap-theme/
  * Updated: Aug 07 2024 with Bootstrap v5.3.3
  * Author: BootstrapMade.com
  * License: https://bootstrapmade.com/license/
  ======================================================== -->
</head>


<body class="contact-page">

  <header id="header" class="header d-flex align-items-center sticky-top">
    <div class="container-fluid container-xl position-relative d-flex align-items-center">

      <a href="index.php" class="logo d-flex align-items-center me-auto">
        <!-- Uncomment the line below if you also wish to use an image logo -->
        <img src="/assets/img/logo-mitr-phol.png" alt="">
        <!-- <h1 class="sitename">MITR PHOL-SOIL</h1> -->
      </a>
      <nav id="navmenu" class="navmenu">
        <ul>
          <li><a href="" <?php if (strcmp($cPAGE['alias'], "home") == 0)
            echo "class='active'" ?>>หน้าหลัก<br></a></li>
            <li><a href="calendar" <?php if (strcmp($cPAGE['alias'], "calendar") == 0)
            echo "class='active'" ?>>ปฏิทินให้บริการ<br></a></li>
            <li class="dropdown" <?php if (strcmp($cPAGE['alias'], "service") == 0)
            echo "class='active'" ?>>
              <a href="#" data-bs-toggle="dropdown"><span>รับบริการวิเคราะห์ดิน</span> <i
                  class="bi bi-chevron-down toggle-dropdown"></i></a>
              <ul>
                <li><a href="services/book/login">จองวิเคราะห์ดิน</a></li>
                <li><a href="services/soil">วิธีเก็บตัวอย่างดิน</a></li>
                <!-- ใส่ return ให้กลับไป  report หลังล็อกอิน -->
                <li><a href="services/report/login?return=services/report">ผลการวิเคราะห์ดิน</a></li>
                <li><a href="services/mitr">สถานะการบริการ</a></li>
              </ul>
            </li>
            <li><a href="shops" <?php if (strcmp($cPAGE['alias'], "shops") == 0)
            echo "class='active'" ?>>ร้านค้าแนะนำ<br></a></li>
            <li><a href="soil-improvement" <?php if (strcmp($cPAGE['alias'], "soil-improvement") == 0)
            echo "class='active'" ?>>ความรู้ด้านการจัดการดิน<br></a></li>
            <li><a href="services/price" <?php if (strcmp($cPAGE['alias'], "price") == 0)
            echo "class='active'" ?>>อัตราค่าบริการ<br></a></li>
            <!-- li><a href="template.php" <?php if (strcmp($cPAGE['alias'], "template") == 0)
            echo "class='active'" ?> >หน้าตัวอย่าง<br></a></li -->
            <!--li><a href="about.html">About</a></li-->
            <!--li><a href="courses.html">Courses</a></li>
          <li><a href="trainers.html">Trainers</a></li>
          <li><a href="events.html">Events</a></li>
          <li><a href="pricing.html">Pricing</a></li-->

            <li><a href="contact" <?php if (strcmp($cPAGE['alias'], "contact") == 0)
            echo "class='active'" ?>>ติดต่อเรา</a>
            </li>
          <!-- <?php if (isset($_SESSION['farmer_profile'])) {
            //
            // ---
            // เมื่อ
            // Login
            // แล้ว
            // ---
            ?>
            <li><a href="/services/book/logout" style="color: #ffc107;">ออกจากระบบ</a></li>
            <?php
          } else {
            //
            // ---
            // เมื่อยังไม่
            // Login
            // ---
            ?>
            <li><a href="/services/book/register"
                class="<?= ($cPAGE['alias'] ?? '') == 'service' ? 'active' : '' ?>">สมัครสมาชิก</a></li>
            <?php
          }
          ?> -->
        </ul>
        <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      <!--a class="btn-getstarted" href="courses.html">Get Started</a-->

    </div>
  </header>


  <main class="main">

    <!-- Page Title -->
    <div class="page-title" data-aos="fade">
      <div class="heading">
        <div class="container">
          <div class="row d-flex justify-content-center text-center">
            <div class="col-lg-8">
              <h1><?php echo $cPAGE['name']; ?></h1>
              <p><?php echo $cPAGE['desc']; ?></p>
              <!--h1>Contact</h1-->
              <!--p class="mb-0">Odio et unde deleniti. Deserunt numquam exercitationem. Officiis quo odio sint voluptas consequatur ut a odio voluptatem. Sit dolorum debitis veritatis natus dolores. Quasi ratione sint. Sit quaerat ipsum dolorem.</p-->
            </div>
          </div>
        </div>
      </div>
      <nav class="breadcrumbs">
        <div class="container">
          <ol>
            <li><a href="">หน้าหลัก</a></li>
            <li class="current"><?php echo $cPAGE['name']; ?></li>
          </ol>
        </div>
      </nav>
    </div><!-- End Page Title -->