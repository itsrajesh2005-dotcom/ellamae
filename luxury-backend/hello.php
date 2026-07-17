<?php

header("Content-Type: application/json");

$data = [
 "message" => "Hello from PHP!",
 "status" => "success"
];

echo json_encode($data);

