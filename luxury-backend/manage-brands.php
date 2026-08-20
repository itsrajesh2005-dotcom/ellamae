<?php
require_once __DIR__ . '/db_config.php';
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
    $db = getDbConfig();

$conn = new mysqli(
    $db['host'],
    $db['user'],
    $db['pass'],
    $db['name']
);

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

    // Drop category_id column from brands table if it exists (migration to global brands)
    $checkCol = $conn->query("SHOW COLUMNS FROM brands LIKE 'category_id'");
    if ($checkCol && $checkCol->num_rows > 0) {
        $conn->query("ALTER TABLE brands DROP COLUMN category_id");
    }

    // Drop brand_categories table if it exists (migration to global brands)
    $conn->query("DROP TABLE IF EXISTS brand_categories");

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

        $sql = "SELECT b.id, b.name, b.description, b.status, b.banner_image, b.created_at, b.updated_at
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
                    "category_id" => null,
                    "category_ids" => [],
                    "category_name" => null,
                    "is_all_categories" => true,
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

        if (empty($name)) {
            echo json_encode(["status" => "error", "message" => "Brand name is required"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO brands (name, description, status, banner_image) VALUES (?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("ssss", $name, $description, $status, $banner_image);

            if ($stmt->execute()) {
                $brand_id = $conn->insert_id;
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

        if ($id <= 0 || empty($name)) {
            echo json_encode(["status" => "error", "message" => "Brand ID and Name are required for update"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("UPDATE brands SET name = ?, description = ?, status = ?, banner_image = ? WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("ssssi", $name, $description, $status, $banner_image, $id);
            if ($stmt->execute()) {
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