<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
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
        throw new Exception("Neither MySQLi nor PDO extensions are enabled in this PHP environment. Please install php-mysql or use XAMPP PHP.");
    }
    /* ---------------- DATABASE CONNECTION ---------------- */

    $conn = new mysqli(
        "localhost",
        "root",
        "",
        "ellamae_db"
    );

    if ($conn->connect_error) {
        throw new Exception("Database Connection Failed: " . $conn->connect_error);
    }

    /* ---------------- AUTO-CREATE TABLES IF NOT EXIST ---------------- */
    $createCategoryTable = "CREATE TABLE IF NOT EXISTS category (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        banner_image LONGTEXT,
        brand_id INT DEFAULT NULL
    ) ENGINE=InnoDB;";
    
    if (!$conn->query($createCategoryTable)) {
        throw new Exception("Table creation failed: " . $conn->error);
    }

    $conn->query("ALTER TABLE category MODIFY COLUMN banner_image LONGTEXT");
    
    // Add brand_id column if not exists
    $checkBrandIdCol = $conn->query("SHOW COLUMNS FROM category LIKE 'brand_id'");
    if ($checkBrandIdCol && $checkBrandIdCol->num_rows == 0) {
        $conn->query("ALTER TABLE category ADD COLUMN brand_id INT DEFAULT NULL");
    }

    /* ---------------- GET ALL / SEARCH CATEGORIES ---------------- */

    if ($_SERVER['REQUEST_METHOD'] == "GET") {
        $search = "";
        if (isset($_GET['search'])) {
            $search = trim($_GET['search']);
        }
        
        $statusParam = isset($_GET['status']) ? trim($_GET['status']) : 'Active';
        $brandIdParam = isset($_GET['brand_id']) ? intval($_GET['brand_id']) : 0;

        $where = [];
        $params = [];
        $types = "";

        if ($statusParam !== 'all') {
            $where[] = "c.status = ?";
            $params[] = $statusParam;
            $types .= "s";
        }

        if ($brandIdParam > 0) {
            $where[] = "c.brand_id = ?";
            $params[] = $brandIdParam;
            $types .= "i";
        }

        if ($search != "") {
            $where[] = "(c.name LIKE ? OR c.description LIKE ?)";
            $params[] = "%" . $search . "%";
            $params[] = "%" . $search . "%";
            $types .= "ss";
        }

        $sql = "SELECT c.*, b.name AS brand_name 
                FROM category c 
                LEFT JOIN brands b ON c.brand_id = b.id";
        if (count($where) > 0) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY c.id ASC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            if (count($params) > 0) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            $categories = [];
            while ($row = $result->fetch_assoc()) {
                if (isset($row['brand_id'])) {
                    $row['brand_id'] = intval($row['brand_id']);
                }
                $categories[] = $row;
            }
            echo json_encode($categories);
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare select query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ---------------- CREATE CATEGORY ---------------- */

    if ($_SERVER['REQUEST_METHOD'] == "POST") {
        $input = json_decode(file_get_contents("php://input"), true);
        $action = $input['action'] ?? '';

        if ($action == "CREATE") {
            $name = $input['name'] ?? '';
            $description = $input['description'] ?? '';
            $status = $input['status'] ?? 'Active';
            $banner_image = $input['banner_image'] ?? '';
            $brand_id = isset($input['brand_id']) && intval($input['brand_id']) > 0 ? intval($input['brand_id']) : null;

            if (empty($name)) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Category Name is required"
                ]);
                $conn->close();
                exit();
            }

            $stmt = $conn->prepare("INSERT INTO category (name, description, status, banner_image, brand_id) VALUES (?, ?, ?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("ssssi", $name, $description, $status, $banner_image, $brand_id);
                if ($stmt->execute()) {
                    echo json_encode([
                        "status" => "success",
                        "message" => "Category Added Successfully",
                        "id" => $conn->insert_id,
                        "name" => $name,
                        "description" => $description,
                        "status_val" => $status,
                        "banner_image" => $banner_image,
                        "brand_id" => $brand_id
                    ]);
                } else {
                    echo json_encode([
                        "status" => "error",
                        "message" => "Error adding category: " . $stmt->error
                    ]);
                }
                $stmt->close();
            } else {
                throw new Exception("Failed to prepare insert query: " . $conn->error);
            }
            $conn->close();
            exit();
        }

        /* ---------------- UPDATE CATEGORY ---------------- */

        if ($action == "UPDATE") {
            $id = intval($input['id'] ?? 0);
            $name = $input['name'] ?? '';
            $description = $input['description'] ?? '';
            $status = $input['status'] ?? 'Active';
            $banner_image = $input['banner_image'] ?? '';
            $brand_id = isset($input['brand_id']) && intval($input['brand_id']) > 0 ? intval($input['brand_id']) : null;

            if ($id <= 0 || empty($name)) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Category ID and Name are required"
                ]);
                $conn->close();
                exit();
            }

            $stmt = $conn->prepare("UPDATE category SET name = ?, description = ?, status = ?, banner_image = ?, brand_id = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("ssssii", $name, $description, $status, $banner_image, $brand_id, $id);
                if ($stmt->execute()) {
                    echo json_encode([
                        "status" => "success",
                        "message" => "Category Updated Successfully"
                    ]);
                } else {
                    echo json_encode([
                        "status" => "error",
                        "message" => "Error updating category: " . $stmt->error
                    ]);
                }
                $stmt->close();
            } else {
                throw new Exception("Failed to prepare update query: " . $conn->error);
            }
            $conn->close();
            exit();
        }

        /* ---------------- DELETE CATEGORY ---------------- */

        if ($action == "DELETE") {
            $id = intval($input['id'] ?? 0);

            if ($id <= 0) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid Category ID for deletion"
                ]);
                $conn->close();
                exit();
            }

            $stmt = $conn->prepare("DELETE FROM category WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    echo json_encode([
                        "status" => "success",
                        "message" => "Category Deleted Successfully"
                    ]);
                } else {
                    echo json_encode([
                        "status" => "error",
                        "message" => "Error deleting category: " . $stmt->error
                    ]);
                }
                $stmt->close();
            } else {
                throw new Exception("Failed to prepare delete query: " . $conn->error);
            }
            $conn->close();
            exit();
        }
    }

    $conn->close();

} catch (Throwable $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Server exception: " . $e->getMessage()
    ]);
}
?>