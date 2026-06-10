<?php
require_once __DIR__ . '/ApiClient.php';

class ServiceCalendarAPI
{
    public static function getUpComingCalendar()
    {
        return ApiClient::getJson('service-calendars/upcoming');
    }

    public static function getPublicUpComingCalendar()
    {
        return ApiClient::getJson('service-calendars/public/upcoming');
    }

    public static function getCalendarById($id)
    {
        return ApiClient::getJson('service-calendars/' . $id);
    }
}
