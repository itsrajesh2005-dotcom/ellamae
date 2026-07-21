    <?php
    // Custom PHP Router to support both /luxury-backend/... and root endpoints
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    $targetFile = __DIR__ . $uri;
    if (file_exists($targetFile) && !is_dir($targetFile) && $uri !== '/') {
        require $targetFile;
        exit();
    }

    if (strpos($uri, 'manage-categories.php') !== false) {
        require __DIR__ . '/luxury-backend/manage-categories.php';
        exit();
    }

    if (strpos($uri, 'manage-gifts.php') !== false) {
        require __DIR__ . '/luxury-backend/manage-gifts.php';
        exit();
    }

    return false;
