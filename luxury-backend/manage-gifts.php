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
    /*---------DATABASE CONNECTION---------*/
    $conn = new mysqli("192.168.1.79t", "root", "", "ellamae_db");

    if ($conn->connect_error) {
        throw new Exception("Database Connection Failed: " . $conn->connect_error);
    }

    /* ---------------- AUTO-CREATE TABLES IF NOT EXIST ---------------- */
    // 1. Create the main gifts table
    $createGiftsTable = "CREATE TABLE IF NOT EXISTS gifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stacks INT NOT NULL DEFAULT 0,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active'
    ) ENGINE=InnoDB;";
    
    if (!$conn->query($createGiftsTable)) {
        throw new Exception("Gifts table creation failed: " . $conn->error);
    }

    $checkCol = $conn->query("SHOW COLUMNS FROM gifts LIKE 'stacks'");
    if ($checkCol && $checkCol->num_rows == 0) {
        $conn->query("ALTER TABLE gifts ADD COLUMN stacks INT NOT NULL DEFAULT 0 AFTER price");
    } else {
        $conn->query("ALTER TABLE gifts MODIFY COLUMN stacks INT NOT NULL DEFAULT 0");
    }

    $checkImgCol = $conn->query("SHOW COLUMNS FROM gifts LIKE 'image_path'");
    if ($checkImgCol && $checkImgCol->num_rows == 0) {
        $conn->query("ALTER TABLE gifts ADD COLUMN image_path LONGTEXT AFTER status");
    } else {
        $conn->query("ALTER TABLE gifts MODIFY COLUMN image_path LONGTEXT");
    }

    // 2. Create the separate gift_images table for decoupled image storage
    $createGiftImagesTable = "CREATE TABLE IF NOT EXISTS gift_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gift_id INT NOT NULL,
        image_path LONGTEXT NOT NULL,
        FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    
    if (!$conn->query($createGiftImagesTable)) {
        throw new Exception("Gift images table creation failed: " . $conn->error);
    }

    // Ensure gift_images.image_path is LONGTEXT (4GB capacity) in existing tables
    $conn->query("ALTER TABLE gift_images MODIFY COLUMN image_path LONGTEXT NOT NULL");


    /* ---------------- GET / SEARCH GIFTS ---------------- */
    if ($_SERVER['REQUEST_METHOD'] == "GET") {
        $search = "";

        if (isset($_GET['search'])) {
            $search = trim($_GET['search']);
        }

        // Strip out the prefix if the user searches for "ELLAMAE15" so it searches the numeric column for just "15"
        $searchId = str_replace("ELLAMAE", "", $search);

        $statusParam = isset($_GET['status']) ? trim($_GET['status']) : 'Active';
        $categoryIdParam = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;

        $where = [];
        $params = [];
        $types = "";

        if ($statusParam !== 'all') {
            $where[] = "g.status = ?";
            $params[] = $statusParam;
            $types .= "s";
        }

        if ($categoryIdParam > 0) {
            $where[] = "g.category_id = ?";
            $params[] = $categoryIdParam;
            $types .= "i";
        }

        if ($search != "") {
            $where[] = "(g.title LIKE ? OR g.description LIKE ? OR g.id = ?)";
            $params[] = "%" . $search . "%";
            $params[] = "%" . $search . "%";
            $params[] = is_numeric($searchId) ? intval($searchId) : -1;
            $types .= "ssi";
        }

        $sql = "SELECT g.id, g.category_id, g.title, g.price, g.stacks, g.description, g.status, g.image_path AS main_image, gi.image_path AS rel_image_path 
                FROM gifts g 
                LEFT JOIN gift_images gi ON g.id = gi.gift_id";

        if (count($where) > 0) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY g.id DESC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            if (count($params) > 0) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            
            $gifts = [];
            while ($row = $result->fetch_assoc()) {
                $gift_id = $row['id'];
                if (!isset($gifts[$gift_id])) {
                    $gifts[$gift_id] = [
                        "id" => intval($row['id']),
                        "category_id" => intval($row['category_id']),
                        "title" => $row['title'],
                        "price" => floatval($row['price']),
                        "stacks" => intval($row['stacks'] ?? 0),
                        "description" => $row['description'],
                        "status" => $row['status'],
                        "display_id" => "ELLAMAE" . $row['id'],
                        "images" => []
                    ];
                    if (!empty($row['main_image'])) {
                        $gifts[$gift_id]['images'][] = $row['main_image'];
                    }
                }
                if (!empty($row['rel_image_path']) && !in_array($row['rel_image_path'], $gifts[$gift_id]['images'])) {
                    $gifts[$gift_id]['images'][] = $row['rel_image_path'];
                }
            }

            echo json_encode(array_values($gifts));
            $stmt->close();
        } else {
            throw new Exception("Failed to prepare select query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ---------------- POST CONTROLLER LAYER (Action Payload Switcher) ---------------- */
    $input = json_decode(file_get_contents("php://input"), true);
    $action = isset($input['action']) ? $input['action'] : '';

    /* ---------------- ACTION: CREATE ---------------- */
    if ($action == "CREATE") {
        $category_id = intval($input['category_id'] ?? 0);
        $title = $input['title'] ?? '';
        $price = floatval($input['price'] ?? 0.00);
        $stacks = intval($input['stacks'] ?? 0);
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'Active';
        $images = $input['images'] ?? []; // Array of images in base64
        $primaryImg = (is_array($images) && count($images) > 0) ? $images[0] : '';

        if (empty($title) || $category_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Title and Category are required"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO gifts (category_id, title, price, stacks, description, status, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("isdisss", $category_id, $title, $price, $stacks, $description, $status, $primaryImg);

            if ($stmt->execute()) {
                $gift_id = $conn->insert_id;
                $stmt->close();

                // Save multiple images into relational table
                if (is_array($images) && count($images) > 0) {
                    $stmt2 = $conn->prepare("INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)");
                    if ($stmt2) {
                        $imgVal = "";
                        $stmt2->bind_param("is", $gift_id, $imgVal);
                        foreach ($images as $img) {
                            if (!empty($img)) {
                                $imgVal = $img;
                                $stmt2->execute();
                            }
                        }
                        $stmt2->close();
                    }
                }

                echo json_encode(["status" => "success", "message" => "Gift Added Successfully", "id" => $gift_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error adding gift: " . $stmt->error]);
                $stmt->close();
            }
        } else {
            throw new Exception("Failed to prepare insert query: " . $conn->error);
        }
        $conn->close();
        exit();
    }

    /* ---------------- ACTION: UPDATE ---------------- */
    if ($action == "UPDATE") {
        $id = intval($input['id'] ?? 0);
        $category_id = intval($input['category_id'] ?? 0);
        $title = $input['title'] ?? '';
        $price = floatval($input['price'] ?? 0.00);
        $stacks = intval($input['stacks'] ?? 0);
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? 'Active';
        $images = isset($input['images']) && is_array($input['images']) ? $input['images'] : [];

        // Fallback: If category_id is missing or 0, resolve from existing database record
        if ($category_id <= 0 && $id > 0) {
            $catQuery = $conn->query("SELECT category_id FROM gifts WHERE id = $id");
            if ($catQuery && $rowCat = $catQuery->fetch_assoc()) {
                $category_id = intval($rowCat['category_id']);
            }
        }

        if ($id <= 0 || empty($title) || $category_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Missing required update properties"]);
            $conn->close();
            exit();
        }

        $hasNewImages = count($images) > 0;

        if ($hasNewImages) {
            $primaryImg = $images[0];
            $stmt = $conn->prepare("UPDATE gifts SET category_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ?, image_path = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("isdisssi", $category_id, $title, $price, $stacks, $description, $status, $primaryImg, $id);
                $stmt->execute();
                $stmt->close();
            } else {
                throw new Exception("Failed to prepare update query with images: " . $conn->error);
            }

            // Delete old image records for this gift
            $stmtDel = $conn->prepare("DELETE FROM gift_images WHERE gift_id = ?");
            if ($stmtDel) {
                $stmtDel->bind_param("i", $id);
                $stmtDel->execute();
                $stmtDel->close();
            }

            // Insert updated images array into relational table
            $stmt2 = $conn->prepare("INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)");
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
            // Update fields without wiping out existing images
            $stmt = $conn->prepare("UPDATE gifts SET category_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("isdissi", $category_id, $title, $price, $stacks, $description, $status, $id);
                $stmt->execute();
                $stmt->close();
            } else {
                throw new Exception("Failed to prepare update query: " . $conn->error);
            }
        }

        echo json_encode(["status" => "success", "message" => "Gift Updated Successfully"]);
        $conn->close();
        exit();
    }

    /* ---------------- ACTION: DELETE (TARGETED ONLY) ---------------- */
    if ($action == "DELETE") {
        $id = intval($input['id'] ?? 0);

        if ($id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid target tracking log ID"]);
            $conn->close();
            exit();
        }

        // Explicitly deletes only the specific single row target matching the assigned numeric ID
        $stmt = $conn->prepare("DELETE FROM gifts WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Gift Deleted Successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error deleting gift: " . $stmt->error]);
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
    echo json_encode([
        "status" => "error",
        "message" => "Server exception: " . $e->getMessage()
    ]);
}
?>