<?php
$current_path = $_SERVER['REQUEST_URI'];

function isActive($path,$current_path) {
    $path = is_array($path) ? $path : [$path];
    foreach ($path as $p) {
        if (strpos($current_path, $p) !== false) {
            return 'btn-gray';
        }
    }
    return 'btn-primary';
}
?>

<div class="col-lg-4 order-4 order-lg-1 content" style="justify-content: center; text-align: center; align-content: center; vertical-align: middle;" data-aos="fade-up" data-aos-delay="200">
    <div class="row mt-2"><div class="col-md-12" style="left: 25%;">
        <a href="/services/book/login" class="btn <?= isActive('/services/book',$current_path) ?> btn-lg btn-block" style="width: 300px;">จองวิเคราะห์ดิน</a>
    </div></div>
    <div class="row mt-2"><div class="col-md-12" style="left: 25%;">
        <a href="/services/soil" class="btn <?= isActive('/services/soil',$current_path) ?> btn-lg btn-block" style="width: 300px;">เก็บตัวอย่างดิน</a>
    </div></div>
    <div class="row mt-2"><div class="col-md-12" style="left: 25%;">
        <a href="/services/book/login?next=report"
     class="btn <?= isActive('/services/report',$current_path) ?> btn-lg btn-block"
     style="width: 300px;">ผลการวิเคราะห์ดิน</a>
    <div class="row mt-2"><div class="col-md-12" style="left: 25%;">
        <a href="/services/mitr" class="btn <?= isActive('/services/mitr',$current_path) ?> btn-lg btn-block" style="width: 300px;">สถานะการบริการ</a>
    </div></div>
</div>
