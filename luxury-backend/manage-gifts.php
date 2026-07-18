<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
    exit();
}

// Disable strict error throwing for mysqli (forces it to return false on error)
mysqli_report(MYSQLI_REPORT_OFF);

try {
    /*---------DATABASE CONNECTION---------*/
    $conn = new mysqli("localhost", "root", "", "ellamae_db");

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

    $conn->query("ALTER TABLE gifts ADD COLUMN stacks INT NOT NULL DEFAULT 0 AFTER price");

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
            $params[] = $searchId;
            $types .= "sss";
        }

        $sql = "SELECT g.*, gi.image_path 
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
                        "id" => $row['id'],
                        "category_id" => $row['category_id'],
                        "title" => $row['title'],
                        "price" => $row['price'],
                        "stacks" => intval($row['stacks'] ?? 0),
                        "description" => $row['description'],
                        "status" => $row['status'],
                        "display_id" => "ELLAMAE" . $row['id'],
                        "images" => []
                    ];
                }
                if (!empty($row['image_path'])) {
                    $gifts[$gift_id]['images'][] = $row['image_path'];
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

        if (empty($title) || $category_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Title and Category are required"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO gifts (category_id, title, price, stacks, description, status) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("isdiss", $category_id, $title, $price, $stacks, $description, $status);

            if ($stmt->execute()) {
                $gift_id = $conn->insert_id;
                $stmt->close();

                // Save multiple images into relational table
                if (is_array($images) && count($images) > 0) {
                    $stmt2 = $conn->prepare("INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)");
                    if ($stmt2) {
                        foreach ($images as $img) {
                            if (!empty($img)) {
                                $stmt2->bind_param("is", $gift_id, $img);
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
        $images = $input['images'] ?? []; // Array of images in base64

        if ($id <= 0 || empty($title) || $category_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Missing required update properties"]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("UPDATE gifts SET category_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ? WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("isdissi", $category_id, $title, $price, $stacks, $description, $status, $id);

            if ($stmt->execute()) {
                $stmt->close();

                // Delete all old image records for this gift
                $stmtDel = $conn->prepare("DELETE FROM gift_images WHERE gift_id = ?");
                if ($stmtDel) {
                    $stmtDel->bind_param("i", $id);
                    $stmtDel->execute();
                    $stmtDel->close();
                }

                // Insert updated images array into relational table
                if (is_array($images) && count($images) > 0) {
                    $stmt2 = $conn->prepare("INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)");
                    if ($stmt2) {
                        foreach ($images as $img) {
                            if (!empty($img)) {
                                $stmt2->bind_param("is", $id, $img);
                                $stmt2->execute();
                            }
                        }
                        $stmt2->close();
                    }
                }

                echo json_encode(["status" => "success", "message" => "Gift Updated Successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error updating gift: " . $stmt->error]);
                $stmt->close();
            }
        } else {
            throw new Exception("Failed to prepare update query: " . $conn->error);
        }
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