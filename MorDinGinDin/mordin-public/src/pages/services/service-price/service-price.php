<?php
$cPAGE['name']  = "อัตราค่าบริการ";
$cPAGE['alias'] = "price";
$cPAGE['link']  = "/services/price";
$cPAGE['desc']  = "อัตราค่าบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

include_once(COMPONENT_PATH . 'lib_header.php');
require_once(__DIR__ . '/../../../services/serviceTypeAPI.php');
require_once(__DIR__ . '/../../../services/laboratoriesAPI.php');
$serviceTypes = ServiceTypeAPI::getAllServiceTypes();
$laboratories = LaboratoryAPI::getAllLaboratories();

// แปลงข้อมูลเป็น JSON และแสดงผล
$serviceTypesJson = json_encode($serviceTypes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
$laboratoriesJson = json_encode($laboratories, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// echo "<h3>Service Types JSON:</h3>";
// echo "<pre>" . htmlspecialchars($serviceTypesJson) . "</pre>";

// echo "<h3>Laboratories JSON:</h3>";
// echo "<pre>" . htmlspecialchars($laboratoriesJson) . "</pre>";

// แปลง JSON กลับมาเป็น array เพื่อใช้งาน
$serviceTypes = json_decode($serviceTypesJson, true);
$laboratories = json_decode($laboratoriesJson, true);

// ตรวจสอบและประมวลผลข้อมูล
if (isset($serviceTypes['error'])) {
    echo '<p class="text-danger">เกิดข้อผิดพลาด: ' . htmlspecialchars($serviceTypes['error']) . '</p>';
} elseif (!is_array($serviceTypes) || empty($serviceTypes)) {
    echo '<p class="text-danger">ไม่สามารถดึงข้อมูลประเภทบริการได้</p>';
} else {
    $displayedServiceTypes = array_filter($serviceTypes, fn($service) => $service['isDisplay'] ?? false);
    ?>
    <section id="pricing" class="pricing section">
        <div class="container">
            <div class="row justify-content-center align-items-center mb-5">
                <?php foreach ($displayedServiceTypes as $service): ?>
                    <div class="col-md-3 ps-md-0" data-aos="fade-up" data-aos-delay="400">
                        <div class="card-pricing2 card-<?php echo htmlspecialchars($service['color'] ?? 'secondary'); ?> mb-3">
                            <div class="pricing-header">
                                <h3 class="fw-bold mb-3 text-white">
                                    <?php echo htmlspecialchars($service['name'] ?? 'ไม่มีชื่อ'); ?>
                                </h3>
                                <span class="sub-title">
                                    <?php
                                    $categories = $service['serviceCategories'] ?? [];
                                    $displayCategories = array_filter($categories, fn($cat) => $cat['isDisplay'] ?? false);
                                    $categoryNames = array_map(fn($cat) => htmlspecialchars($cat['name']), $displayCategories);
                                    echo implode(' / ', $categoryNames);
                                    ?>
                                </span>
                            </div>
                            <div class="price-value">
                                <div class="value">
                                    <span class="amount">
                                        <?php echo ($service['price'] ?? 0) == 0 ? 'ฟรี' : htmlspecialchars($service['price'] ?? '-'); ?>
                                    </span>
                                    <span class="month">
                                        <?php echo htmlspecialchars($service['unitDetail'] ?? ''); ?>
                                    </span>
                                </div>
                            </div>
                            <ul class="pricing-content">
                                <?php
                                foreach ($laboratories as $lab) {
                                    $found = array_filter($service['serviceLaboratories'] ?? [], fn($item) => $item['laboratoryId'] == $lab['laboratoryId'] && ($item['isDisplay'] ?? false));
                                    $class = !empty($found) ? '' : 'disable';
                                    echo '<li class="' . $class . '">' . htmlspecialchars($lab['name'] ?? 'ไม่มีชื่อ') . '</li>';
                                }
                                ?>
                            </ul>
                            <a href="services/price" class="btn btn-success btn-border btn-lg w-75 fw-bold mb-3">
                                ซื้อเลย
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php
}
include_once(COMPONENT_PATH . 'lib_footer.php');
?>