<?php
$cPAGE['name']  = "ปฏิทินให้บริการ";
$cPAGE['alias'] = "calendar";
$cPAGE['link']  = "calendar.php";
$cPAGE['desc']  = "ปฏิทินการให้บริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";
    
include_once COMPONENT_PATH.'lib_header.php';
include UTILS_PATH.'date.php';
require_once(SERVICES_PATH . 'ServiceCalendarAPI.php');

// 1. ดึงข้อมูลจาก Public Endpoint
$rawCalendars = ServiceCalendarAPI::getPublicUpComingCalendar();
$upComingData = [];

// 2. Prepare Data (Normalize)
if (!empty($rawCalendars) && !isset($rawCalendars['error'])) {
    foreach ($rawCalendars as $cal) {
        $current = isset($cal['currentBookings']) ? intval($cal['currentBookings']) : ($cal['numberOfBookings'] ?? 0);
        $max = $cal['numberOfSamples'] ?? $cal['numberOfBooking'] ?? 50;
        
        $isFull = ($current >= $max);
        $available = $max - $current;
        if ($available < 0) $available = 0;

        $village = $cal['village'] ?? '-';
        
        $subdistrict = $cal['subdistrictName'] ?? $cal['subdistrict']['nameTh'] ?? '';
        $district = $cal['districtName'] ?? $cal['district']['nameTh'] ?? $cal['subdistrict']['district']['nameTh'] ?? '';
        $province = $cal['provinceName'] ?? $cal['province']['nameTh'] ?? $cal['subdistrict']['district']['province']['nameTh'] ?? '';
        
        $fullAddress = "{$village} ต.{$subdistrict} อ.{$district} จ.{$province}";

        $upComingData[] = array_merge($cal, [
            'currentBookings' => $current,
            'numberOfSamples' => $max,
            'isFull' => $isFull,
            'available' => $available,
            'fullAddress' => $fullAddress,
            'latitude' => floatval($cal['latitude'] ?? 0),
            'longitude' => floatval($cal['longitude'] ?? 0)
        ]);
    }
}
?>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<?php if (empty($upComingData)) : ?>
    <h5 class="text-center mt-5" style="padding-bottom: 150px;">ขณะนี้ยังไม่มีการให้บริการ โปรดติดตามประกาศจากเว็บไซต์</h5>
<?php else: ?>

<section id="map-section" class="contact section">
    <div id="map-container" style="height:400px;width:100%"></div>
</section>


<section id="pricing" class="pricing section" style="padding-top: 0px;">
    <div class="container">
        <div class="row">
                <h4> เปิดรับตัวอย่างดิน 9:00-9:30 น.(จองล่วงหน้า) 9:30-10:00 น.(walk-in จำนวนจำกัด)</h4>
                <?php foreach ($upComingData as $index => $event) : 
                    $statusClass = $event['isFull'] ? "text-danger" : "text-success";
                    $statusText = $event['isFull'] ? "เต็มแล้ว" : "ว่าง {$event['available']} / {$event['numberOfSamples']} คิว";
                    $buttonClass = $event['isFull'] ? "btn-secondary" : "btn-primary";
                    $bookingLink = "services/book/login?action=booking&calendarId=" . $event['serviceCalendarId'];
                ?>
                    <div class="col-xl-3 col-lg-6 mt-4" data-aos="fade-up" data-aos-delay="<?= ($index + 1) * 100 ?>">
                        <div class="pricing-item <?= ($index === 0) ? 'featured' : '' ?>">
                            <h3><?= thaiDate($event['date']) ?></h3>
                            <?php if ($index === 0) : ?>
                                <span class="advanced bg-warning">ล่าสุด</span>
                            <?php endif; ?>
                            <?php if ($event['isFull']) : ?>
                                <span class="advanced bg-danger">เต็ม</span>
                            <?php endif; ?>
                            
                            <p><?= htmlspecialchars($event['fullAddress']) ?></p>
                            
                            <h6 class="<?= $statusClass ?>"><?= $statusText ?></h6>
                            <div class="btn-wrap">
                                <a href="<?= $event['isFull'] ? '#' : $bookingLink ?>" 
                                    class="btn <?= $buttonClass ?> me-md-2 text-white <?= $event['isFull'] ? 'disabled' : '' ?>" 
                                    style='font-size:15px; width: 100px;' 
                                    <?= $event['isFull'] ? 'onclick="return false;"' : '' ?>>
                                    <i class="bi bi-clipboard-check-fill"></i> จองเลย
                                </a>

                                <a href="#" class="btn btn-info me-md-2 text-white" style='font-size:15px; width: 100px;' onclick="event.preventDefault(); focusOnMarker(<?= $index ?>);">
                                    <i class="bi bi-geo-alt-fill"></i> ที่ตั้ง
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<div class="modal fade" id="mapModal" tabindex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="mapModalLabel">เปิด Google Maps</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <p>คุณต้องการเปิด Google Maps สำหรับ<br> <strong><span id="calendarName"></span></strong><br> หรือไม่?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                <button type="button" class="btn btn-primary" id="confirmOpenMap">ตกลง</button>
            </div>
        </div>
    </div>
</div>

<?php include_once(COMPONENT_PATH.'lib_footer.php'); ?>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
const calendarData = <?= json_encode($upComingData, JSON_UNESCAPED_UNICODE) ?>;

let map;
let markers = [];

function thaiDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()} / ${d.getMonth()+1} / ${d.getFullYear()+543}`;
}

function initMap() {
    if (!calendarData.length) return;

    const first = calendarData[0];

    map = L.map('map-container').setView(
        [first.latitude, first.longitude],
        10
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    calendarData.forEach((event, i) => {
        const marker = L.marker([
            event.latitude,
            event.longitude
        ]).addTo(map);

        marker.bindPopup(`
            <b>${thaiDate(event.date)}</b><br>
            ${event.fullAddress}<br>
            <span style="color:${event.isFull?'red':'green'}">
                ${event.isFull ? 'คิวเต็ม' : `ว่าง ${event.available}/${event.numberOfSamples}`}
            </span>
        `);

        markers.push(marker);
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

document.addEventListener('DOMContentLoaded', initMap);
</script>
