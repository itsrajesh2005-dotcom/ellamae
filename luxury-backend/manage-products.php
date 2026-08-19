<?php
ob_start();
ini_set('display_errors', '0');
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Disable strict error throwing for mysqli if function exists
if (function_exists('mysqli_report')) {
    @mysqli_report(MYSQLI_REPORT_OFF);
}

// Universal Compatibility Layer: Supports both MySQLi and PDO environments seamlessly
if (!class_exists('mysqli')) {
    if (class_exists('PDO')) {
        class mysqli {
            public $connect_error = null;
            public $insert_id = 0;
            public $error = '';
            private $pdo = null;

            public function __construct($host, $user, $pass, $dbname) {
                try {
                    $this->pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]);
                } catch (Exception $e) {
                    $this->connect_error = $e->getMessage();
                }
            }

            public function query($sql) {
                if (!$this->pdo) return false;
                $res = $this->pdo->query($sql);
                if ($res === false) {
                    $err = $this->pdo->errorInfo();
                    $this->error = $err[2] ?? 'Query Error';
                    return false;
                }
                return new mysqli_compat_result($res->fetchAll());
            }

            public function prepare($sql) {
                if (!$this->pdo) return false;
                $stmt = $this->pdo->prepare($sql);
                if (!$stmt) {
                    $err = $this->pdo->errorInfo();
                    $this->error = $err[2] ?? 'Prepare Error';
                    return false;
                }
                return new mysqli_compat_stmt($this->pdo, $stmt, $this);
            }

            public function close() { return true; }
        }

        class mysqli_compat_result {
            private $rows;
            public $num_rows;
            private $index = 0;
            public function __construct($rows) {
                $this->rows = is_array($rows) ? $rows : [];
                $this->num_rows = count($this->rows);
            }
            public function fetch_assoc() {
                if ($this->index < $this->num_rows) {
                    return $this->rows[$this->index++];
                }
                return null;
            }
        }

        class mysqli_compat_stmt {
            private $pdo;
            private $stmt;
            private $conn;
            private $params = [];
            public $error = '';

            public function __construct($pdo, $stmt, $conn) {
                $this->pdo = $pdo;
                $this->stmt = $stmt;
                $this->conn = $conn;
            }

            public function bind_param($types, ...$args) {
                $this->params = $args;
            }

            public function execute() {
                $ok = $this->stmt->execute($this->params);
                if ($ok) {
                    $this->conn->insert_id = intval($this->pdo->lastInsertId());
                } else {
                    $err = $this->stmt->errorInfo();
                    $this->error = $err[2] ?? 'Execute Error';
                }
                return $ok;
            }

            public function get_result() {
                $rows = $this->stmt->fetchAll();
                return new mysqli_compat_result($rows);
            }

            public function close() { return true; }
        }
    }
}

try {
    if (!class_exists('mysqli')) {
        throw new Exception("Neither MySQLi nor PDO extensions are enabled in this PHP environment.");
    }
    /*---------DATABASE CONNECTION---------*/
    $conn = new mysqli("localhost", "root", "", "ellamae_db");

    if ($conn->connect_error) {
        throw new Exception("Database Connection Failed: " . $conn->connect_error);
    }

    /* ---------------- AUTO-CREATE & UPDATE TABLE SCHEMA ---------------- */
    $createProductsTable = "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NULL,
        brand_id INT NULL,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stacks INT NOT NULL DEFAULT 0,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        image_path LONGTEXT
    ) ENGINE=InnoDB;";
    
    $conn->query($createProductsTable);

    // Auto-alter column additions if missing
    $checkBrandCol = $conn->query("SHOW COLUMNS FROM products LIKE 'brand_id'");
    if ($checkBrandCol && $checkBrandCol->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN brand_id INT NULL AFTER category_id");
    }

    $checkCol = $conn->query("SHOW COLUMNS FROM products LIKE 'stacks'");
    if ($checkCol && $checkCol->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN stacks INT NOT NULL DEFAULT 0 AFTER price");
    }

    $checkImgCol = $conn->query("SHOW COLUMNS FROM products LIKE 'image_path'");
    if ($checkImgCol && $checkImgCol->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN image_path LONGTEXT AFTER status");
    }

    // Product Images Table
    $createProductImagesTable = "CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_path LONGTEXT NOT NULL
    ) ENGINE=InnoDB;";
    $conn->query($createProductImagesTable);

    $imageColumns = $conn->query("SHOW COLUMNS FROM product_images");
    $imageColumnNames = [];
    if ($imageColumns) {
        while ($imageColumn = $imageColumns->fetch_assoc()) {
            $imageColumnNames[] = $imageColumn['Field'];
        }
    }
    foreach (['image_url', 'image', 'path', 'file_path'] as $legacyImageColumn) {
        if (in_array($legacyImageColumn, $imageColumnNames, true) && !in_array('image_path', $imageColumnNames, true)) {
            $conn->query("ALTER TABLE product_images CHANGE COLUMN `" . $legacyImageColumn . "` image_path LONGTEXT NOT NULL");
            break;
        }
    }


    /* ---------------- GET / SEARCH PRODUCTS ---------------- */
    if ($_SERVER['REQUEST_METHOD'] == "GET") {
        $search = isset($_GET['search']) ? trim($_GET['search']) : "";
        $searchId = str_replace("ELLAMAE", "", $search);
        $statusParam = isset($_GET['status']) ? trim($_GET['status']) : 'Active';

        $where = [];
        $params = [];
        $types = "";

        if ($statusParam !== 'all') {
            $where[] = "p.status = ?";
            $params[] = $statusParam;
            $types .= "s";
        }

        if ($search != "") {
            $where[] = "(p.title LIKE ? OR p.description LIKE ? OR p.id = ?)";
            $params[] = "%" . $search . "%";
            $params[] = "%" . $search . "%";
            $params[] = is_numeric($searchId) ? intval($searchId) : -1;
            $types .= "ssi";
        }

        $sql = "SELECT p.id, p.category_id, p.brand_id, b.category_id AS brand_category_id, p.title, p.price, p.stacks, p.description, p.status, p.image_path AS main_image, pi.image_path AS rel_image_path 
                FROM products p 
                LEFT JOIN brands b ON p.brand_id = b.id
                LEFT JOIN product_images pi ON p.id = pi.product_id";

        if (count($where) > 0) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY p.id DESC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            if (count($params) > 0) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            
            $products = [];
            while ($row = $result->fetch_assoc()) {
                $product_id = $row['id'];
                if (!isset($products[$product_id])) {
                    $effectiveCatId = !empty($row['category_id']) ? intval($row['category_id']) : intval($row['brand_category_id'] ?? 0);
                    $products[$product_id] = [
                        "id" => intval($row['id']),
                        "category_id" => $effectiveCatId,
                        "brand_id" => intval($row['brand_id'] ?? 0),
                        "title" => $row['title'],
                        "price" => floatval($row['price']),
                        "stacks" => intval($row['stacks'] ?? 0),
                        "description" => $row['description'],
                        "status" => $row['status'],
                        "display_id" => "ELLAMAE" . $row['id'],
                        "images" => []
                    ];
                    if (!empty($row['main_image'])) {
                        $products[$product_id]['images'][] = $row['main_image'];
                    }
                }
                if (!empty($row['rel_image_path']) && !in_array($row['rel_image_path'], $products[$product_id]['images'])) {
                    $products[$product_id]['images'][] = $row['rel_image_path'];
                }
            }

            echo json_encode(array_values($products));
            $stmt->close();
        }
        $conn->close();
        exit();
    }

    /* ---------------- CONTROLLER ROUTER (POST/PUT/DELETE) ---------------- */
    $rawInput = file_get_contents("php://input");
    $input = json_decode($rawInput, true) ?? [];
    
    // Auto-detect HTTP Method if action payload is missing
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $input['action'] ?? '';

    if (empty($action)) {
        if ($method == 'POST') $action = 'CREATE';
        elseif ($method == 'PUT') $action = 'UPDATE';
        elseif ($method == 'DELETE') $action = 'DELETE';
    }

    /* ---------------- ACTION: CREATE ---------------- */
    if ($action == "CREATE") {
        $brand_id = intval($input['brand_id'] ?? 0);
        $category_id = intval($input['category_id'] ?? 0);
        
        // Auto-resolve Category ID from Brands table if category_id isn't provided
        if ($category_id <= 0 && $brand_id > 0) {
            $catLookup = $conn->query("SELECT COALESCE(b.category_id, MIN(bc.category_id)) AS category_id
                FROM brands b LEFT JOIN brand_categories bc ON b.id = bc.brand_id
                WHERE b.id = $brand_id GROUP BY b.id");
            if ($catLookup && $cRow = $catLookup->fetch_assoc()) {
                $category_id = intval($cRow['category_id']);
            }
        }

        $title = $input['title'] ?? '';
        $price = floatval($input['price'] ?? 0.00);
        $stacks = intval($input['stacks'] ?? 0);
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'Active';
        $images = $input['images'] ?? [];
        $primaryImg = (is_array($images) && count($images) > 0) ? $images[0] : '';

        if (empty($title) || $category_id <= 0 || $brand_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Title, category, and brand are required"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO products (category_id, brand_id, title, price, stacks, description, status, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Product insert preparation failed: " . $conn->error);
        }
        $stmt->bind_param("iisdisss", $category_id, $brand_id, $title, $price, $stacks, $description, $status, $primaryImg);

        if ($stmt->execute()) {
                $product_id = $conn->insert_id;
                $stmt->close();

                // Save multiple images
                if (is_array($images) && count($images) > 0) {
                    $stmt2 = $conn->prepare("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)");
                    if ($stmt2) {
                        $imgVal = "";
                        $stmt2->bind_param("is", $product_id, $imgVal);
                        foreach ($images as $img) {
                            if (!empty($img)) {
                                $imgVal = $img;
                                $stmt2->execute();
                            }
                        }
                        $stmt2->close();
                    }
                }

                echo json_encode(["status" => "success", "message" => "Product Added Successfully", "id" => $product_id]);
        } else {
            echo json_encode(["status" => "error", "message" => "SQL Error: " . $stmt->error]);
            $stmt->close();
        }
        $conn->close();
        exit();
    }

    /* ---------------- ACTION: UPDATE ---------------- */
    if ($action == "UPDATE") {
        $id = intval($input['id'] ?? 0);
        $brand_id = intval($input['brand_id'] ?? 0);
        $category_id = intval($input['category_id'] ?? 0);

        if ($category_id <= 0 && $brand_id > 0) {
            $catLookup = $conn->query("SELECT COALESCE(b.category_id, MIN(bc.category_id)) AS category_id
                FROM brands b LEFT JOIN brand_categories bc ON b.id = bc.brand_id
                WHERE b.id = $brand_id GROUP BY b.id");
            if ($catLookup && $cRow = $catLookup->fetch_assoc()) {
                $category_id = intval($cRow['category_id']);
            }
        }

        $title = $input['title'] ?? '';
        $price = floatval($input['price'] ?? 0.00);
        $stacks = intval($input['stacks'] ?? 0);
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'Active';
        $images = isset($input['images']) && is_array($input['images']) ? $input['images'] : [];

        if ($id <= 0 || empty($title) || $category_id <= 0 || $brand_id <= 0) {
            echo json_encode(["status" => "error", "message" => "ID, title, category, and brand are required"]);
            $conn->close();
            exit();
        }

        $hasNewImages = count($images) > 0;

        if ($hasNewImages) {
            $primaryImg = $images[0];
            $stmt = $conn->prepare("UPDATE products SET category_id = ?, brand_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ?, image_path = ? WHERE id = ?");
            if (!$stmt) throw new Exception("Product update preparation failed: " . $conn->error);
            $stmt->bind_param("iisdisssi", $category_id, $brand_id, $title, $price, $stacks, $description, $status, $primaryImg, $id);
            if (!$stmt->execute()) throw new Exception("Product update failed: " . $stmt->error);
            $stmt->close();

            $stmtDel = $conn->prepare("DELETE FROM product_images WHERE product_id = ?");
            if ($stmtDel) {
                $stmtDel->bind_param("i", $id);
                $stmtDel->execute();
                $stmtDel->close();
            }

            $stmt2 = $conn->prepare("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)");
            if ($stmt2) {
                $imgVal = "";
                $stmt2->bind_param("is", $id, $imgVal);
                foreach ($images as $img) {
                    if (!empty($img)) {
                        $imgVal = $img;
                        $stmt2->execute();
                    }
                }
                $stmt2->close();
            }
        } else {
            $stmt = $conn->prepare("UPDATE products SET category_id = ?, brand_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ? WHERE id = ?");
            if (!$stmt) throw new Exception("Product update preparation failed: " . $conn->error);
            $stmt->bind_param("iisdissi", $category_id, $brand_id, $title, $price, $stacks, $description, $status, $id);
            if (!$stmt->execute()) throw new Exception("Product update failed: " . $stmt->error);
            $stmt->close();
        }

        echo json_encode(["status" => "success", "message" => "Product Updated Successfully"]);
        $conn->close();
        exit();
    }

    /* ---------------- ACTION: DELETE ---------------- */
    if ($action == "DELETE") {
        $id = intval($input['id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Product Deleted Successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error deleting: " . $stmt->error]);
            }
            $stmt->close();
        }
        $conn->close();
        exit();
    }

    $conn->close();

} catch (Throwable $e) {
    if (ob_get_level() > 0) ob_clean();
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server exception: " . $e->getMessage()
    ]);
}
?>