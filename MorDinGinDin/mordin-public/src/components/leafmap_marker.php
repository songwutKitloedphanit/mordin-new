<?php
/**
 * map_marker.php
 * ใช้ร่วมกับ Leaflet
 *
 * ตัวแปรที่รองรับ:
 * $mapId        (string)  id ของ div map
 * $mapHeight    (string)  ex. 400px
 * $mapCenter    ([lat,lng]) ค่าเริ่มต้น
 * $mapZoom      (int)
 * $mapMarkers   (array)   [
 *    [
 *      'lat' => 16.3,
 *      'lng' => 102.1,
 *      'popup' => 'ข้อความ'
 *    ]
 * ]
 */

$mapId       = $mapId       ?? 'map';
$mapHeight   = $mapHeight   ?? '400px';
$mapCenter   = $mapCenter   ?? [13.7563, 100.5018];
$mapZoom     = $mapZoom     ?? 10;
$mapMarkers  = $mapMarkers  ?? [];
?>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<div id="<?= $mapId ?>" style="height: <?= $mapHeight ?>; width:100%; border-radius:10px;"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function () {
    const map = L.map('<?= $mapId ?>').setView(
        <?= json_encode($mapCenter) ?>,
        <?= (int)$mapZoom ?>
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const markers = [];

    const data = <?= json_encode($mapMarkers, JSON_UNESCAPED_UNICODE) ?>;

    data.forEach((m, i) => {
        if (!m.lat || !m.lng) return;

        const marker = L.marker([m.lat, m.lng]).addTo(map);

        if (m.popup) {
            marker.bindPopup(m.popup);
        }

        markers.push(marker);
    });

    // expose helper (ใช้จากปุ่มได้)
    window.focusOnMarker = function (index) {
        if (!markers[index]) return;
        map.setView(markers[index].getLatLng(), 15);
        markers[index].openPopup();
    };

    setTimeout(() => map.invalidateSize(), 300);
})();
</script>
