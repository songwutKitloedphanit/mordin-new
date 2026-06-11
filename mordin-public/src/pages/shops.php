<?php
$cPAGE['name'] = "ร้านค้าแนะนำ";
$cPAGE['alias'] = "shops";
$cPAGE['link'] = "shops.php";
$cPAGE['desc'] = "ร้านค้าแนะนำ เพื่อการปรับปรุงดิน";

require_once __DIR__ . '/../services/ShopsAPI.php';
$shops = ShopsAPI::getAllShops();

$mapId = 'map-container';
// Default center (can be adjusted or dynamic based on first shop)
$mapCenter = [16.4322, 102.8236]; // Kalasin/Khon Kaen area approx
$mapZoom = 8;

$mapMarkers = [];
$shopMarkerIndex = []; // shopId => index in $mapMarkers

if (is_array($shops) && !isset($shops['error'])) {
    foreach ($shops as $shop) {
        if (!empty($shop['latitude']) && !empty($shop['longitude'])) {
            $shopMarkerIndex[$shop['shopId']] = count($mapMarkers);
            $mapMarkers[] = [
                'title' => $shop['name'],
                'lat' => (float)$shop['latitude'],
                'lng' => (float)$shop['longitude'],
                'buttonId' => 'location-' . $shop['shopId'],
                'popup' => '<strong>' . $shop['name'] . '</strong>'
            ];

            if (empty($mapCenterSet)) {
                $mapCenter = [(float)$shop['latitude'], (float)$shop['longitude']];
                $mapZoom = 10;
                $mapCenterSet = true;
            }
        }
    }
}

include_once COMPONENT_PATH . 'lib_header.php';
?>

<link rel="stylesheet" href="/assets/css/leaflet.css">

<div class="ag-page-banner">
  <div class="container-xl ag-page-banner-inner">
    <div class="ag-kicker"><i class="bi bi-shop me-1"></i>Recommended Shops</div>
    <h1>ร้านค้าแนะนำ</h1>
    <p>รวมร้านค้าปุ๋ยและวัสดุปรับปรุงดินในพื้นที่เขตส่งเสริม พร้อมตำแหน่งบนแผนที่</p>
  </div>
</div>

<section id="shops-map" class="section public-shops-map">
  <div class="mb-5 scroll-reveal">
    <?php include_once COMPONENT_PATH.'leafmap_marker.php'; ?>
  </div>
</section>

<section id="shops-grid" class="section public-shops-grid">
  <div class="container">
    <div class="row gy-4">
      <?php if (isset($shops['error'])): ?>
         <div class="col-12 text-center text-danger">
            <p>เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า: <?php echo htmlspecialchars($shops['error']); ?></p>
         </div>
      <?php elseif (!is_array($shops) || empty($shops)): ?>
         <div class="col-12 text-center">
            <p>ไม่พบข้อมูลร้านค้าในขณะนี้</p>
         </div>
      <?php else: ?>
          <?php foreach ($shops as $shop): ?>
              <?php
                $shopId = $shop['shopId'];
                $addressParts = [];
                if (isset($shop['subdistrict'])) {
                    $sub = $shop['subdistrict'];
                    if (!empty($sub['name'])) {
                        $addressParts[] = "ต." . $sub['name'];
                    }
                    if (isset($sub['district']['name'])) {
                        $addressParts[] = "อ." . $sub['district']['name'];
                    }
                    if (isset($sub['province']['name'])) {
                        $addressParts[] = "จ." . $sub['province']['name'];
                    }
                }
                if (!empty($shop['zipCode'])) {
                    $addressParts[] = $shop['zipCode'];
                }
                $fullAddress = implode(' ', $addressParts);
                $imgUrl = ShopsAPI::getImageUrl($shop['imageUrl'] ?? '');
              ?>
              <div class="col-xl-3 col-lg-6 scroll-reveal stagger-<?= (($loop_index_shop = isset($loop_index_shop) ? $loop_index_shop + 1 : 0) % 5) + 1 ?>">
                <div class="public-shop-card">
                  <h3><?php echo htmlspecialchars($shop['name']); ?></h3>

                  <?php if (!empty($fullAddress)): ?>
                    <p class="text-muted"><?php echo htmlspecialchars($fullAddress); ?></p>
                  <?php endif; ?>

                  <?php if (!empty($shop['phone'])): ?>
                  <div class="public-shop-contact-row">
                    <i class="bi bi-telephone-fill"></i>
                    <span><?php echo htmlspecialchars($shop['phone']); ?></span>
                  </div>
                  <?php endif; ?>

                  <?php if (!empty($shop['email'])): ?>
                  <div class="public-shop-contact-row">
                    <i class="bi bi-envelope-fill"></i>
                    <span><?php echo htmlspecialchars($shop['email']); ?></span>
                  </div>
                  <?php endif; ?>

                  <div class="ratio ratio-1x1 public-shop-img-wrap">
                    <img src="<?php echo htmlspecialchars($imgUrl); ?>" class="img-fluid public-shop-img" alt="<?php echo htmlspecialchars($shop['name']); ?>">
                  </div>

                  <div class="public-shop-actions">
                    <?php if (!empty($shop['facebook'])): ?>
                    <a href="<?php echo htmlspecialchars($shop['facebook']); ?>"
                      class="btn btn-primary public-shop-btn-icon" target="_blank" aria-label="Facebook">
                      <i class="bi bi-facebook"></i>
                    </a>
                    <?php endif; ?>

                    <?php if (!empty($shop['latitude']) && !empty($shop['longitude'])): ?>
                    <button onclick="window.focusOnMarker(<?= $shopMarkerIndex[$shopId] ?? 'null' ?>)"
                      class="btn btn-info public-shop-btn-icon text-white" aria-label="ดูบนแผนที่">
                      <i class="bi bi-geo-alt-fill"></i>
                    </button>
                    <a href="<?php echo !empty($shop['googleMapUrl']) ? htmlspecialchars($shop['googleMapUrl']) : 'https://www.google.com/maps/search/?api=1&query='.$shop['latitude'].','.$shop['longitude']; ?>"
                      target="_blank"
                      class="btn btn-danger public-shop-btn-icon" aria-label="Google Maps">
                      <i class="bi bi-map"></i>
                    </a>
                    <?php endif; ?>
                  </div>
                </div>
              </div>
          <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>
</section>

<div class="modal fade" id="mapModal" tabindex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="mapModalLabel">เปิด Google Maps</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-center">
        <p>คุณต้องการเปิด Google Maps สำหรับ<br> <strong><span id="shopName"></span></strong><br> หรือไม่?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
        <button type="button" class="btn btn-primary" id="confirmOpenMap">ตกลง</button>
      </div>
    </div>
  </div>
</div>

<?php include_once COMPONENT_PATH . 'lib_footer.php' ?>
