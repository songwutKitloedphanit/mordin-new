<?php
require_once __DIR__ . '/../ApiClient.php';

class ServiceAreaAPI
{
    public static function getAllServiceAreas()
    {
        return ApiClient::getJson('service-areas');
    }
}
