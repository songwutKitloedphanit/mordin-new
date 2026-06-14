<?php
$cPAGE['name'] = "ร้านค้าแนะนำ";
$cPAGE['alias'] = "shops";
$cPAGE['link'] = "shops.php";
$cPAGE['desc'] = "ร้านค้าแนะนำ เพื่อการปรับปรุงดิน";

require_once(__DIR__ . '/../services/ShopsAPI.php');
$shops = ShopsAPI::getAllShops();

$mapId = 'map-container';
// Default center (can be adjusted or dynamic based on first shop)
$mapCenter = [16.4322, 102.8236]; // Kalasin/Khon Kaen area approx
$mapZoom = 8; 

$mapMarkers = [];

if (is_array($shops) && !isset($shops['error'])) {
    foreach ($shops as $index => $shop) {
        if (!empty($shop['latitude']) && !empty($shop['longitude'])) {
            $mapMarkers[] = [
                'title' => $shop['name'],
                'lat' => (float)$shop['latitude'],
                'lng' => (float)$shop['longitude'],
                'buttonId' => 'location-' . $shop['shopId'], // Use ShopID
                'popup' => '<strong>' . $shop['name'] . '</strong>' // Add simple popup
            ];
            
            // Adjust map center to the first shop with coordinates
            if (empty($mapCenterSet)) {
                $mapCenter = [(float)$shop['latitude'], (float)$shop['longitude']];
                $mapZoom = 10;
                $mapCenterSet = true;
            }
        }
    }
}

include_once(COMPONENT_PATH . 'lib_header.php');
?>

<section id="map-section" class="contact section" style="padding-bottom: 0px;">
  <div class="mb-5" data-aos="fade-up" data-aos-delay="200">
    <?php include COMPONENT_PATH.'leafmap_marker.php'; ?>
  </div>
</section>

<section id="pricing" class="pricing section" style="padding-top: 0px;">
  <div class="container">
    <div class="row">
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
                // Construct Address
                $addressParts = [];
                // Check joined subdistrict
                if (isset($shop['subdistrict'])) {
                     $sub = $shop['subdistrict'];
                     if (!empty($sub['name'])) $addressParts[] = "ต." . $sub['name'];
                     // District/Province usually inside subdistrict join, but let's check structure. 
                     // Usually it is nested, but if raw join, let's assume we might need to rely on what we have.
                     // The subdistrict entity usually has district and province relations. 
                     // If standard generic get, it might strictly match entity.
                     // Let's safe check keys.
                     if (isset($sub['district']['name'])) $addressParts[] = "อ." . $sub['district']['name'];
                     if (isset($sub['province']['name'])) $addressParts[] = "จ." . $sub['province']['name'];
                }
                if (!empty($shop['zipCode'])) $addressParts[] = $shop['zipCode'];
                
                $fullAddress = implode(' ', $addressParts);
                // Fallback to empty if no address logic found (unlikely if data is good)
                
                // Image URL
                $imgUrl = ShopsAPI::getImageUrl($shop['imageUrl'] ?? '');
              ?>
              <div class="col-xl-3 col-lg-6 mt-1" data-aos="zoom-in" data-aos-delay="100">
                <div class="pricing-item px-0 ">
                  <h3><?php echo htmlspecialchars($shop['name']); ?></h3>
                  
                  <?php if (!empty($fullAddress)): ?>
                    <p><?php echo htmlspecialchars($fullAddress); ?></p>
                  <?php endif; ?>
                  
                  <?php /* Rating Hidden as requested */ ?>
                  <!-- <span class="advanced bg-warning"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i></span> -->
                  
                  <?php if (!empty($shop['phone'])): ?>
                  <div class="d-flex align-items-center justify-content-center mb-1">
                    <i class="bi bi-telephone-fill me-2"></i>
                    <p class="text-gray-100y mb-2"><?php echo htmlspecialchars($shop['phone']); ?></p>
                  </div>
                  <?php endif; ?>
                  
                  <?php if (!empty($shop['email'])): ?>
                  <div class="d-flex align-items-center justify-content-center mb-1">
                    <i class="bi bi-envelope-fill me-2"></i>
                    <p class="text-gray-100y mb-1"><?php echo htmlspecialchars($shop['email']); ?></p>
                  </div>
                  <?php endif; ?>
                  
                  <?php /* Distance Hidden - requires calculation */ ?>
                  <!-- <h6 class="text-success">ระยะทาง 10 กม.</h6> -->
                  
                  <div class="ratio ratio-1x1">
                    <img src="<?php echo htmlspecialchars($imgUrl); ?>" class="img-fluid" alt="<?php echo htmlspecialchars($shop['name']); ?>" style="object-fit: cover;">
                  </div>
                  
                  <div class="btn-wrap d-flex justify-content-center gap-2 mt-3">
                    <?php if (!empty($shop['facebook'])): ?>
                    <a href="<?php echo htmlspecialchars($shop['facebook']); ?>"
                      class="btn btn-primary d-flex align-items-center justify-content-center text-white" target="_blank"
                      style="width: 40px; height: 40px; font-size: 20px; padding: 0; border-radius: 5px;">
                      <i class="bi bi-facebook"></i>
                    </a>
                    <?php endif; ?>
                    
                    <?php if (!empty($shop['latitude']) && !empty($shop['longitude'])): ?>
                    <button onclick="window.focusOnMarker(<?php echo current(array_keys($mapMarkers, array_filter($mapMarkers, fn($m) => $m['buttonId'] == 'location-'.$shopId)[0] ?? [])); ?>)" 
                       class="btn btn-info d-flex align-items-center justify-content-center text-white"
                      style="width: 40px; height: 40px; font-size: 20px; padding: 0; border-radius: 5px;">
                      <i class="bi bi-geo-alt-fill"></i>
                    </button>
                    <!-- Alternatively, link to Google Maps -->
                     <a href="<?php echo !empty($shop['googleMapUrl']) ? htmlspecialchars($shop['googleMapUrl']) : 'https://www.google.com/maps/search/?api=1&query='.$shop['latitude'].','.$shop['longitude']; ?>" 
                       target="_blank"
                       class="btn btn-danger d-flex align-items-center justify-content-center text-white"
                       style="width: 40px; height: 40px; font-size: 20px; padding: 0; border-radius: 5px;">
                        <i class="bi bi-map"></i>
                     </a>
                    <?php endif; ?>
                  </div>
                </div>
              </div>
          <?php endforeach; ?>
      <?php endif; ?>
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

<?php include_once(COMPONENT_PATH . 'lib_footer.php') ?>