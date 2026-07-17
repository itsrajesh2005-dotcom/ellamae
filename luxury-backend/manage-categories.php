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
        banner_image LONGTEXT
    ) ENGINE=InnoDB;";
    
    if (!$conn->query($createCategoryTable)) {
        throw new Exception("Table creation failed: " . $conn->error);
    }

    // Alter column to LONGTEXT to make sure base64 image storage does not exceed limits
    $conn->query("ALTER TABLE category MODIFY COLUMN banner_image LONGTEXT");

    /* ---------------- GET ALL / SEARCH CATEGORIES ---------------- */

    if ($_SERVER['REQUEST_METHOD'] == "GET") {
        $search = "";
        if (isset($_GET['search'])) {
            $search = trim($_GET['search']);
        }

        if ($search != "") {
            $sql = "SELECT * FROM category
                    WHERE name LIKE ?
                    OR description LIKE ?
                    ORDER BY id ASC";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $searchParam = "%" . $search . "%";
                $stmt->bind_param("ss", $searchParam, $searchParam);
            }
        } else {
            $sql = "SELECT * FROM category ORDER BY id ASC";
            $stmt = $conn->prepare($sql);
        }

        if ($stmt) {
            $stmt->execute();
            $result = $stmt->get_result();
            $categories = [];
            while ($row = $result->fetch_assoc()) {
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

            if (empty($name)) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Category Name is required"
                ]);
                $conn->close();
                exit();
            }

            $stmt = $conn->prepare("INSERT INTO category (name, description, status, banner_image) VALUES (?, ?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("ssss", $name, $description, $status, $banner_image);
                if ($stmt->execute()) {
                    echo json_encode([
                        "status" => "success",
                        "message" => "Category Added Successfully",
                        "id" => $conn->insert_id,
                        "name" => $name,
                        "description" => $description,
                        "status_val" => $status,
                        "banner_image" => $banner_image
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

            if ($id <= 0 || empty($name)) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Category ID and Name are required"
                ]);
                $conn->close();
                exit();
            }

            $stmt = $conn->prepare("UPDATE category SET name = ?, description = ?, status = ?, banner_image = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("ssssi", $name, $description, $status, $banner_image, $id);
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