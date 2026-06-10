<?php
require_once __DIR__ . '/../ApiClient.php';

class FactoryAPI
{
    public static function getAllFactories()
    {
        return ApiClient::getJson('factories');
    }

    public static function getFactoryById($id)
    {
        return ApiClient::getJson('factories/' . $id);
    }
}
