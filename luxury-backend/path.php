<?php
header("Content-Type: application/json");
echo json_encode([
    "file" => __FILE__,
    "dir" => __DIR__
]);
?>
