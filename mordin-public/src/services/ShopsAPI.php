<?php
class ShopsAPI {
    private static function getBaseUrl() {
        static $baseUrl = null;
        if ($baseUrl === null) {
            $config = require __DIR__ . '/../config/config.php';
            $baseUrl = $config['api_base_url'];
        }
        return $baseUrl;
    }

    public static function getAllShops() {
        $url = self::getBaseUrl() . 'shops';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        }

        curl_close($ch);
        return json_decode($response, true);
    }

    public static function getImageUrl($imagePath) {
        if (empty($imagePath)) return 'assets/img/mitrphol-logo.png'; // Default placeholder
        // Check if full URL or relative path
        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }
        $baseUrl = self::getBaseUrl();
        // Remove 'api/' suffix if present to get root url for uploads, assumes uploads are served statically
        // But actually the backend serves /shops/uploads/:imageName via API
        // Based on controller: @Get('/uploads/:imageName')

        // If the backend returns /uploads/filename.jpg, we need to prepend API base url but remove the last part if it duplicates?
        // Let's look at controller again: createShopDto.imageUrl = `/uploads/${files[0].filename}`;
        // And controller serves: @Get('/uploads/:imageName') at /shops/uploads/:imageName? No, route is global /shops prefix?
        // Controller is @Controller('shops'). So path is /shops/uploads/:imageName.
        // If DB has /uploads/filename.jpg. We should construct URL: api_base_url + 'shops' + imagePath.
        // Wait, imagePath starts with /uploads/.
        // So: api_base_url + 'shops' + '/uploads/filename.jpg' -> /shops/uploads/filename.jpg.

        // Adjust logic:
        // Api Base Url usually ends with /api/ or /
        // mordin-backend main.ts usually sets prefix 'api'? Let's assume standard behavior.
        // Ideally we just return the path and let frontend handle? No, PHP needs to output full URL or proxy.
        // Let's try to construct it.

        return self::getBaseUrl() . 'shops' . $imagePath;
    }
}
