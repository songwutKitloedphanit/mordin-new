<?php
function renderGoogleMapEmbed($latitude, $longitude, $placeName = '') {
    $zoom = 15;
    $width = '100%';
    $height = '300px';
    $lat = (float) $latitude;
    $lng = (float) $longitude;
    // ถ้ามีชื่อสถานที่ ให้ encode แล้วใส่ก่อนละติจูด,ลองจิจูดใน query string
    if ($placeName !== '') {
        $query = urlencode($placeName) . ",{$lat},{$lng}";
    } else {
        $query = "{$lat},{$lng}";
    }

    $mapUrl = htmlspecialchars("https://maps.google.com/maps?q={$query}&z={$zoom}&output=embed", ENT_QUOTES);

    echo "<iframe
            style=\"border:0; width: {$width}; height: {$height};\"
            src=\"{$mapUrl}\"
            frameborder=\"0\"
            allowfullscreen
            loading=\"lazy\"
            referrerpolicy=\"no-referrer-when-downgrade\">
          </iframe>";
}
