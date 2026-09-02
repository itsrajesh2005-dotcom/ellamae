<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

error_reporting(0);
ini_set('display_errors', 0);

function response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit();
}

function image_url($value) {
    if (!is_string($value) || trim($value) === '') return '';
    $value = trim(str_replace('\\', '/', $value));
    if (preg_match('/^(data:image\/|https?:\/\/)/i', $value)) return $value;
    $file = preg_replace('/^(\.\/|\/)?(uploads\/)?/i', '', $value);
    if ($file === '') return '';
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
    return $scheme . '://' . $host . $base . '/uploads/' . $file;
}

function category_slug($name) {
    $map = [
        'Birthday Gifts' => 'birthday-gifts', 'Anniversary Gifts' => 'anniversary-gifts',
        'Wedding Gifts' => 'wedding-gifts', 'Corporate Gifts' => 'corporate-gifts',
        'Personalized Gifts' => 'personalized-gifts', 'Home & Lifestyle' => 'home-lifestyle',
        'Gift Hampers' => 'festive-gift-hampers', 'Festive Gift Hampers' => 'festive-gift-hampers',
        'Utility Products' => 'utility-products', 'Car Accessories' => 'car-accessories'
    ];
    return $map[$name] ?? 'general';
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    response(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id || $id <= 0) {
    response(['status' => 'error', 'message' => 'A valid product id is required'], 400);
}

try {
    // Database connection
    $conn = @new mysqli('localhost', 'root', '', 'ellamae_db');

    if ($conn->connect_error) {
        $conn = @new mysqli('localhost', 'root', '', 'ellamae');
    }

    if ($conn->connect_error) {
        response(['status' => 'error', 'message' => 'DB Connection Failed: ' . $conn->connect_error], 500);
    }

    $conn->set_charset("utf8mb4");

    // 1. Fetch Product
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    if (!$stmt) {
        response(['status' => 'error', 'message' => 'SQL Error: ' . $conn->error], 500);
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $pRow = $result->fetch_assoc();
    $stmt->close();

    if (!$pRow) {
        response(['status' => 'error', 'message' => 'Product not found for ID: ' . $id], 404);
    }

    // 2. Fetch images from product_images table
    $images = [];
    $stmtImg = @$conn->prepare("SELECT image_path FROM product_images WHERE product_id = ? ORDER BY id ASC");
    if ($stmtImg) {
        $stmtImg->bind_param('i', $id);
        $stmtImg->execute();
        $resImg = $stmtImg->get_result();
        while ($rowImg = $resImg->fetch_assoc()) {
            if (!empty($rowImg['image_path'])) {
                $images[] = image_url($rowImg['image_path']);
            }
        }
        $stmtImg->close();
    }

    // Fallback if main products table has images
    if (empty($images)) {
        $rawImage = $pRow['image'] ?? $pRow['images'] ?? $pRow['image_path'] ?? '';
        if (!empty($rawImage)) {
            $decoded = json_decode($rawImage, true);
            if (is_array($decoded)) {
                foreach ($decoded as $img) {
                    $images[] = image_url($img);
                }
            } else {
                $images[] = image_url($rawImage);
            }
        }
    }

    $mainImage = !empty($images[0]) ? $images[0] : '/placeholder.svg';
    if (empty($images)) {
        $images = ['/placeholder.svg'];
    }

    $title = $pRow['title'] ?? $pRow['name'] ?? $pRow['product_title'] ?? ('Product #' . $id);
    $desc = $pRow['description'] ?? $pRow['description_specifications'] ?? '';
    $price = (float)($pRow['price'] ?? 0);
    $stacks = (int)($pRow['stacks'] ?? $pRow['stock'] ?? 10);
    $status = $pRow['status'] ?? 'Active';
    $catName = $pRow['category_name'] ?? 'General';

    $product = [
        'id' => (int) $pRow['id'],
        'name' => $title,
        'title' => $title,
        'product_title' => $title,
        'description' => $desc,
        'description_specifications' => $desc,
        'price' => $price,
        'stacks' => $stacks,
        'status' => $status,
        'category_name' => $catName,
        'category_slug' => category_slug($catName),
        'image' => $mainImage,
        'images' => $images
    ];

    $conn->close();
    response($product);

} catch (Throwable $error) {
    response(['status' => 'error', 'message' => 'Exception: ' . $error->getMessage()], 500);
}
?>