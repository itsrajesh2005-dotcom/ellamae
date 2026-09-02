<?php
ob_start();
error_reporting(0);
ini_set('display_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests from browser
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
                // FIXED: Drop type string so PDO parameters array matches positional placeholders
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

    // Add category_id column to brands if it doesn't exist
    $brandCategoryColumn = $conn->query("SHOW COLUMNS FROM brands LIKE 'category_id'");
    if ($brandCategoryColumn && $brandCategoryColumn->num_rows === 0) {
        $conn->query("ALTER TABLE brands ADD COLUMN category_id INT NULL");
    }

    /* ---------------- AUTO-CREATE brand_categories JUNCTION TABLE ---------------- */
    $conn->query("CREATE TABLE IF NOT EXISTS brand_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand_id INT NOT NULL,
        category_id INT NOT NULL,
        UNIQUE KEY uq_brand_category (brand_id, category_id),
        INDEX idx_brand_categories_brand (brand_id),
        INDEX idx_brand_categories_category (category_id)
    ) ENGINE=InnoDB");

    /* ---------------- HELPER: Get all active category IDs ---------------- */
    $activeCategoryIds = function() use ($conn) {
        $result = $conn->query("SELECT id FROM category WHERE LOWER(status) = 'active'");
        $ids = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) $ids[] = intval($row['id']);
        }
        return $ids;
    };

    /* ---------------- HELPER: Save brand->category mappings in junction table ---------------- */
    $saveCategoryMappings = function($brandId, $categoryIds) use ($conn) {
        if (empty($categoryIds)) return;
        $mapping = $conn->prepare("INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES (?, ?)");
        if (!$mapping) throw new Exception("Failed to prepare brand category mapping: " . $conn->error);
        foreach ($categoryIds as $mappingCategoryId) {
            $mappingCategoryId = intval($mappingCategoryId);
            if ($mappingCategoryId <= 0) continue;
            $mapping->bind_param("ii", $brandId, $mappingCategoryId);
            if (!$mapping->execute()) {
                $mapping->close();
                throw new Exception("Failed to save brand category mapping: " . $mapping->error);
            }
        }
        $mapping->close();
    };

    // Migrate legacy records
    $legacyBrands = $conn->query("SELECT id, category_id FROM brands WHERE category_id IS NOT NULL");
    if ($legacyBrands) {
        while ($legacyBrand = $legacyBrands->fetch_assoc()) {
            $saveCategoryMappings(intval($legacyBrand['id']), [intval($legacyBrand['category_id'])]);
        }
    }

    /* ================== GET / SEARCH BRANDS ================== */
    if ($_SERVER['REQUEST_METHOD'] == "GET") {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $statusParam = isset($_GET['status']) ? trim($_GET['status']) : 'all';

        $categoryIdParam = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
        $categorySlugParam = isset($_GET['category_slug']) ? trim($_GET['category_slug']) : '';

        if ($categorySlugParam !== '' && $categoryIdParam === 0) {
            $slugStmt = $conn->prepare("SELECT id FROM category WHERE LOWER(REPLACE(name, ' ', '-')) = ? OR name = ? LIMIT 1");
            if ($slugStmt) {
                $slugStmt->bind_param("ss", $categorySlugParam, $categorySlugParam);
                $slugStmt->execute();
                $slugResult = $slugStmt->get_result();
                if ($slugRow = $slugResult->fetch_assoc()) {
                    $categoryIdParam = intval($slugRow['id']);
                }
                $slugStmt->close();
            }
        }

        $where = [];
        $params = [];
        $types = "";

        if ($statusParam !== 'all') {
            $where[] = "LOWER(b.status) = LOWER(?)";
            $params[] = $statusParam;
            $types .= "s";
        }

        if ($search !== "") {
            $where[] = "(b.name LIKE ? OR b.description LIKE ? OR b.id = ?)";
            $params[] = "%" . $search . "%";
            $params[] = "%" . $search . "%";
            $params[] = is_numeric($search) ? intval($search) : -1;
            $types .= "ssi";
        }

        if ($categoryIdParam > 0) {
            $where[] = "EXISTS (SELECT 1 FROM brand_categories bc_f WHERE bc_f.brand_id = b.id AND bc_f.category_id = ?)";
            $params[] = $categoryIdParam;
            $types .= "i";
        }

        // Updated Query using LEFT JOIN to safely include category_names without dropping non-linked brands
        $sql = "SELECT b.id, b.name AS brand_name, b.name, b.description, b.status, b.banner_image, b.category_id, b.created_at, b.updated_at,
                       (SELECT GROUP_CONCAT(bc.category_id SEPARATOR ',') FROM brand_categories bc WHERE bc.brand_id = b.id) AS category_ids,
                       (SELECT GROUP_CONCAT(cat.name SEPARATOR ', ') FROM brand_categories bc LEFT JOIN category cat ON bc.category_id = cat.id WHERE bc.brand_id = b.id) AS category_names
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
                $catIds = $row['category_ids'] ? array_values(array_filter(array_map('intval', explode(',', $row['category_ids'])))) : [];
                $brands[] = [
                    "id"               => intval($row['id']),
                    "name"             => $row['brand_name'] ?? $row['name'],
                    "brand_name"       => $row['brand_name'] ?? $row['name'],
                    "description"      => $row['description'] ?? '',
                    "status"           => (strtolower(trim($row['status'])) === 'inactive') ? 'Inactive' : 'Active',
                    "banner_image"     => $row['banner_image'] ?? '',
                    "banner"           => $row['banner_image'] ?? '',
                    "category_id"      => $row['category_id'] !== null ? intval($row['category_id']) : null,
                    "category_ids"     => $catIds,
                    "category_name"    => $row['category_names'] ?? null,
                    "category_names"   => $row['category_names'] ?? null,
                    "is_all_categories"=> ($row['category_id'] === null),
                    "created_at"       => $row['created_at'],
                    "updated_at"       => $row['updated_at']
                ];
            }

            if (ob_get_level() > 0) ob_clean();
            echo json_encode($brands);
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare select query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ================== POST / PUT / DELETE LOGIC ================== */
    $input = json_decode(file_get_contents("php://input"), true);
    $action = isset($input['action']) ? strtoupper($input['action']) : '';

    /* ================== CREATE BRAND ================== */
    if ($action === "CREATE" || ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($action) && empty($input['id']))) {
        $name        = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $rawStatus   = $input['status'] ?? 'Active';
        $status      = (strtolower(trim($rawStatus)) === 'inactive') ? 'Inactive' : 'Active';
        $banner_image = $input['banner_image'] ?? '';

        $categoryIds = array_values(array_unique(array_filter(
            array_map('intval', $input['category_ids'] ?? []),
            fn($v) => $v > 0
        )));
        if (count($categoryIds) === 0 && intval($input['category_id'] ?? 0) > 0) {
            $categoryIds[] = intval($input['category_id']);
        }

        $isAllCategories = count($categoryIds) === 0;
        if ($isAllCategories) $categoryIds = $activeCategoryIds();
        $category_id = $isAllCategories ? null : ($categoryIds[0] ?? null);

        if (empty($name)) {
            if (ob_get_level() > 0) ob_clean();
            echo json_encode(["status" => "error", "message" => "Brand name is required"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO brands (name, description, status, banner_image, category_id) VALUES (?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("ssssi", $name, $description, $status, $banner_image, $category_id);

            if (ob_get_level() > 0) ob_clean();
            if ($stmt->execute()) {
                $brand_id = $conn->insert_id;
                $saveCategoryMappings($brand_id, $categoryIds);
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

    /* ================== UPDATE BRAND ================== */
    if ($action === "UPDATE" || ($_SERVER['REQUEST_METHOD'] === 'PUT' || (!empty($input['id']) && $action !== "DELETE"))) {
        $id          = intval($input['id'] ?? 0);
        $name        = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $rawStatus   = $input['status'] ?? 'Active';
        $status      = (strtolower(trim($rawStatus)) === 'inactive') ? 'Inactive' : 'Active';
        $banner_image = $input['banner_image'] ?? '';

        $categoryIds = array_values(array_unique(array_filter(
            array_map('intval', $input['category_ids'] ?? []),
            fn($v) => $v > 0
        )));
        if (count($categoryIds) === 0 && intval($input['category_id'] ?? 0) > 0) {
            $categoryIds[] = intval($input['category_id']);
        }

        $isAllCategories = count($categoryIds) === 0;
        if ($isAllCategories) $categoryIds = $activeCategoryIds();
        $category_id = $isAllCategories ? null : ($categoryIds[0] ?? null);

        if ($id <= 0 || empty($name)) {
            if (ob_get_level() > 0) ob_clean();
            echo json_encode(["status" => "error", "message" => "Brand ID and Name are required for update"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("UPDATE brands SET name = ?, description = ?, status = ?, banner_image = ?, category_id = ? WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("ssssii", $name, $description, $status, $banner_image, $category_id, $id);
            if (ob_get_level() > 0) ob_clean();
            if ($stmt->execute()) {
                $deleteMappings = $conn->prepare("DELETE FROM brand_categories WHERE brand_id = ?");
                if ($deleteMappings) {
                    $deleteMappings->bind_param("i", $id);
                    $deleteMappings->execute();
                    $deleteMappings->close();
                }
                $saveCategoryMappings($id, $categoryIds);
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

    /* ================== DELETE BRAND ================== */
    if ($action === "DELETE" || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = intval($input['id'] ?? ($_GET['id'] ?? 0));

        if ($id <= 0) {
            if (ob_get_level() > 0) ob_clean();
            echo json_encode(["status" => "error", "message" => "Invalid Brand ID for deletion"]);
            $conn->close();
            exit();
        }

        $conn->query("DELETE FROM brand_categories WHERE brand_id = " . $id);

        $stmt = $conn->prepare("DELETE FROM brands WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $id);
            if (ob_get_level() > 0) ob_clean();
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
        "status"  => "error",
        "message" => "Server exception: " . $e->getMessage()
    ]);
}
?>