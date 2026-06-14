<?php
// แก้ไข Typo จาก mapMarker.php เป็น map_marker.php ตามโครงสร้างไฟล์จริง
require_once(COMPONENT_PATH . 'map_marker.php');

$cPAGE['name'] = "ติดต่อเรา";
$cPAGE['alias'] = "contact";
$cPAGE['link'] = "contact.php";
$cPAGE['desc'] = "ท่านสามารถสอบถามข้อมูลต่าง ๆ ทางช่องทางออนไลน์ รวมถึง ทางโทรศัพท์ หรือ อีเมล์";

$mitrLocation = [
    'latitude' => '16.4711801',
    'longitude' => '102.1219541',
    'name' => 'บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด'
];

include_once(COMPONENT_PATH . 'lib_header.php');
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

        include COMPONENT_PATH . 'leafmap_marker.php';
        ?>
    </div>
    <div class="container" data-aos="fade-up" data-aos-delay="100">

        <div class="row gy-4">

            <div class="col-lg-4">
                <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="300">
                    <i class="bi bi-geo-alt flex-shrink-0"></i>
                    <div>
                        <h3>ที่อยู่</h3>
                        <p>มิตรผลวิจัยพัฒนาอ้อยและน้ำตาล</p>
                        <p>399 หมู่ที่ 1 ถนนชุมแพ-ภูเขียว ตำบลโคกสะอาด</p>
                        <p>อำเภอภูเขียว จังหวัดชัยภูมิ 36110</p>
                    </div>
                </div>
            </div>

            <!-- <div class="col-lg-8">
                <form action="forms/contact.php" method="post" class="php-email-form" data-aos="fade-up"
                    data-aos-delay="200">
                    <div class="row gy-4">
                        <div class="col-md-12">
                            <textarea class="form-control" name="messages" rows="10" placeholder="Message"></textarea>
                        </div>

                        <div class="col-md-12">
                            <textarea class="form-control" name="message" rows="2" placeholder="Message"
                                required=""></textarea>
                        </div>

                        <div class="col-md-12 text-center">
                            <div class="loading">กำลังส่งข้อความ</div>
                            <div class="error-message"></div>
                            <div class="sent-message">ข้อความถูกส่งแล้ว ขอบคุณ!</div>

                            <button type="submit">ส่งข้อความ</button>
                        </div>
                    </div>
                </form>
            </div> -->
        </div>

    </div>

</section><?php include_once(COMPONENT_PATH . '/lib_footer.php') ?>
