<?php
require_once __DIR__ . '/ApiClient.php';

class serviceAreaAPI
{
    public static function getAllServiceAreas()
    {
        return ApiClient::getJsonResponse('service-areas');
    }

    public static function getServiceAreasByFactory($factoryId)
    {
        return ApiClient::getJsonResponse('service-areas/by-factory/' . $factoryId);
    }
}
