<?php
// แก้ไข Typo จาก mapMarker.php เป็น map_marker.php ตามโครงสร้างไฟล์จริง
require_once COMPONENT_PATH . 'map_marker.php';

$cPAGE['name'] = "ติดต่อเรา";
$cPAGE['alias'] = "contact";
$cPAGE['link'] = "contact.php";
$cPAGE['desc'] = "ท่านสามารถสอบถามข้อมูลต่าง ๆ ทางช่องทางออนไลน์ รวมถึง ทางโทรศัพท์ หรือ อีเมล์";

$mitrLocation = [
    'latitude' => '16.4711801',
    'longitude' => '102.1219541',
    'name' => 'บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด'
];

include_once COMPONENT_PATH . 'lib_header.php';
?>

<section id="contact" class="contact section">

    <div class="mb-5" data-aos="fade-up" data-aos-delay="200">
        <?php
        $mapId = 'contact-map';
        $mapHeight = '400px';
        $mapCenter = [$mitrLocation['latitude'], $mitrLocation['longitude']];
        $mapZoom = 15;

        $mapMarkers = [
            [
                'lat' => $mitrLocation['latitude'],
                'lng' => $mitrLocation['longitude'],
                'popup' => $mitrLocation['name']
            ]
        ];

        include_once COMPONENT_PATH . 'leafmap_marker.php';
        ?>
    </div>

    <div class="container" data-aos="fade-up" data-aos-delay="100">

        <div class="section-title mb-4">
            <h2>ติดต่อเรา</h2>
            <p>ท่านสามารถสอบถามข้อมูลต่าง ๆ ได้ทางช่องทางด้านล่าง หรือเดินทางมาติดต่อได้โดยตรงที่สำนักงาน</p>
        </div>

        <div class="row gy-4">

            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
                <div class="info-item d-flex">
                    <i class="bi bi-geo-alt"></i>
                    <div>
                        <h3>ที่อยู่</h3>
                        <p>มิตรผลวิจัยพัฒนาอ้อยและน้ำตาล</p>
                        <p>399 หมู่ที่ 1 ถนนชุมแพ-ภูเขียว ตำบลโคกสะอาด</p>
                        <p>อำเภอภูเขียว จังหวัดชัยภูมิ 36110</p>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
                <div class="info-item d-flex">
                    <i class="bi bi-telephone"></i>
                    <div>
                        <h3>โทรศัพท์</h3>
                        <p>094-523-5145 (ณัฐวุฒิ)</p>
                        <p>095-563-6495 (อัฏฐารส)</p>
                        <p class="text-muted">วันจันทร์ – ศุกร์ เวลา 08:00 – 17:00 น.</p>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="400">
                <div class="info-item d-flex">
                    <i class="bi bi-envelope"></i>
                    <div>
                        <h3>อีเมล</h3>
                        <p>research@mitrphol.com</p>
                        <p class="text-muted">ตอบกลับภายใน 1-2 วันทำการ</p>
                    </div>
                </div>
            </div>

        </div>

    </div>

</section><?php include_once COMPONENT_PATH . '/lib_footer.php' ?>
