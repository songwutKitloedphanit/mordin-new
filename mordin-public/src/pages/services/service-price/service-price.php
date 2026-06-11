<?php
$cPAGE['name']  = "อัตราค่าบริการ";
$cPAGE['alias'] = "price";
$cPAGE['link']  = "/services/price";
$cPAGE['desc']  = "อัตราค่าบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

include_once COMPONENT_PATH . 'lib_header.php';
require_once __DIR__ . '/../../../services/serviceTypeAPI.php';
require_once __DIR__ . '/../../../services/laboratoriesAPI.php';
$serviceTypes = ServiceTypeAPI::getAllServiceTypes();
$laboratories = LaboratoryAPI::getAllLaboratories();


if (!function_exists('publicServiceColorToCss')) {
    function publicServiceColorToCss($color)
    {
        $colorMap = [
            'primary' => '#1572E8',
            'success' => '#31CE36',
            'secondary' => '#6861CE',
            'info' => '#48ABF7',
            'warning' => '#FFAD46',
            'danger' => '#F25961',
        ];

        $key = strtolower(trim((string) $color));

        return $colorMap[$key] ?? '#005092';
    }
}

if (!function_exists('publicHexToRgba')) {
    function publicHexToRgba($hex, $alpha)
    {
        $hex = ltrim((string) $hex, '#');
        if (!preg_match('/^[0-9a-fA-F]{6}$/', $hex)) {
            return 'rgba(0, 80, 146, ' . $alpha . ')';
        }

        $red = hexdec(substr($hex, 0, 2));
        $green = hexdec(substr($hex, 2, 2));
        $blue = hexdec(substr($hex, 4, 2));

        return 'rgba(' . $red . ', ' . $green . ', ' . $blue . ', ' . $alpha . ')';
    }
}

// ตรวจสอบและประมวลผลข้อมูล
if (isset($serviceTypes['error'])) {
    echo '<section class="section public-price-page"><div class="container"><div class="public-empty-state"><p class="text-danger">เกิดข้อผิดพลาด: ' . htmlspecialchars($serviceTypes['error']) . '</p></div></div></section>';
} elseif (!is_array($serviceTypes) || empty($serviceTypes)) {
    echo '<section class="section public-price-page"><div class="container"><div class="public-empty-state"><p class="text-danger">ไม่สามารถดึงข้อมูลประเภทบริการได้</p></div></div></section>';
} else {
    $displayedServiceTypes = array_filter($serviceTypes, fn($service) => $service['isDisplay'] ?? false);
    $displayedLaboratoryCount = is_array($laboratories) ? count($laboratories) : 0;
    $freeServiceCount = 0;
    $categoryNameSet = [];

    foreach ($displayedServiceTypes as $service) {
        if (($service['price'] ?? 0) == 0) {
            $freeServiceCount++;
        }

        foreach (($service['serviceCategories'] ?? []) as $category) {
            if (($category['isDisplay'] ?? false) && !empty($category['name'])) {
                $categoryNameSet[$category['name']] = true;
            }
        }
    }
    ?>
    <section class="section public-modern-page-hero public-price-hero">
        <div class="container">
            <div class="public-modern-hero-grid">
                <div class="public-modern-hero-copy scroll-reveal">
                    <span class="public-modern-kicker"><i class="bi bi-card-checklist"></i> Service Pricing</span>
                    <h1>บริการและอัตราค่าวิเคราะห์ดิน</h1>
                    <p>เลือกประเภทบริการที่ต้องการตรวจ วิเคราะห์รายการแล็บที่รวมอยู่ในแพ็กเกจ และไปยังปฏิทินเพื่อจองรอบบริการที่สะดวก</p>
                </div>
                <div class="public-modern-metrics scroll-reveal stagger-1">
                    <div class="public-modern-metric">
                        <span><?= count($displayedServiceTypes) ?></span>
                        <p>บริการที่แสดง</p>
                    </div>
                    <div class="public-modern-metric">
                        <span><?= $freeServiceCount ?></span>
                        <p>บริการฟรี</p>
                    </div>
                    <div class="public-modern-metric">
                        <span><?= count($categoryNameSet) ?></span>
                        <p>หมวดบริการ</p>
                    </div>
                    <div class="public-modern-metric">
                        <span><?= $displayedLaboratoryCount ?></span>
                        <p>รายการวิเคราะห์</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section public-price-page pt-0">
        <div class="container">
            <div class="row gy-4 justify-content-center align-items-stretch public-price-grid">
                <?php foreach ($displayedServiceTypes as $service): ?>
                    <?php
                    $serviceColorToken = preg_replace('/[^a-z0-9_-]/i', '', (string)($service['color'] ?? 'secondary'));
                    $serviceColorToken = $serviceColorToken !== '' ? $serviceColorToken : 'secondary';
                    $serviceColor = publicServiceColorToCss($service['color'] ?? '');
                    $serviceColorSoft = publicHexToRgba($serviceColor, '0.10');
                    $serviceColorBorder = publicHexToRgba($serviceColor, '0.24');
                    ?>
                    <div class="col-xl-3 col-lg-4 col-md-6 scroll-reveal stagger-<?= (($priceIdx = isset($priceIdx) ? $priceIdx + 1 : 0) % 5) + 1 ?>">
                        <div class="card-pricing2 public-price-card private-style-price-card card-<?php echo htmlspecialchars($serviceColorToken, ENT_QUOTES, 'UTF-8'); ?>" style="--service-color: <?php echo htmlspecialchars($serviceColor, ENT_QUOTES, 'UTF-8'); ?>; --service-color-soft: <?php echo htmlspecialchars($serviceColorSoft, ENT_QUOTES, 'UTF-8'); ?>; --service-color-border: <?php echo htmlspecialchars($serviceColorBorder, ENT_QUOTES, 'UTF-8'); ?>;">
                            <div class="pricing-header public-price-card-hero">
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
                            <div class="price-value public-price-card-price-wrap">
                                <div class="value public-price-card-price-badge">
                                    <span class="amount">
                                        <?php echo ($service['price'] ?? 0) == 0 ? 'ฟรี' : htmlspecialchars($service['price'] ?? '-'); ?>
                                    </span>
                                    <span class="month">
                                        <?php echo htmlspecialchars($service['unitDetail'] ?? ''); ?>
                                    </span>
                                </div>
                            </div>
                            <div class="public-price-card-body">
                                <ul class="pricing-content public-price-features">
                                    <?php
                                    foreach ($laboratories as $lab) {
                                        $found = array_filter($service['serviceLaboratories'] ?? [], fn($item) => $item['laboratoryId'] == $lab['laboratoryId'] && ($item['isDisplay'] ?? false));
                                        $isIncluded = !empty($found);
                                        $liClass = $isIncluded ? 'public-price-feature is-included' : 'disable public-price-feature is-unavailable';
                                        $iconClass = 'feature-icon ' . ($isIncluded ? 'feature-icon-included' : 'feature-icon-excluded');
                                        $iconText = $isIncluded ? '✓' : '×';
                                        echo '<li class="' . $liClass . '"><span class="' . $iconClass . '">' . $iconText . '</span>' . htmlspecialchars($lab['name'] ?? 'ไม่มีชื่อ') . '</li>';
                                    }
                                    ?>
                                </ul>
                                <a href="calendar" class="btn btn-lg fw-bold public-price-cta">
                                    <i class="bi bi-calendar-check-fill"></i> จองคิววิเคราะห์
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php
}
include_once COMPONENT_PATH . 'lib_footer.php';
?>
