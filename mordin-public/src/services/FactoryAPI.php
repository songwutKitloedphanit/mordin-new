<?php
require_once __DIR__ . '/ApiClient.php';

class factoryAPI
{
    public static function getAllFactories()
    {
        return ApiClient::getJsonResponse('factories');
    }
}
