<?php
ob_start();
error_reporting(0);
ini_set('display_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
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

    /* ---------------- AUTO-CREATE BRANDS TABLE IF NOT EXISTS ---------------- */
    $createBrandsTable = "CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        banner_image LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;";
    
    if (!$conn->query($createBrandsTable)) {
        throw new Exception("Brands table creation failed: " . $conn->error);
    }

    $brandCategoryColumn = $conn->query("SHOW COLUMNS FROM brands LIKE 'category_id'");
    if ($brandCategoryColumn && $brandCategoryColumn->num_rows === 0) {
        $conn->query("ALTER TABLE brands ADD COLUMN category_id INT NULL");
    }
    $conn->query("CREATE TABLE IF NOT EXISTS brand_categories (
        brand_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (brand_id, category_id),
        INDEX idx_brand_categories_category (category_id)
    ) ENGINE=InnoDB");
    $conn->query("INSERT IGNORE INTO brand_categories (brand_id, category_id)
        SELECT id, category_id FROM brands WHERE category_id IS NOT NULL");

    /* ---------------- GET / SEARCH BRANDS ---------------- */
    if ($_SERVER['REQUEST_METHOD'] == "GET") {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $statusParam = isset($_GET['status']) ? trim($_GET['status']) : 'all';

        $where = [];
        $params = [];
        $types = "";

        if ($statusParam !== 'all') {
            $where[] = "status = ?";
            $params[] = $statusParam;
            $types .= "s";
        }

        if ($search !== "") {
            $where[] = "(name LIKE ? OR description LIKE ? OR id = ?)";
            $params[] = "%" . $search . "%";
            $params[] = "%" . $search . "%";
            $params[] = is_numeric($search) ? intval($search) : -1;
            $types .= "ssi";
        }

        $categoryIdParam = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
        if ($categoryIdParam > 0) {
            $where[] = "(b.category_id = ? OR b.category_id IS NULL OR EXISTS (SELECT 1 FROM brand_categories bc_filter WHERE bc_filter.brand_id = b.id AND bc_filter.category_id = ?))";
            $params[] = $categoryIdParam;
            $params[] = $categoryIdParam;
            $types .= "ii";
        }

        $sql = "SELECT b.id, b.name, b.description, b.status, b.banner_image, b.category_id,
                   b.created_at, b.updated_at,
                         (SELECT GROUP_CONCAT(DISTINCT bc.category_id)
                          FROM brand_categories bc WHERE bc.brand_id = b.id) AS category_ids,
                         (SELECT GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ')
                          FROM brand_categories bc_name
                          INNER JOIN category c ON c.id = bc_name.category_id
                          WHERE bc_name.brand_id = b.id) AS category_name
            FROM brands b";

        if (count($where) > 0) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY b.id DESC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            if (count($params) > 0) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            
            $brands = [];
            while ($row = $result->fetch_assoc()) {
                $brands[] = [
                    "id" => intval($row['id']),
                    "name" => $row['name'],
                    "description" => $row['description'],
                    "status" => $row['status'],
                    "banner_image" => $row['banner_image'],
                    "category_id" => $row['category_id'] !== null ? intval($row['category_id']) : null,
                    "category_ids" => $row['category_ids'] ? array_map('intval', explode(',', $row['category_ids'])) : [],
                    "category_name" => $row['category_name'] ?? null,
                    "is_all_categories" => $row['category_id'] === null && empty($row['category_ids']),
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                ];
            }

            echo json_encode($brands);
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare select query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ---------------- POST CONTROLLER LAYER ---------------- */
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Support direct method execution as well as payload action switching
    $action = isset($input['action']) ? strtoupper($input['action']) : '';

    /* ---------------- ACTION: CREATE / INSERT ---------------- */
    if ($action === "CREATE" || (empty($action) && empty($input['id']))) {
        $name = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'Active';
        $banner_image = $input['banner_image'] ?? '';
        $categoryIds = array_values(array_unique(array_filter(array_map('intval', $input['category_ids'] ?? []), fn($value) => $value > 0)));
        if (count($categoryIds) === 0 && intval($input['category_id'] ?? 0) > 0) $categoryIds[] = intval($input['category_id']);
        $category_id = $categoryIds[0] ?? null;

        if (empty($name)) {
            echo json_encode(["status" => "error", "message" => "Brand name is required"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO brands (name, description, status, banner_image, category_id) VALUES (?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("ssssi", $name, $description, $status, $banner_image, $category_id);

            if ($stmt->execute()) {
                $brand_id = $conn->insert_id;
                if (count($categoryIds) > 0) {
                    $mapping = $conn->prepare("INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES (?, ?)");
                    if ($mapping) {
                        $mapping->bind_param("ii", $brand_id, $mappingCategoryId);
                        foreach ($categoryIds as $mappingCategoryId) $mapping->execute();
                        $mapping->close();
                    }
                }
                echo json_encode(["status" => "success", "message" => "Brand Created Successfully", "id" => $brand_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error creating brand: " . $stmt->error]);
            }
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare insert query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ---------------- ACTION: UPDATE ---------------- */
    if ($action === "UPDATE" || (empty($action) && !empty($input['id']))) {
        $id = intval($input['id'] ?? 0);
        $name = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'Active';
        $banner_image = $input['banner_image'] ?? '';
        $categoryIds = array_values(array_unique(array_filter(array_map('intval', $input['category_ids'] ?? []), fn($value) => $value > 0)));
        if (count($categoryIds) === 0 && intval($input['category_id'] ?? 0) > 0) $categoryIds[] = intval($input['category_id']);
        $category_id = $categoryIds[0] ?? null;

        if ($id <= 0 || empty($name)) {
            echo json_encode(["status" => "error", "message" => "Brand ID and Name are required for update"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("UPDATE brands SET name = ?, description = ?, status = ?, banner_image = ?, category_id = ? WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("ssssii", $name, $description, $status, $banner_image, $category_id, $id);
            if ($stmt->execute()) {
                $conn->query("DELETE FROM brand_categories WHERE brand_id = " . $id);
                if (count($categoryIds) > 0) {
                    $mapping = $conn->prepare("INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES (?, ?)");
                    if ($mapping) {
                        $mapping->bind_param("ii", $id, $mappingCategoryId);
                        foreach ($categoryIds as $mappingCategoryId) $mapping->execute();
                        $mapping->close();
                    }
                }
                echo json_encode(["status" => "success", "message" => "Brand Updated Successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error updating brand: " . $stmt->error]);
            }
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare update query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ---------------- ACTION: DELETE ---------------- */
    if ($action === "DELETE") {
        $id = intval($input['id'] ?? 0);

        if ($id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid Brand ID for deletion"]);
            $conn->close();
            exit();
        }

        $conn->query("DELETE FROM brand_categories WHERE brand_id = " . $id);
        $stmt = $conn->prepare("DELETE FROM brands WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Brand Deleted Successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error deleting brand: " . $stmt->error]);
            }
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare delete query: " . $conn->error);
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