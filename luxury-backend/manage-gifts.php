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
    
    // Check if dynamic multipart form-data configuration or JSON payload context
    if (strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        $action = isset($_POST['action']) ? $_POST['action'] : '';
        $data_source = $_POST;
    } else {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = isset($input['action']) ? $input['action'] : '';
        $data_source = $input;
    }

    if ($action === 'CREATE') {
        $id = $conn->real_escape_string($data_source['id']);
        $name = $conn->real_escape_string($data_source['name']);
        $description = $conn->real_escape_string($data_source['description']);
        $category = $conn->real_escape_string($data_source['category']);
        $price = $conn->real_escape_string($data_source['price']);
        $stock = $conn->real_escape_string($data_source['stock']);
        $best_seller = $conn->real_escape_string($data_source['best_seller']);
        $status = $conn->real_escape_string($data_source['status']);
        
        // --- SECURE PHYSICAL IMAGE UPLOAD SYSTEM ---
        $image_name = "";
        if (isset($_FILES['images']) && $_FILES['images']['error'] === UPLOAD_ERR_OK) {
            $file_tmp = $_FILES['images']['tmp_name'];
            $file_orig_name = $_FILES['images']['name'];
            $file_ext = strtolower(pathinfo($file_orig_name, PATHINFO_EXTENSION));
            
            // Allowed dynamic image asset formats validation check
            $allowed_extensions = array("jpg", "jpeg", "png", "webp");
            
            if (in_array($file_ext, $allowed_extensions)) {
                // Auto generate unique file name mapping token to prevent file replacement issues
                $image_name = "gift_" . time() . "_" . rand(1000, 9999) . "." . $file_ext;
                
                // Absolute target local path setups mapping directory path settings
                $upload_dir = "../public/uploads/";
                
                // Creating directory context dynamic mappings if doesn't exist natively
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }
                
                $upload_target_path = $upload_dir . $image_name;
                
                if (!move_uploaded_file($file_tmp, $upload_target_path)) {
                    echo json_encode(["status" => "error", "message" => "Image asset storage file movement failed."]);
                    exit();
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid asset extension format parsed."]);
                exit();
            }
        } else {
            // Safe fallback value string mapping from fallback string requests
            $image_name = isset($data_source['images']) ? $conn->real_escape_string($data_source['images']) : 'default.jpg';
        }

        // FIXED: Included dynamic verified file storage upload names mapping accurately into table row sequence
        $sql = "INSERT INTO gifts (id, name, description, category, price, stock, best_seller, status, images) 
                VALUES ('$id', '$name', '$description', '$category', '$price', '$stock', '$best_seller', '$status', '$image_name')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Asset record created successfully inside luxury_db table with file upload integration."]);
        } else {
            echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
        }
        exit();
    }

    if ($action === 'UPDATE') {
        $id = $conn->real_escape_string($data_source['id']);
        $name = $conn->real_escape_string($data_source['name']);
        $description = $conn->real_escape_string($data_source['description']);
        $category = $conn->real_escape_string($data_source['category']);
        $price = $conn->real_escape_string($data_source['price']);
        $stock = $conn->real_escape_string($data_source['stock']);
        $best_seller = $conn->real_escape_string($data_source['best_seller']);
        $status = $conn->real_escape_string($data_source['status']);

        // Check if dynamic updates includes replacing existing layout file uploads images components
        if (isset($_FILES['images']) && $_FILES['images']['error'] === UPLOAD_ERR_OK) {
            $file_tmp = $_FILES['images']['tmp_name'];
            $file_orig_name = $_FILES['images']['name'];
            $file_ext = strtolower(pathinfo($file_orig_name, PATHINFO_EXTENSION));
            $allowed_extensions = array("jpg", "jpeg", "png", "webp");
            
            if (in_array($file_ext, $allowed_extensions)) {
                $image_name = "gift_" . time() . "_" . rand(1000, 9999) . "." . $file_ext;
                $upload_dir = "../public/uploads/";
                $upload_target_path = $upload_dir . $image_name;
                
                if (move_uploaded_file($file_tmp, $upload_target_path)) {
                    // Injecting customized new dynamic active files naming mapping query components
                    $sql_image_part = ", images='$image_name'";
                } else {
                    $sql_image_part = "";
                }
            } else {
                $sql_image_part = "";
            }
        } else {
            // Keep existing dynamic string values mapping arrays fields fallback parameters setup
            $images = isset($data_source['images']) ? $conn->real_escape_string($data_source['images']) : '';
            $sql_image_part = $images !== '' ? ", images='$images'" : "";
        }

        $sql = "UPDATE gifts SET name='$name', description='$description', category='$category', price='$price', 
                stock='$stock', best_seller='$best_seller', status='$status' $sql_image_part WHERE id='$id'";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Record metrics updated successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Update Failed: " . $conn->error]);
        }
        exit();
    }

    if ($action === 'DELETE') {
        $id = $conn->real_escape_string($data_source['id']);
        
        $sql = "DELETE FROM gifts WHERE id='$id'";

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