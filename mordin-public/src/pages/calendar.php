<?php
$cPAGE['name']  = "ปฏิทินให้บริการ";
$cPAGE['alias'] = "calendar";
$cPAGE['link']  = "calendar.php";
$cPAGE['desc']  = "ปฏิทินการให้บริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

include_once COMPONENT_PATH.'lib_header.php';
include_once UTILS_PATH.'date.php';
require_once SERVICES_PATH . 'ServiceCalendarAPI.php';

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
        if ($available < 0) {
            $available = 0;
        }

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

<link rel="stylesheet" href="/assets/css/leaflet.css" />

<?php if (empty($upComingData)) : ?>
    <section class="section public-calendar-page">
        <div class="container">
            <div class="d-flex justify-content-center mb-4">
                <div class="public-tab-toggle">
                    <a href="calendar" class="public-tab-toggle-item is-active">
                        <i class="bi bi-calendar3"></i> ปฏิทินให้บริการ
                    </a>
                    <a href="services/mitr" class="public-tab-toggle-item">
                        <i class="bi bi-activity"></i> สถานะการบริการ
                    </a>
                </div>
            </div>
            <div class="public-empty-state">
                <i class="bi bi-calendar-x" aria-hidden="true"></i>
                <p>ขณะนี้ยังไม่มีการให้บริการ โปรดติดตามประกาศจากเว็บไซต์</p>
            </div>
        </div>
    </section>
<?php else: ?>

<section class="section public-calendar-page pb-0">
    <div class="container">
        <div class="d-flex justify-content-center mb-3" data-aos="fade-up">
            <div class="public-tab-toggle">
                <a href="calendar" class="public-tab-toggle-item is-active">
                    <i class="bi bi-calendar3"></i> ปฏิทินให้บริการ
                </a>
                <a href="services/mitr" class="public-tab-toggle-item">
                    <i class="bi bi-activity"></i> สถานะการบริการ
                </a>
            </div>
        </div>
        <p class="public-cal-time-note" data-aos="fade-up">
            <i class="bi bi-clock"></i>
            เปิดรับตัวอย่างดิน <strong>9:00–9:30 น.</strong> (จองล่วงหน้า) และ <strong>9:30–10:00 น.</strong> (walk-in จำนวนจำกัด)
        </p>
    </div>
</section>

<section id="map-section" class="section public-calendar-map-section pt-3">
    <div class="container">
        <div class="public-calendar-map-card">
            <h3><i class="bi bi-map"></i> แผนที่รอบบริการ</h3>
            <div id="map-container" class="public-calendar-map"></div>
        </div>
    </div>
</section>

<section class="section public-calendar-cards-section pt-2">
    <div class="container">
        <div class="row gy-4">
            <?php foreach ($upComingData as $index => $event) :
                $isFull      = $event['isFull'];
                $statusText  = $isFull ? "เต็มแล้ว" : "ว่าง {$event['available']} / {$event['numberOfSamples']} คิว";
                $bookingLink = $isPublicLoggedIn
                    ? "services/book/farmer"
                    : "services/book/login?action=booking&calendarId=" . $event['serviceCalendarId'];
            ?>
                <div class="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="<?= ($index + 1) * 80 ?>">
                    <div class="public-cal-card <?= $isFull ? 'is-full' : 'is-open' ?> <?= ($index === 0) ? 'is-nearest' : '' ?>">
                        <div class="public-cal-card-header">
                            <span class="public-cal-date">
                                <i class="bi bi-calendar-event"></i>
                                <?= thaiDate($event['date']) ?>
                            </span>
                            <div class="public-cal-badges">
                                <?php if ($index === 0): ?>
                                    <span class="public-cal-badge badge-nearest">ล่าสุด</span>
                                <?php endif; ?>
                                <?php if ($isFull): ?>
                                    <span class="public-cal-badge badge-full">เต็ม</span>
                                <?php else: ?>
                                    <span class="public-cal-badge badge-open">ว่าง</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="public-cal-card-body">
                            <p class="public-cal-address">
                                <i class="bi bi-geo-alt"></i>
                                <?= htmlspecialchars($event['fullAddress']) ?>
                            </p>
                            <div class="public-cal-quota <?= $isFull ? 'text-danger' : 'text-success' ?>">
                                <i class="bi bi-people"></i> <?= $statusText ?>
                            </div>
                        </div>
                        <div class="public-cal-card-footer">
                            <a href="<?= $isFull ? '#' : $bookingLink ?>"
                               class="btn public-cal-book-btn <?= $isFull ? 'disabled' : '' ?>"
                               <?= $isFull ? 'onclick="return false;" aria-disabled="true"' : 'data-require-login="true"' ?>>
                                <i class="bi bi-clipboard-check-fill"></i>
                                <?= $isFull ? 'คิวเต็ม' : 'จองเลย' ?>
                            </a>
                            <button type="button" class="btn public-cal-map-btn"
                                    onclick="focusOnMarker(<?= $index ?>)">
                                <i class="bi bi-geo-alt-fill"></i> ที่ตั้ง
                            </button>
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

<?php include_once COMPONENT_PATH.'lib_footer.php'; ?>

<script src="/assets/js/leaflet.js"></script>

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
            <span class="${event.isFull ? 'public-popup-status-full' : 'public-popup-status-open'}">
                ${event.isFull ? 'คิวเต็ม' : `ว่าง ${event.available}/${event.numberOfSamples}`}
            </span>
        `);

        markers.push(marker);
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

function focusOnMarker(index) {
    if (!map || !markers[index]) return;
    const latlng = markers[index].getLatLng();
    map.setView(latlng, 14, { animate: true });
    markers[index].openPopup();
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', initMap);
</script>
