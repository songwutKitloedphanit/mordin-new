<?php

require_once __DIR__ . '/../../../utils/date.php';
require_once __DIR__ . '/../../../services/FarmerAPI.php';
require_once __DIR__ . '/../../../services/ServiceCalendarAPI.php';
require_once __DIR__ . '/../../../services/serviceTypeAPI.php';
require_once __DIR__ . '/../../../services/Booking.php';

function publicBookingFindLand($farmerId, $landId)
{
  $landData = FarmerAPI::getLandsByFarmerId($farmerId);

  if (($landData['httpCode'] ?? null) !== 200) {
    return null;
  }

  foreach ($landData['data'] as $land) {
    if ($land['landId'] == $landId) {
      return $land;
    }
  }

  return null;
}

function publicBookingErrorMessage($message)
{
  if (is_array($message)) {
    return implode(', ', $message);
  }

  return $message;
}

function publicBookingLoadPageData($farmerId, $landId, &$currentLand, &$calendars, &$serviceTypes = null)
{
  $currentLand = publicBookingFindLand($farmerId, $landId);
  $calendars = ServiceCalendarAPI::getPublicUpComingCalendar();

  if ($serviceTypes !== null) {
    $serviceTypes = ServiceTypeAPI::getAllServiceTypes();
  }
}

function publicBookingLoadLandOrError($farmerId, $landId, &$currentLand, $errorMessage)
{
  $currentLand = publicBookingFindLand($farmerId, $landId);

  if (!$currentLand) {
    return $errorMessage;
  }

  return null;
}

function publicBookingLoadCalendarsOrError(&$calendars, $errorMessage)
{
  $calendars = ServiceCalendarAPI::getPublicUpComingCalendar();

  if (empty($calendars) || isset($calendars['error'])) {
    $calendars = [];
    return $errorMessage;
  }

  return null;
}

function publicBookingCalendarAddress($cal)
{
  $village = $cal['village'] ?? '-';
  $subdistrict = $cal['subdistrictName'] ?? $cal['subdistrict']['nameTh'] ?? '';
  $district = $cal['districtName'] ?? $cal['subdistrict']['district']['nameTh'] ?? '';
  $province = $cal['provinceName'] ?? $cal['subdistrict']['district']['province']['nameTh'] ?? '';

  return "{$village} ต.{$subdistrict} อ.{$district} จ.{$province}";
}

function publicBookingRenderCalendarOptions($calendars)
{
  foreach ($calendars as $cal) {
    ?>
    <option value="<?= $cal['serviceCalendarId'] ?>">
      <?= htmlspecialchars(thaiDate($cal['date'])) ?>
      — <?= htmlspecialchars(publicBookingCalendarAddress($cal)) ?>
      (รถ<?= htmlspecialchars($cal['bus']['busNumber'] ?? '-') ?>)
    </option>
    <?php
  }
}
