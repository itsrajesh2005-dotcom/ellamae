<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

mysqli_report(MYSQLI_REPORT_OFF);
set_error_handler(function ($severity, $message) {
    throw new ErrorException($message, 0, $severity);
});
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && ($error['type'] & (E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR | E_RECOVERABLE_ERROR))) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Unable to load product details'], JSON_UNESCAPED_SLASHES);
        exit();
    }
});

function response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit();
}

function db_config($key, $fallback) {
    $value = getenv($key);
    return ($value !== false && trim($value) !== '') ? $value : $fallback;
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
    return $map[$name] ?? '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') response(['status' => 'error', 'message' => 'Method not allowed'], 405);
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id || $id <= 0) response(['status' => 'error', 'message' => 'A valid product id is required'], 400);

try {
    $conn = new mysqli(db_config('DB_HOST', 'localhost'), db_config('DB_USER', 'root'), db_config('DB_PASS', ''), db_config('DB_NAME', 'ellamae_db'));
    if ($conn->connect_error) throw new Exception('Database connection failed');

    $sql = "SELECT g.id, g.title, g.description, g.price, g.stacks, g.status, c.name AS category_name, gi.image_path
            FROM gifts g
            LEFT JOIN category c ON c.id = g.category_id
            LEFT JOIN gift_images gi ON gi.gift_id = g.id
            WHERE g.id = ?
            ORDER BY gi.id ASC";
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception('Unable to prepare product query');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = null;

    while ($row = $result->fetch_assoc()) {
        if ($product === null) {
            $product = [
                'id' => (int) $row['id'],
                'product_title' => $row['title'] ?? '',
                'description_specifications' => $row['description'] ?? '',
                'price' => (float) $row['price'],
                'stacks' => (int) $row['stacks'],
                'status' => $row['status'],
                'category_name' => $row['category_name'] ?? '',
                'category_slug' => category_slug($row['category_name'] ?? ''),
                'image' => '',
                'images' => []
            ];
        }
        if (!empty($row['image_path'])) {
            $image = image_url($row['image_path']);
            if ($image !== '') {
                $product['images'][] = $image;
                if ($product['image'] === '') $product['image'] = $image;
            }
        }
    }
    $stmt->close();
    $conn->close();
    if ($product === null) response(['status' => 'error', 'message' => 'Product not found'], 404);
    if ($product['image'] === '') $product['image'] = '/placeholder.svg';
    if (empty($product['images'])) $product['images'] = ['/placeholder.svg'];
    response($product);
} catch (Throwable $error) {
    response(['status' => 'error', 'message' => 'Unable to load product details'], 500);
}
?>
