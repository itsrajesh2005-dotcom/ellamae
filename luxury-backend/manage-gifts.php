<?php
// 1. CRITICAL SECURITY HEADERS - FRONTEND CONNECTIVTY LOOKUP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle browser preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. DATABASE CONFIGURATION CONNECTIONS
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "luxury_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

// 3. READ OPERATION (GET ALL GIFTS)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM gifts ORDER BY id DESC";
    $result = $conn->query($sql);
    $gifts = [];
    
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $gifts[] = $row;
        }
    }
    echo json_encode($gifts);
    exit();
}

// 4. WRITE & MUTATION OPERATIONS (POST REQUESTS)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = isset($input['action']) ? $input['action'] : '';

    if ($action === 'CREATE') {
        $name = $conn->real_escape_string($input['name']);
        $description = $conn->real_escape_string($input['description']);
        $category = $conn->real_escape_string($input['category']);
        $price = $conn->real_escape_string($input['price']);
        $stock = $conn->real_escape_string($input['stock']);
        $best_seller = $conn->real_escape_string($input['best_seller']);
        $status = $conn->real_escape_string($input['status']);
        $images = $conn->real_escape_string($input['images']);

        $sql = "INSERT INTO gifts (name, description, category, price, stock, best_seller, status, images) 
                VALUES ('$name', '$description', '$category', '$price', '$stock', '$best_seller', '$status', '$images')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Asset record created successfully inside luxury_db table."]);
        } else {
            echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
        }
        exit();
    }

    if ($action === 'UPDATE') {
        $id = intval($input['id']);
        $name = $conn->real_escape_string($input['name']);
        $description = $conn->real_escape_string($input['description']);
        $category = $conn->real_escape_string($input['category']);
        $price = $conn->real_escape_string($input['price']);
        $stock = $conn->real_escape_string($input['stock']);
        $best_seller = $conn->real_escape_string($input['best_seller']);
        $status = $conn->real_escape_string($input['status']);
        $images = $conn->real_escape_string($input['images']);

        $sql = "UPDATE gifts SET name='$name', description='$description', category='$category', price='$price', 
                stock='$stock', best_seller='$best_seller', status='$status', images='$images' WHERE id=$id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Record metrics updated successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Update Failed: " . $conn->error]);
        }
        exit();
    }

    if ($action === 'DELETE') {
        $id = intval($input['id']);
        $sql = "DELETE FROM gifts WHERE id=$id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Asset deleted permanently from system records."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Delete Failed: " . $conn->error]);
        }
        exit();
    }
}

$conn->close();
?>